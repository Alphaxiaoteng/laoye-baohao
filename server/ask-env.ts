import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

/**
 * 读取项目根目录的 .env（若存在）。
 * 只在服务端执行：不覆盖已经注入的环境变量，不打印、不返回任何值。
 * 仓库里只提交 .env.example，真实密钥永远不落盘到代码或日志。
 */
export function loadLocalEnv(cwd: string = process.cwd()): void {
  const file = resolve(cwd, '.env')
  if (!existsSync(file)) return

  let raw = ''
  try {
    raw = readFileSync(file, 'utf8')
  } catch {
    return
  }

  for (const line of raw.split(/\r?\n/)) {
    const match = /^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/.exec(line)
    if (!match) continue
    const key = match[1]
    if (!key || process.env[key] !== undefined) continue

    let value = (match[2] ?? '').trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    process.env[key] = value
  }
}
