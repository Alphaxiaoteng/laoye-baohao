import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

/**
 * 首页拼贴展品的统一动效运行时。
 *
 * 复用项目已有 GSAP / ScrollTrigger，不为每个板块重复写动画：
 * - [data-reveal]：一章进入视口时轻轻落定（不改变透明度，动画失败也不藏内容）。
 * - [data-depth]：鼠标视差，数值通常在 -1.5 到 1.5 之间；同时挂一条滚动擦洗，
 *   只用滚轮也能看到各层错动（走 CSS 变量 --depth-shift，不抢鼠标视差的 x/y）。
 * - [data-crossfade]：直接子图片以 1.2 秒淡切、每帧停留约 5 秒。
 * - 根节点 data-active：悬停或键盘聚焦时置为 true，供 CSS 切换 GIF / 细节层。
 * - 首屏（.home-intro）额外一条镜头推进转场：离开首屏时文案上浮淡出。
 *
 * 减少动态偏好下停用位移；触屏直接展示动图，键盘聚焦不受指针类型影响。
 */
export function useCollageMotion<T extends HTMLElement>() {
  const scopeRef = useRef<T>(null)

  useEffect(() => {
    const root = scopeRef.current
    if (!root) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const finePointer = window.matchMedia('(pointer: fine)').matches
    if (reduced) {
      root.dataset.motion = 'reduced'
      return
    }

    gsap.registerPlugin(ScrollTrigger)
    let crossfade: gsap.core.Timeline | undefined
    let removePointerListeners: (() => void) | undefined
    let disposed = false

    const focus = () => {
      root.dataset.active = 'true'
    }
    const blur = (event: FocusEvent) => {
      if (!root.contains(event.relatedTarget as Node | null)) root.dataset.active = 'false'
    }
    root.addEventListener('focusin', focus)
    root.addEventListener('focusout', blur)

    const ctx = gsap.context(() => {
      const isIntro = root.classList.contains('home-intro')
      // 首屏文案交给下面的镜头推进接管，这里不再用 reveal 的 scale 去抢它的 transform。
      const reveal = gsap.utils
        .toArray<HTMLElement>('[data-reveal]', root)
        .filter((node) => !(isIntro && node.classList.contains('home-intro-copy')))
      if (reveal.length > 0) {
        // scale 只到 0.985，绝不设置 opacity: 0——首页任何情况下都必须看得见内容。
        gsap.from(reveal, {
          y: 22,
          scale: 0.985,
          duration: 0.9,
          stagger: 0.04,
          ease: 'power2.out',
          // 首屏永远在视口里，直接播；其余章节等滚到 76% 再落定。
          ...(isIntro ? {} : { scrollTrigger: { trigger: root, start: 'top 76%', once: true } }),
        })
      }

      // 连续滚动擦洗：板块从视口底部滚向顶部时，图框按 data-depth 分层错动。
      // 走 yPercent（GSAP 自己的通道）而不是 CSS translate——reveal 的 scale 会写
      // 内联 translate: none，把 CSS 那条通道整条掐掉；yPercent 则与鼠标视差的 y 相加。
      for (const layer of gsap.utils.toArray<HTMLElement>('[data-depth]', root)) {
        const depth = Number(layer.dataset.depth || 0)
        if (!depth) continue
        const percent = (ratio: number) => () => {
          const height = layer.offsetHeight || 1
          return (depth * 28 * ratio * 100) / height
        }
        gsap.fromTo(
          layer,
          { yPercent: percent(1) },
          {
            yPercent: percent(-1),
            ease: 'none',
            scrollTrigger: {
              trigger: root,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 0.65,
              invalidateOnRefresh: true,
            },
          },
        )
      }

      // 首屏镜头推进：只作用于文案，不碰滚轮本身，也不藏首屏标题。
      if (isIntro) {
        const copy = root.querySelector<HTMLElement>('.home-intro-copy')
        if (copy) {
          gsap.fromTo(
            copy,
            { y: 0, opacity: 1 },
            {
              y: -36,
              opacity: 0.78,
              ease: 'none',
              immediateRender: false,
              scrollTrigger: { trigger: root, start: 'top top', end: 'bottom top', scrub: 0.5 },
            },
          )
        }
      }

      const frames = gsap.utils.toArray<HTMLElement>('[data-crossfade] > img', root)
      if (frames.length > 1) {
        gsap.set(frames, { opacity: 0 })
        gsap.set(frames[0], { opacity: 1 })
        crossfade = gsap.timeline({ repeat: -1 })
        frames.forEach((frame, index) => {
          const next = frames[(index + 1) % frames.length]
          crossfade!
            .to(frame, { opacity: 0, duration: 1.2, ease: 'power2.inOut' }, '+=4.8')
            .to(next, { opacity: 1, duration: 1.2, ease: 'power2.inOut' }, '<')
        })
      }

      if (finePointer) {
        const layers = gsap.utils.toArray<HTMLElement>('[data-depth]', root).map((layer) => {
          const depth = Number(layer.dataset.depth || 0)
          return {
            x: gsap.quickTo(layer, 'x', { duration: 0.65, ease: 'power3.out' }),
            y: gsap.quickTo(layer, 'y', { duration: 0.65, ease: 'power3.out' }),
            depth,
          }
        })

        let rect = root.getBoundingClientRect()
        const cacheRect = () => {
          rect = root.getBoundingClientRect()
        }
        const move = (event: PointerEvent) => {
          const nx = ((event.clientX - rect.left) / rect.width - 0.5) * 2
          const ny = ((event.clientY - rect.top) / rect.height - 0.5) * 2
          layers.forEach(({ x, y, depth }) => {
            x(nx * depth * 24)
            y(ny * depth * 16)
          })
        }
        const leave = () => {
          root.dataset.active = 'false'
          layers.forEach(({ x, y }) => {
            x(0)
            y(0)
          })
        }
        const enter = () => {
          cacheRect()
          root.dataset.active = 'true'
        }

        root.addEventListener('pointermove', move)
        root.addEventListener('pointerenter', enter)
        root.addEventListener('pointerleave', leave)
        window.addEventListener('resize', cacheRect)
        window.addEventListener('scroll', cacheRect, { passive: true })
        root.dataset.active = 'false'

        removePointerListeners = () => {
          root.removeEventListener('pointermove', move)
          root.removeEventListener('pointerenter', enter)
          root.removeEventListener('pointerleave', leave)
          window.removeEventListener('resize', cacheRect)
          window.removeEventListener('scroll', cacheRect)
        }
      } else {
        // 手机没有 hover，直接展示小体积 GIF；减少动态分支仍保持静图。
        root.dataset.active = 'true'
      }
    }, root)

    const visibility = () => {
      if (disposed || !crossfade) return
      if (document.hidden) crossfade.pause()
      else crossfade.resume()
    }
    document.addEventListener('visibilitychange', visibility)

    return () => {
      disposed = true
      document.removeEventListener('visibilitychange', visibility)
      root.removeEventListener('focusin', focus)
      root.removeEventListener('focusout', blur)
      removePointerListeners?.()
      crossfade?.kill()
      ctx.revert()
    }
  }, [])

  return scopeRef
}
