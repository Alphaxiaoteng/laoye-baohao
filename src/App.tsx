import { useEffect } from 'react'
import { Link, Route, Routes, useLocation } from 'react-router-dom'
import Nav from './components/Nav'
import Footer from './components/Footer'
import StorageNotice from './components/StorageNotice'
import AudioPlayerProvider from './components/AudioPlayerProvider'
import AskDrawer from './components/AskDrawer'
import Home from './routes/Home'
import StoryIndex from './routes/StoryIndex'
import StoryChapterPage from './routes/StoryChapter'
import MuseumIndex from './routes/MuseumIndex'
import ModulePage from './routes/ModulePage'
import EntryPage from './routes/EntryPage'
import RecipePage from './routes/RecipePage'
import ListenPage from './routes/Listen'
import JournalPage from './routes/Journal'
import SourcesPage from './routes/Sources'
import AboutPage from './routes/About'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
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
        <Link to="/" className="btn-primary">
          回到首页
        </Link>
        <Link to="/museum" className="btn-secondary">
          去文化馆
        </Link>
      </div>
    </div>
  )
}

export default function App() {
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

      <main id="main" className="mx-auto w-full max-w-content flex-1 px-4 pb-36 pt-6 sm:pb-28">
        <Routes>
          {/* 全站骨架：首页 / 故事线 */}
          <Route path="/" element={<Home />} />
          <Route path="/story" element={<StoryIndex />} />
          <Route path="/story/:chapter" element={<StoryChapterPage />} />

          {/* 文化馆：模块页与条目页由 content/*.json 的 module/entry 驱动，
              新增内容不需要改这里；模块专属的深层页面统一登记在下方「模块扩展位」 */}
          <Route path="/museum" element={<MuseumIndex />} />
          <Route path="/museum/:module" element={<ModulePage />} />
          <Route path="/museum/:module/:entry" element={<EntryPage />} />
          <Route path="/recipe/:id" element={<RecipePage />} />

          {/* 独立功能页：听潮 / 手记 / 来源 / 关于 */}
          <Route path="/listen" element={<ListenPage />} />
          <Route path="/journal" element={<JournalPage />} />
          <Route path="/sources" element={<SourcesPage />} />
          <Route path="/about" element={<AboutPage />} />

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

      <Footer />
      <AudioPlayerProvider />
      <AskDrawer />
    </div>
  )
}
