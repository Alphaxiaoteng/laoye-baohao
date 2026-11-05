import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { ContentBundle } from '../src/types/content'

const FILES: { key: keyof ContentBundle; file: string }[] = [
  { key: 'entries', file: 'entries.json' },
  { key: 'story', file: 'story.json' },
  { key: 'recipes', file: 'recipes.json' },
  { key: 'audio', file: 'audio.json' },
  { key: 'sources', file: 'sources.json' },
  { key: 'media', file: 'media.json' },
]

export function contentDir(): string {
  return resolve(process.cwd(), 'content')
}

function readArray<T>(dir: string, file: string, key: string): T[] {
  try {
    const raw = readFileSync(resolve(dir, file), 'utf8')
    const parsed: unknown = JSON.parse(raw)
    if (Array.isArray(parsed)) return parsed as T[]
    if (parsed && typeof parsed === 'object') {
      const bag = parsed as Record<string, unknown>
      for (const candidate of [key, 'items', 'list', 'data']) {
        if (Array.isArray(bag[candidate])) return bag[candidate] as T[]
      }
    }
    return []
  } catch {
    // 文件缺失或 JSON 有问题时按空内容处理，问答降级但不影响静态页面
    return []
  }
}

/** 服务端只读取 content/ 用于拼提示词，不写回任何内容 */
export function loadContent(dir: string = contentDir()): ContentBundle {
  const bundle = { entries: [], story: [], recipes: [], audio: [], sources: [], media: [] } as ContentBundle
  for (const { key, file } of FILES) {
    ;(bundle as unknown as Record<string, unknown[]>)[key] = readArray<unknown>(dir, file, key)
  }
  return bundle
}
