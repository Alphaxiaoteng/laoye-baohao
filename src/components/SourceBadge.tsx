interface Props {
  ids?: string[]
  className?: string
}

/**
 * 产品展示层不再输出来源编号与来源清单。
 * content/*.json 中的 sourceIds、服务端问答校验与授权登记仍完整保留。
 */
export function SourceBadges(_props: Props) {
  return null
}

export function SourceList(_props: Props) {
  return null
}
