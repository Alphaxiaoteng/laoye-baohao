import { Link } from 'react-router-dom'

/**
 * 模块内的面包屑：文化馆 / 营老爷·游神 / 当前页。
 * 只做导航，不含文化事实。
 */
export default function Breadcrumb({ current }: { current: string }) {
  // 首页（current 就是模块名）只到模块级，避免「营老爷·游神 / 营老爷·游神」重复
  const isModuleHome = current === '营老爷·游神'
  return (
    <nav aria-label="面包屑" className="text-sm text-muted">
      <Link to="/museum" className="link-inline">
        文化馆
      </Link>
      <span className="mx-2" aria-hidden="true">
        /
      </span>
      {isModuleHome ? (
        <span>{current}</span>
      ) : (
        <>
          <Link to="/museum/yinglaoye" className="link-inline">
            营老爷·游神
          </Link>
          <span className="mx-2" aria-hidden="true">
            /
          </span>
          <span>{current}</span>
        </>
      )}
    </nav>
  )
}
