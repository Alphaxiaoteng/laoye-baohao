import { PHOTO_CREDITS, PHOTO_NOTE } from '../data'

/**
 * 实拍图授权署名：作者 / 许可证 / Commons 文件页。
 * 只列本模块页面实际用到的四张，照 registry.json 抄录，不做推测。
 */
export default function PhotoCredits() {
  return (
    <section aria-labelledby="photo-credit-title" className="card space-y-2">
      <h2 id="photo-credit-title" className="section-title">
        图片来源与授权
      </h2>
      <ul className="space-y-1.5 text-xs leading-6 text-muted">
        {PHOTO_CREDITS.map((photo) => (
          <li key={photo.source}>
            {photo.label}：{photo.author} ·{' '}
            <a
              href={photo.source}
              target="_blank"
              rel="noopener noreferrer"
              className="link-inline"
            >
              {photo.license}（Wikimedia Commons）
            </a>
          </li>
        ))}
      </ul>
      <p className="text-xs leading-6 text-muted">{PHOTO_NOTE}</p>
    </section>
  )
}
