#!/usr/bin/env python3
"""把自托管标题字体 Source Han Serif CN VF（10.4MB）子集化成 700 字重的子集 woff2。

用法（在项目根目录执行，需 python3 + fontTools + brotli）：
    python3 -c "import fontTools, brotli"   # 缺则 pip3 install --user fonttools brotli
    python3 scripts/subset-serif-font.py

做了什么：
  1. 扫描站内真实文本（src/**/*.{ts,tsx,css}, content/**, index.html, public/skill/**），
     收集文本中实际出现的全部字符；
  2. 并入 GB2312 一级常用字 3755 个（用 Python 内置 gb2312 编解码枚举，不联网）∪
     ASCII 可打印字符 ∪ 常用中文标点；
  3. 用 fontTools.varLib.instancer 把 wght 轴固定到 700（全站宋体只用于标题/引文/导航文字）；
  4. 用 pyftsubset 按上面字符集子集化，输出 public/fonts/SourceHanSerifCN-Bold.subset.woff2。

原文件 public/fonts/SourceHanSerifCN-VF.otf.woff2 **保留不删**（是否删除由用户决定）。
站内文案改动后重跑本脚本即可更新子集；跑完记得同步 src/index.css 里 @font-face 的引用。
"""

from __future__ import annotations

import sys
import time
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

ROOT = Path(__file__).resolve().parent.parent
SRC_FONT = ROOT / "public/fonts/SourceHanSerifCN-VF.otf.woff2"
OUT_FONT = ROOT / "public/fonts/SourceHanSerifCN-Bold.subset.woff2"
TARGET_WEIGHT = 700

# 文本来源：只扫内容，不扫 public 下的图片/媒体等二进制目录（skill 文档除外）
SCAN_PATTERNS = (
    "src/**/*.ts",
    "src/**/*.tsx",
    "src/**/*.css",
    "content/**/*.json",
    "content/**/*.md",
    "public/skill/**/*.md",
    "index.html",
)

# 常用中文标点 / 符号（GB2312 一级字表不含标点，标题里会出现）
EXTRA_PUNCT = (
    "　、。，．・；：？！…‥（）〔〕【】《》〈〉「」『』［］｛｝“”‘’"
    "—–～·￥％＃＠＆＊＋－／＼｜＜＞＝≦≧"
)

# ASCII 可打印字符
ASCII = "".join(chr(c) for c in range(0x20, 0x7F))


def collect_site_text() -> set[str]:
    chars: set[str] = set()
    seen_files = 0
    for pattern in SCAN_PATTERNS:
        for path in ROOT.glob(pattern):
            if not path.is_file():
                continue
            try:
                text = path.read_text(encoding="utf-8")
            except (UnicodeDecodeError, OSError):
                continue
            chars |= {ch for ch in text if ch.isprintable() and not ch.isspace()}
            seen_files += 1
    print(f"[1/4] 扫描 {seen_files} 个文本文件，得到 {len(chars)} 个不同字符")
    return chars


def gb2312_level1() -> set[str]:
    """GB2312 一级汉字（3755 个）：区位 16-55 区，字节 0xB0A1-0xD7F9。"""
    chars: set[str] = set()
    for hi in range(0xB0, 0xD8):
        for lo in range(0xA1, 0xFF):
            try:
                chars.add(bytes((hi, lo)).decode("gb2312"))
            except UnicodeDecodeError:
                continue
    return chars


def build_charset() -> str:
    site = collect_site_text()
    level1 = gb2312_level1()
    print(f"[2/4] GB2312 一级汉字 {len(level1)} 个")

    charset = site | level1 | set(EXTRA_PUNCT) | set(ASCII)
    # 去掉代理区/控制字符之外的杂项，保证按码点排序后传给 pyftsubset
    ordered = "".join(sorted(charset))
    hanzi = sum(1 for c in ordered if "\u4e00" <= c <= "\u9fff")
    print(f"      合计字符集 {len(ordered)} 个（其中汉字 {hanzi} 个）")
    return ordered


def main() -> int:
    if not SRC_FONT.exists():
        print(f"源字体不存在：{SRC_FONT}", file=sys.stderr)
        return 1

    text = build_charset()

    t0 = time.time()
    print(f"[3/4] Instancing wght={TARGET_WEIGHT}（CFF2 可变字体，稍慢）…")
    font = TTFont(str(SRC_FONT))
    if "fvar" in font:
        instantiateVariableFont(font, {"wght": TARGET_WEIGHT}, inplace=True, updateFontNames=True)
    else:
        print("      源文件不是可变字体，跳过 instancing（按原字重输出）")

    opts = subset.Options()
    opts.flavor = "woff2"
    opts.layout_features = ["*"]  # 保留 kern / GPOS 等排版特性
    opts.notdef_outline = True
    opts.recalc_bounds = True
    opts.recalc_timestamp = False
    opts.name_IDs = ["*"]
    opts.name_legacy = True
    opts.drop_tables += ["BASE", "VORG", "VVAR", "vhea", "vmtx"]  # 竖排/基线表，站内不用

    print(f"[4/4] Subsetting → {OUT_FONT.relative_to(ROOT)} …")
    subsetter = subset.Subsetter(options=opts)
    subsetter.populate(text=text)
    subsetter.subset(font)
    OUT_FONT.parent.mkdir(parents=True, exist_ok=True)
    subset.save_font(font, str(OUT_FONT), opts)

    before = SRC_FONT.stat().st_size
    after = OUT_FONT.stat().st_size
    print(
        f"      完成，用时 {time.time() - t0:.1f}s；保留 glyph {len(font.getGlyphOrder())} 个\n"
        f"      原文件 {before / 1024 / 1024:.2f} MB → 子集 {after / 1024 / 1024:.2f} MB"
        f"（{after / before * 100:.1f}%）"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
