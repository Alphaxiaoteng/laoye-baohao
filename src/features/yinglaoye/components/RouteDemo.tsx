import { useEffect, useState } from 'react'
import '../route-demo.css'
import { RouteSpace3D } from './RouteSpace3D'

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const apply = () => setReduced(media.matches)
    apply()
    media.addEventListener('change', apply)
    return () => media.removeEventListener('change', apply)
  }, [])
  return reduced
}

/** 首页只有一场。镜头可拖动；减少动态时停在原地，拖动仍然可用。 */
export default function RouteDemo() {
  const reduced = usePrefersReducedMotion()
  return (
    <div className="yl-demo-wrap">
      <p className="yl-orbit-note">一场示意。拖动画面换视角，滚轮拉近拉远。</p>
      <RouteSpace3D reduced={reduced} />
    </div>
  )
}
