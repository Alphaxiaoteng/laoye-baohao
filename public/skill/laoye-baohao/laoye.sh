#!/bin/sh
# 老爷保号 · laoye.sh
# 零依赖 CLI：只用 sh + curl + sed/awk，不依赖 node。
#
#   laoye.sh ask "英歌有哪些阵形？"   POST /api/ask，流式打印回答，结束后列出 [S#] 来源
#   laoye.sh health                    GET  /api/health
#
# 环境变量：
#   LAOYE_BASE   服务地址，默认 http://127.0.0.1:7860
#
# 限流：同一 IP 每分钟 6 次（429）；并发排队满时 503。两种状态会自动等待后重试一次。

set -u

BASE=${LAOYE_BASE:-http://127.0.0.1:7860}
BASE=$(printf '%s' "$BASE" | sed 's#/*$##')

TMP=${TMPDIR:-/tmp}
STATUS_FILE="$TMP/laoye-status.$$"
DONE_FILE="$TMP/laoye-done.$$"
DELTA_FILE="$TMP/laoye-delta.$$"
ERROR_FILE="$TMP/laoye-error.$$"
CURL_ERR="$TMP/laoye-curlerr.$$"

cleanup() {
  rm -f "$STATUS_FILE" "$DONE_FILE" "$DELTA_FILE" "$ERROR_FILE" "$CURL_ERR"
}
trap cleanup EXIT
trap 'cleanup; exit 130' INT TERM

usage() {
  cat <<'USAGE'
用法：
  laoye.sh ask "英歌有哪些阵形？"   问站内资料，流式打印回答与 [S#] 来源
  laoye.sh health                   查看服务与内容概况

环境变量：
  LAOYE_BASE   服务地址，默认 http://127.0.0.1:7860

例：
  LAOYE_BASE=https://your.domain laoye.sh ask "工夫茶有哪几道工序？"
USAGE
}

die() {
  printf '%s\n' "$1" >&2
  exit "${2:-1}"
}

# ---- awk 公共部分：从一行 JSON 里取字段 ----
# jstr 取字符串字段（处理 \" \\ \n \t），取不到字符串时退回取数字/布尔字面量。
JSON_AWK='
function jstr(s, k,   pat, i, n, c, out) {
  pat = "\"" k "\":"
  i = index(s, pat)
  if (i == 0) return ""
  i += length(pat); n = length(s)
  while (i <= n && (substr(s, i, 1) == " " || substr(s, i, 1) == "\t")) i++
  if (substr(s, i, 1) != "\"") {
    out = ""
    while (i <= n) {
      c = substr(s, i, 1)
      if (c == "," || c == "}" || c == "]") break
      out = out c; i++
    }
    return out
  }
  i++; out = ""
  while (i <= n) {
    c = substr(s, i, 1)
    if (c == "\\") {
      i++; c = substr(s, i, 1)
      if (c == "n") out = out "\n"
      else if (c == "t") out = out "\t"
      else if (c == "r") out = out ""
      else if (c == "u") { i += 5; continue }
      else out = out c
      i++; continue
    }
    if (c == "\"") break
    out = out c; i++
  }
  return out
}
# jarr 取数组原文（方括号内的内容），跳过字符串里的括号
function jarr(s, k,   pat, i, base, n, c, depth, inq) {
  pat = "\"" k "\":"
  i = index(s, pat)
  if (i == 0) return ""
  i += length(pat); n = length(s)
  while (i <= n && substr(s, i, 1) != "[") i++
  if (i > n) return ""
  base = i + 1; depth = 1; inq = 0; i = base
  while (i <= n) {
    c = substr(s, i, 1)
    if (inq) {
      if (c == "\\") { i += 2; continue }
      if (c == "\"") inq = 0
    } else if (c == "\"") {
      inq = 1
    } else if (c == "[") {
      depth++
    } else if (c == "]") {
      depth--
      if (depth == 0) return substr(s, base, i - base)
    }
    i++
  }
  return ""
}
'

jfield() {
  printf '%s' "${1:-}" | awk -v key="${2:-}" "$JSON_AWK"'
    { s = $0 }
    END { printf "%s", jstr(s, key) }
  '
}

# ---- 引用列表：从 done 事件的 citations 数组里取 id / title / url ----
print_citations() {
  [ -s "$1" ] || return 0
  awk "$JSON_AWK"'
    { s = $0 }
    END {
      arr = jarr(s, "citations")
      gsub(/\},\{/, "\n", arr)
      cnt = split(arr, lines, "\n")
      printed = 0
      for (i = 1; i <= cnt; i++) {
        id = jstr(lines[i], "id")
        if (id == "") continue
        title = jstr(lines[i], "title")
        url = jstr(lines[i], "url")
        if (!printed) { printf "\n资料来源：\n"; printed = 1 }
        printf "  [%s] %s\n", id, title
        if (url != "") printf "        %s\n", url
      }
      if (!printed) printf "\n（这条回答没有引用来源编号）\n"
    }
  ' "$1"
}

# ---- 站内条目：done 事件里的 navs（相对路径 + BASE 拼成可点链接） ----
print_navs() {
  [ -s "$1" ] || return 0
  awk -v base="$BASE" "$JSON_AWK"'
    { s = $0 }
    END {
      arr = jarr(s, "navs")
      if (arr == "") exit 0
      gsub(/\},\{/, "\n", arr)
      cnt = split(arr, lines, "\n")
      printed = 0
      for (i = 1; i <= cnt; i++) {
        id = jstr(lines[i], "entryId")
        if (id == "") continue
        if (!printed) { printf "站内条目：\n"; printed = 1 }
        printf "  《%s》 %s%s\n", jstr(lines[i], "title"), base, jstr(lines[i], "path")
      }
    }
  ' "$1"
}

# ---- SSE 解析：delta 直接打印，done / error 落盘 ----
parse_stream() {
  ev=""
  while IFS= read -r line || [ -n "$line" ]; do
    case $line in
      __LAOYE_HTTP__*)
        printf '%s' "${line#__LAOYE_HTTP__}" >"$STATUS_FILE"
        ;;
      event:*)
        ev=$(printf '%s' "${line#event:}" | sed 's/^[[:space:]]*//; s/[[:space:]]*$//')
        ;;
      data:*)
        payload=${line#data:}
        payload=$(printf '%s' "$payload" | sed 's/^[[:space:]]*//')
        case $ev in
          delta)
            # 增量里可能带 [[nav:id]] 标记（done 阶段才换成《标题》）：
            # 这里换成《站内条目》，末尾再用 navs 列出可点链接，避免出现半句话
            chunk=$(jfield "$payload" text | sed 's/\[\[nav:[^]]*\]\]/《站内条目》/g')
            if [ -n "$chunk" ]; then
              printf 'delta' >"$DELTA_FILE"
              printf '%s' "$chunk"
            fi
            ;;
          error)
            printf '\n[错误] %s（%s）\n' \
              "$(jfield "$payload" message)" "$(jfield "$payload" code)" >&2
            printf 'error' >"$ERROR_FILE"
            ;;
          done)
            printf '%s' "$payload" >"$DONE_FILE"
            ;;
        esac
        ;;
      '')
        ev=""
        ;;
    esac
  done
}

# 问题转义成 JSON 字符串内容
json_escape() {
  printf '%s' "$1" \
    | sed -e 's/\\/\\\\/g' -e 's/"/\\"/g' -e 's/	/ /g' \
    | awk 'BEGIN{ ORS = "" } { if (NR > 1) printf "\\n"; printf "%s", $0 }'
}

do_ask() {
  question=${1:-}
  [ -n "$question" ] || die "缺少问题。例如：laoye.sh ask \"英歌有哪些阵形？\"" 2

  payload=$(json_escape "$question")
  attempt=1
  max_attempts=2

  while [ "$attempt" -le "$max_attempts" ]; do
    rm -f "$STATUS_FILE" "$DONE_FILE" "$DELTA_FILE" "$ERROR_FILE" "$CURL_ERR"

    curl -sS -N --max-time 120 -X POST "$BASE/api/ask" \
      -H 'content-type: application/json' \
      -H 'accept: text/event-stream' \
      --data "{\"question\":\"$payload\",\"context\":{}}" \
      -w '\n__LAOYE_HTTP__%{http_code}\n' 2>"$CURL_ERR" \
      | parse_stream

    status=$(cat "$STATUS_FILE" 2>/dev/null || printf '')

    if [ -z "$status" ]; then
      printf '\n' >&2
      [ -s "$CURL_ERR" ] && cat "$CURL_ERR" >&2
      die "无法连接 ${BASE}（服务未启动或地址不对；用 LAOYE_BASE 指定地址）" 1
    fi

    case $status in
      200)
        break
        ;;
      429|503)
        if [ "$attempt" -ge "$max_attempts" ]; then
          die "接口繁忙（HTTP ${status}），重试一次仍失败，请稍后再试。" 3
        fi
        if [ "$status" = "429" ]; then
          printf '\n[限流] 同一 IP 每分钟最多 6 次提问，62 秒后重试一次…\n' >&2
          sleep 62
        else
          printf '\n[繁忙] 服务排队已满（HTTP 503），8 秒后重试一次…\n' >&2
          sleep 8
        fi
        attempt=$((attempt + 1))
        ;;
      000)
        printf '\n' >&2
        [ -s "$CURL_ERR" ] && cat "$CURL_ERR" >&2
        die "无法连接 ${BASE}（服务未启动或地址不对；用 LAOYE_BASE 指定地址）" 1
        ;;
      *)
        printf '\n[错误] HTTP %s %s\n' "$status" "$(cat "$ERROR_FILE" 2>/dev/null || printf '')" >&2
        die "请求失败（HTTP ${status}）。" 3
        ;;
    esac
  done

  # 确定性回答（实时 / 澄清 / 导航）只发 done、不发 delta：这时直接打印全文
  if [ ! -s "$DELTA_FILE" ] && [ -s "$DONE_FILE" ]; then
    printf '%s' "$(jfield "$(cat "$DONE_FILE")" text)"
  fi

  printf '\n'
  print_citations "$DONE_FILE"
  print_navs "$DONE_FILE"
}

do_health() {
  body=$(curl -sS --max-time 20 -w '\n__LAOYE_HTTP__%{http_code}' "$BASE/api/health" 2>"$CURL_ERR") || {
    [ -s "$CURL_ERR" ] && cat "$CURL_ERR" >&2
    die "无法连接 ${BASE}（服务未启动或地址不对；用 LAOYE_BASE 指定地址）" 1
  }
  status=$(printf '%s' "$body" | sed -n 's/.*__LAOYE_HTTP__\([0-9]*\)$/\1/p')
  json=$(printf '%s' "$body" | sed 's/__LAOYE_HTTP__[0-9]*$//')
  if [ "$status" != "200" ]; then
    die "健康检查失败（HTTP ${status:-unknown}）：$json" 3
  fi
  printf '%s' "$json" | awk -v base="$BASE" "$JSON_AWK"'
    { s = $0 }
    END {
      printf "地址      %s\n", base
      printf "状态      %s\n", jstr(s, "status")
      printf "模型      %s（上游 %s，密钥 %s）\n", jstr(s, "model"), jstr(s, "endpoint"), jstr(s, "keyConfigured")
      printf "内容      条目 %s / 故事 %s / 食谱 %s / 听潮 %s / 来源 %s\n", \
        jstr(s, "entries"), jstr(s, "story"), jstr(s, "recipes"), jstr(s, "audio"), jstr(s, "sources")
      printf "并发      运行 %s / 排队 %s\n", jstr(s, "running"), jstr(s, "queued")
    }
  '
}

cmd=${1:-}
case $cmd in
  ask)
    shift
    do_ask "${1:-}"
    ;;
  health)
    do_health
    ;;
  ''|-h|--help|help)
    usage
    ;;
  *)
    usage >&2
    exit 2
    ;;
esac
