import { useEffect } from 'react'
import { Link, Route, Routes, useLocation } from 'react-router-dom'
import Nav from './components/Nav'
import StorageNotice from './components/StorageNotice'
import AudioPlayerProvider from './components/AudioPlayerProvider'
import AskDrawer from './components/AskDrawer'
import StoryIndex from './routes/StoryIndex'
import StoryChapterPage from './routes/StoryChapter'
import MuseumIndex from './routes/MuseumIndex'
import ModulePage from './routes/ModulePage'
import EntryPage from './routes/EntryPage'
import RecipePage from './routes/RecipePage'
import ListenPage from './routes/Listen'
import JournalPage from './routes/Journal'
import AboutPage from './routes/About'
import DocsPage from './routes/Docs'
import HomeHero from './features/home/HomeHero'
import SkillPage from './features/agentskill/SkillPage'
import AdminPage from './features/admin/AdminPage'
import { featureRoutes } from './features/registry'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    // 路由切换直接归零（instant），避免和故事单列的"回到原章节"互相覆盖
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname])
  return null
}

function NotFound() {
  return (
    <div className="mx-auto max-w-xl py-16 text-center">
      <p className="text-sm tracking-[0.2em] text-brick">404</p>
      <h1 className="mt-3 font-serif text-2xl">这个页面没找到</h1>
      <p className="mt-3 text-sm text-ink-soft">
        可能是链接里的条目还没有登记，或者地址写错了。
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link to="/museum/yingge" className="btn-primary">
          去英歌舞
        </Link>
        <Link to="/museum" className="btn-secondary">
          去文化馆
        </Link>
      </div>
    </div>
  )
}

export default function App() {
  const { pathname } = useLocation()
  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-cream"
      >
        跳到主要内容
      </a>

      <ScrollToTop />
      <StorageNotice />
      <Nav />

      <main
        key={pathname}
        id="main"
        className={
          pathname === '/'
            ? 'route-fade mx-auto flex w-full max-w-none min-h-0 flex-1 px-0 pb-0 pt-0'
            : 'route-fade mx-auto w-full max-w-content flex-1 px-4 pb-36 pt-6 sm:pb-28'
        }
      >
        <Routes>
          {/* 模块专属页面（src/features/<module>/index.tsx 登记），优先于通用页 */}
          {featureRoutes.map((r) => (
            <Route key={r.path} path={r.path} element={r.element} />
          ))}

          {/* 首屏：Hero 拼贴大图首页（不再 redirect 到英歌）；英歌仍在 /museum/yingge */}
          <Route path="/" element={<HomeHero />} />
          <Route path="/story" element={<StoryIndex />} />
          <Route path="/story/:chapter" element={<StoryChapterPage />} />

          {/* 文化馆：模块页与条目页由 content/*.json 的 module/entry 驱动，
              新增内容不需要改这里；模块专属的深层页面统一登记在下方「模块扩展位」 */}
          <Route path="/museum" element={<MuseumIndex />} />
          <Route path="/museum/:module" element={<ModulePage />} />
          <Route path="/museum/:module/:entry" element={<EntryPage />} />
          <Route path="/recipe/:id" element={<RecipePage />} />

          {/* 独立功能页：听潮 / 手记 / 关于 / 文献汇总 */}
          <Route path="/listen" element={<ListenPage />} />
          <Route path="/journal" element={<JournalPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/docs" element={<DocsPage />} />
          <Route path="/skill" element={<SkillPage />} />
          <Route path="/admin" element={<AdminPage />} />

          {/* ===== 模块扩展位（每个模块一行，按模块分组） =====
              后续在 src/features/<module>/ 下新增页面后，只在这里加一行即可，例如：
              <Route path="/museum/yingge/roles" element={<YinggeRoles />} />
              <Route path="/museum/tea/steps" element={<TeaSteps />} />
              <Route path="/museum/food/menu" element={<FoodMenu />} />
              <Route path="/museum/yinglaoye/cases" element={<DeityCases />} />
              <Route path="/listen/history" element={<ListenHistory />} />
              规则：模块路由一律挂在 /museum/<module>/… 或 /listen/… 下，
              页面内自行用 usePageContext 上报上下文，用 VerifyBadge/SourceBadges 展示核验状态。 */}

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <AudioPlayerProvider />
      <AskDrawer />
    </div>
  )
}
