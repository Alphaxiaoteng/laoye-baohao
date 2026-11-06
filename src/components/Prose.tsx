import type { ReactNode } from 'react'
import './Prose.css'

/** 小型、安全的 Markdown 子集：标题、段落、列表、引用、粗体与行内代码。
 * 所有内容都作为 React 文本节点渲染，不注入 HTML，不引第三方依赖。
 */
export function Prose({ text, className = '' }: { text: string; className?: string }) {
  return <div className={`prose ${className}`.trim()}>{parseBlocks(text)}</div>
}

function inline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).filter(Boolean).map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) return <strong key={index}>{part.slice(2, -2)}</strong>
    if (part.startsWith('`') && part.endsWith('`')) return <code key={index}>{part.slice(1, -1)}</code>
    return part
  })
}

function parseBlocks(text: string): ReactNode[] {
  const lines = text.replace(/\r\n?/g, '\n').split('\n')
  const blocks: ReactNode[] = []
  let key = 0
  let index = 0

  while (index < lines.length) {
    const line = lines[index].trim()
    if (!line) { index += 1; continue }

    const heading = line.match(/^(#{1,4})\s+(.+)$/)
    if (heading) {
      const level = Math.min(heading[1].length + 2, 6)
      const Tag = `h${level}` as 'h3' | 'h4' | 'h5' | 'h6'
      blocks.push(<Tag key={key++}>{inline(heading[2])}</Tag>)
      index += 1
      continue
    }

    if (/^[-*]\s+/.test(line)) {
      const items: string[] = []
      while (index < lines.length && /^[-*]\s+/.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^[-*]\s+/, ''))
        index += 1
      }
      blocks.push(<ul key={key++}>{items.map((item, i) => <li key={i}>{inline(item)}</li>)}</ul>)
      continue
    }

    if (/^\d+[.)]\s+/.test(line)) {
      const items: string[] = []
      while (index < lines.length && /^\d+[.)]\s+/.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^\d+[.)]\s+/, ''))
        index += 1
      }
      blocks.push(<ol key={key++}>{items.map((item, i) => <li key={i}>{inline(item)}</li>)}</ol>)
      continue
    }

    if (/^>\s?/.test(line)) {
      const quote: string[] = []
      while (index < lines.length && /^>\s?/.test(lines[index].trim())) {
        quote.push(lines[index].trim().replace(/^>\s?/, ''))
        index += 1
      }
      blocks.push(<blockquote key={key++}>{inline(quote.join(' '))}</blockquote>)
      continue
    }

    const paragraph: string[] = [line]
    index += 1
    while (index < lines.length) {
      const next = lines[index].trim()
      if (!next || /^(#{1,4}\s+|[-*]\s+|\d+[.)]\s+|>\s?)/.test(next)) break
      paragraph.push(next)
      index += 1
    }
    blocks.push(<p key={key++}>{inline(paragraph.join(' '))}</p>)
  }
  return blocks
}
