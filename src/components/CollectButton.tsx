import { useJournalStore } from '../store/journal'

interface Props {
  id: string
  label?: string
}

export default function CollectButton({ id, label = '收藏到我的手记' }: Props) {
  const collected = useJournalStore((s) => s.collected.includes(id))
  const toggle = useJournalStore((s) => s.toggleCollect)
  return (
    <button
      type="button"
      className={collected ? 'btn-secondary' : 'btn-quiet'}
      onClick={() => toggle(id)}
      aria-pressed={collected}
    >
      <span aria-hidden="true">{collected ? '★' : '☆'}</span>
      {collected ? '已收藏' : label}
    </button>
  )
}
