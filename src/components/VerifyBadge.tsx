import { verifyLabel, isVerified } from '../lib/content'

const TONE: Record<string, string> = {
  verified: 'border-ink/25 bg-ink/10 text-ink',
  'pending-source': 'border-brick/40 bg-brick/10 text-brick',
  'draft-needs-local-review': 'border-amber-600/30 bg-amber-500/10 text-amber-800',
  'fetch-failed': 'border-amber-600/30 bg-amber-500/10 text-amber-800',
}

interface Props {
  verify?: string
  /** 紧凑模式用于列表 */
  compact?: boolean
  className?: string
}

/**
 * 核验状态徽标。verify 不是 verified 时一定显示，避免读者误以为内容已经核验。
 */
export default function VerifyBadge({ verify, compact = false, className = '' }: Props) {
  const ok = isVerified(verify)
  const label = verifyLabel(verify)
  const tone = TONE[verify ?? ''] ?? 'border-line bg-white/70 text-muted'
  return (
    <span
      className={[
        'inline-flex items-center gap-1 rounded-[6px] border px-2.5 text-xs leading-6',
        compact ? 'min-h-[24px] py-0' : 'min-h-[28px]',
        ok ? TONE.verified : tone,
        className,
      ].join(' ')}
      title={ok ? '该条目已登记可靠来源' : '内容尚未完成核验，请对照来源页谨慎参考'}
    >
      <span aria-hidden="true" className="text-[10px]">
        {ok ? '✓' : '!'}
      </span>
      {label}
    </span>
  )
}
