import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { usePageTitle } from '../../lib/usePageContext'
import HeroPreloader from './HeroPreloader'
import HomeParticles from './HomeParticles'
import './home.css'

/** 汕头市文化馆首页两张横幅。印章已改成「潮汕文化」，见 public/media/home/ASSETS.md。 */
const BANNERS = [
  {
    src: '/media/home/hero/banner-yingge.webp',
    alt: '英歌队伍在亭台前起舞，画面书法为英歌舞，印章为潮汕文化',
    width: 1920,
    height: 500,
  },
  {
    src: '/media/home/hero/banner-chaoju.webp',
    alt: '潮剧扮相与梅花，画面书法为潮剧，印章为潮汕文化',
    width: 1920,
    height: 500,
  },
] as const

/** 四个进馆入口。图都是站内已登记的实拍，说明沿用各处已有说法。 */
const DOORS = [
  {
    key: 'yingge',
    name: '英歌',
    to: '/museum/yingge',
    src: '/media/home/wall/01.webp',
    alt: '英歌队员画着脸谱、手持木槌对击',
    width: 1000,
    height: 1000,
  },
  {
    key: 'tea',
    name: '工夫茶',
    to: '/museum/tea',
    src: '/media/home/wall/10.webp',
    alt: '手执茶壶在雕字茶盘上冲泡',
    width: 1000,
    height: 1000,
  },
  {
    key: 'food',
    name: '美食',
    to: '/museum/food',
    src: '/media/home/wall/14.webp',
    alt: '几只卤好的鹅并排挂着，表皮油亮',
    width: 1000,
    height: 1000,
  },
  {
    key: 'yinglaoye',
    name: '营老爷',
    to: '/museum/yinglaoye',
    src: '/media/home/wall/24.webp',
    alt: '巡游队伍抬着神轿走过街道',
    width: 1000,
    height: 1000,
  },
] as const

/** 横幅自动轮播间隔：3 秒。 */
const SLIDE_MS = 3000

export default function HomeHero() {
  usePageTitle('潮汕文化互动馆')
  const panoramaRef = useRef<HTMLImageElement>(null)
  const [ready, setReady] = useState(false)
  const [slideIndex, setSlideIndex] = useState(0)
  const activeBanner = BANNERS[slideIndex]

  useEffect(() => {
    const finish = () => setReady(true)
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const img = panoramaRef.current
    if (reduced || (img?.complete && img.naturalWidth > 0)) finish()
    img?.addEventListener('load', finish)
    img?.addEventListener('error', finish)
    const cap = window.setTimeout(finish, 1600)
    return () => {
      window.clearTimeout(cap)
      img?.removeEventListener('load', finish)
      img?.removeEventListener('error', finish)
    }
  }, [])

  // 两张横幅每 3 秒自动切换；减少动态偏好下保持首图。
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined
    const timer = window.setInterval(
      () => setSlideIndex((index) => (index + 1) % BANNERS.length),
      SLIDE_MS,
    )
    return () => window.clearInterval(timer)
  }, [])

  return (
    <section className="home-gallery" aria-label="老爷保号首页">
      <HomeParticles />
      <HeroPreloader panorama={activeBanner.src} />

      <article className="home-intro" aria-label="首页横幅">
        <div
          className="home-banner"
          data-ready={ready ? 'true' : 'false'}
          aria-busy={ready ? undefined : true}
        >
          {BANNERS.map((banner, index) => (
            <img
              key={banner.src}
              ref={index === 0 ? panoramaRef : undefined}
              src={banner.src}
              alt={banner.alt}
              aria-hidden={index !== slideIndex}
              data-active={index === slideIndex ? 'true' : 'false'}
              width={banner.width}
              height={banner.height}
              decoding="async"
              fetchPriority={index === 0 ? 'high' : 'low'}
            />
          ))}
        </div>

        <nav className="home-doors" aria-label="四个进馆入口">
          {DOORS.map((door) => (
            <Link key={door.key} className="home-door" to={door.to}>
              <span className="home-door-media">
                <img
                  src={door.src}
                  alt={door.alt}
                  width={door.width}
                  height={door.height}
                  decoding="async"
                />
              </span>
              <span className="home-door-name">{door.name}</span>
            </Link>
          ))}
        </nav>
      </article>

    </section>
  )
}
