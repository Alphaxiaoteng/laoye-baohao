import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { buildFoodStage, type FoodFrame } from '../features/food/foodStage'
import { dishImage } from '../features/food/assets'
import { servingsText } from '../features/food/lib/servings'
import { groupListenItems } from '../features/listen/catalog'
import { CASES, PHOTO_CREDITS, PHOTO_NOTE, PROCESSION_PARTS, STAGE_FRAMES } from '../features/yinglaoye/data'
import {
  audioItems,
  entriesOfModule,
  entryBodyState,
  entryHref,
  normalizeIngredients,
  normalizeSteps,
  recipes,
  storyChapters,
  verifyLabel,
} from '../lib/content'
import { MODULES } from '../lib/modules'
import { Prose } from '../components/Prose'
import FoodMap from '../components/docs/FoodMap'
import ListenMap from '../components/docs/ListenMap'
import ProcessionMap, { type CaseChipView } from '../components/docs/ProcessionMap'
import TeaFlow from '../components/docs/TeaFlow'
import YinggeBeat from '../components/docs/YinggeBeat'
import YinggeDrill from '../components/docs/YinggeDrill'
import { usePageTitle } from '../lib/usePageContext'
import type { AudioItem, Entry, Recipe, StoryChapter } from '../types/content'
import { HOME_MEDIA } from './homeMedia'
import './docs.css'

/**
 * 历史介绍。五个板块同页展开。
 * 正文、食谱、故事和听潮词句只排 content 里已有的原文，不另写考据。
 * 章节与条目序号只描述本站的阅读顺序，不表示文化上的先后。
 */

interface ChapterMeta {
  id: string
  /** 全页统一的章节号：01–05 */
  num: string
  label: string
  /** 一句话导读，只描述本站这一章收了什么 */
  note: string
}

const CHAPTERS: ChapterMeta[] = [
  { id: 'yingge', num: '01', label: '英歌', note: '名录、角色、阵形、器物与锣鼓' },
  { id: 'tea', num: '02', label: '工夫茶', note: '茶具、冲泡环节与分茶说法' },
  { id: 'food', num: '03', label: '潮汕美食', note: '三道小食与四份分步食谱' },
  { id: 'yinglaoye', num: '04', label: '营老爷', note: '称呼、巡境、队伍与四地案例' },
  { id: 'listen', num: '05', label: '听潮', note: '四类词句、释义与录音信息' },
]

const SECTION_IDS = CHAPTERS.map((chapter) => chapter.id)

type FigureTone = 'plain' | 'dark' | 'photo'

type Figure = {
  src: string
  alt: string
  caption: string
  credit?: string
  page?: string
  tone?: FigureTone
}

const FOOD_DISHES = new Map(buildFoodStage().map((dish) => [dish.id, dish]))

function foodFigure(id: string): Figure | undefined {
  const image = dishImage(id)
  const dish = FOOD_DISHES.get(id)
  const src = image?.src ?? dish?.still
  const alt = image?.alt ?? dish?.alt
  if (!src || !alt) return undefined
  return {
    src,
    alt,
    caption: `${alt}。白底食物图，依据馆内实拍改绘。`,
    tone: 'plain',
  }
}

function creditLine(creator: string, license: string): string {
  return `${creator} · ${license}`
}

const CHAPTER_FIGURES: Record<string, Figure[]> = {
  yingge: [
    {
      src: HOME_MEDIA.yingge.src,
      alt: HOME_MEDIA.yingge.alt,
      caption: HOME_MEDIA.yingge.alt,
      credit: creditLine(HOME_MEDIA.yingge.creator, HOME_MEDIA.yingge.license),
      page: HOME_MEDIA.yingge.page,
      tone: 'photo',
    },
    {
      src: '/media/yingge/watch/thailand-2024-performance.webp',
      alt: '英歌队在户外广场演出，队员身穿彩色戏服、手执英歌槌',
      caption: '参考项目素材：户外演出现场。文件名标注为 2024 年泰国场次，具体队伍与场合待核验。',
      tone: 'photo',
    },
  ],
  tea: [
    {
      src: HOME_MEDIA.tea.src,
      alt: HOME_MEDIA.tea.alt,
      caption: HOME_MEDIA.tea.alt,
      credit: creditLine(HOME_MEDIA.tea.creator, HOME_MEDIA.tea.license),
      page: HOME_MEDIA.tea.page,
      tone: 'photo',
    },
  ],
  yinglaoye: STAGE_FRAMES.map((frame, index) => {
    const credit = PHOTO_CREDITS[index]
    return {
      src: frame.src,
      alt: frame.alt,
      caption: `${frame.caption}。${PHOTO_NOTE}`,
      credit: credit ? creditLine(credit.author, credit.license) : undefined,
      page: credit?.source,
      tone: 'photo' as const,
    }
  }),
}

const ENTRY_FIGURES: Record<string, Figure[]> = {
  'yingge-watch': [
    {
      src: '/media/yingge/watch/yingge-square-poster.webp',
      alt: '演出片段中的一个画面：队员在祠堂前广场列队起舞',
      caption: '演出片段中的一个画面：队员在祠堂前广场列队起舞。',
      tone: 'photo',
    },
  ],
  'yingge-role': [
    {
      src: '/media/yingge/roles/second-club.webp',
      alt: '实拍画面：黑面黑须的英歌队员举起英歌槌',
      caption: '实拍帧：黑面黑须、黑髯的队员举起英歌槌。与标准描述的二槌形象接近，但仅凭画面不能确认身份。',
      tone: 'photo',
    },
    {
      src: '/media/yingge/roles/performer-alley.webp',
      alt: '实拍画面：身穿红色戏服的队员在巷道中挥槌转身',
      caption: '实拍帧：巷道中的挥槌动作。服饰与动作只提供线索，人物身份仍以队伍资料为准。',
      tone: 'photo',
    },
  ],
  'yingge-objects': [
    {
      src: '/media/yingge/objects/objects-archive.webp',
      alt: '概念器物图：鼓、双槌、锣、头饰与戏服摆放在纸面上',
      caption: '参考项目的概念器物图：大鼓、双槌、锣、头冠与戏服。用作组合关系示意，不是具体队伍的器物档案。',
      tone: 'dark',
    },
  ],
  'yingge-in-yinglaoye': [
    {
      src: '/media/photos/yinglaoye-yingge.jpg',
      alt: '潮汕营老爷实拍：现场的英歌装扮',
      caption: `现场的英歌装扮。${PHOTO_NOTE}`,
      credit: PHOTO_CREDITS[3] ? creditLine(PHOTO_CREDITS[3].author, PHOTO_CREDITS[3].license) : undefined,
      page: PHOTO_CREDITS[3]?.source,
      tone: 'photo',
    },
  ],
}

const OBJECT_ICONS: Figure[] = [
  { src: '/media/yingge/objects/icon-clubs.webp', alt: '双槌', caption: '双槌' },
  { src: '/media/yingge/objects/icon-drum.webp', alt: '鼓', caption: '鼓' },
  { src: '/media/yingge/objects/icon-gong.webp', alt: '锣钹', caption: '锣钹' },
  { src: '/media/yingge/objects/icon-command-flag.webp', alt: '令旗', caption: '令旗' },
  { src: '/media/yingge/objects/icon-headpiece.webp', alt: '头饰', caption: '头饰' },
  { src: '/media/yingge/objects/icon-painted-face.webp', alt: '脸谱', caption: '脸谱' },
]

function figuresFor(entryId: string): Figure[] {
  const preset = ENTRY_FIGURES[entryId] ?? []
  const food = foodFigure(entryId)
  return food ? [...preset, food] : preset
}

function sectionIdFromHash(hash: string): string {
  const raw = hash.replace(/^#/, '')
  if (!raw.startsWith('doc-')) return 'yingge'
  const rest = raw.slice(4)
  if (rest === 'listen' || rest.startsWith('listen-') || rest.startsWith('audio-')) return 'listen'
  if (rest === 'yingge' || rest === 'yingge-story' || rest.startsWith('yingge-')) return 'yingge'
  if (rest === 'tea' || rest === 'story-tea' || rest.startsWith('tea-')) return 'tea'
  if (
    rest === 'food' ||
    rest === 'story-food' ||
    rest === 'food-recipes' ||
    rest.startsWith('food-') ||
    rest.startsWith('recipe-')
  ) {
    return 'food'
  }
  if (rest === 'yinglaoye' || rest === 'story-finale' || rest.startsWith('ylr-')) return 'yinglaoye'
  const owner = MODULES.find((mod) => entriesOfModule(mod.id).some((entry) => entry.id === rest))
  return owner?.id ?? 'yingge'
}

function sectionCount(id: string): number {
  if (id === 'listen') return audioItems.length
  if (id === 'food') return entriesOfModule('food').length + recipes.length
  return entriesOfModule(id).length
}

function chapterMeta(id: string): ChapterMeta {
  return CHAPTERS.find((chapter) => chapter.id === id) ?? CHAPTERS[0]
}

/** 章内小节号：01.01、01.02……只表示阅读顺序 */
function childNum(chapterId: string, index: number): string {
  return `${chapterMeta(chapterId).num}.${String(index + 1).padStart(2, '0')}`
}

function countText(id: string): string {
  if (id === 'listen') return `${audioItems.length} 条词句`
  if (id === 'food') return `${entriesOfModule('food').length} 条 · ${recipes.length} 份食谱`
  return `${entriesOfModule(id).length} 条`
}

function storyFor(moduleId: string): StoryChapter | undefined {
  const id =
    moduleId === 'yingge' ? 'yingge' : moduleId === 'tea' ? 'tea' : moduleId === 'food' ? 'food' : moduleId === 'yinglaoye' ? 'finale' : ''
  return storyChapters.find((chapter) => chapter.id === id)
}

function storyAnchor(chapter: StoryChapter): string {
  if (chapter.id === 'yingge') return 'doc-yingge-story'
  return `doc-story-${chapter.id}`
}

const CASE_CHIPS: CaseChipView[] = CASES.map((item) => {
  const base = item.region.split('（')[0].trim()
  const label = base.includes('·') ? base.split('·').slice(1).join('·').trim() : base
  const year = item.time.match(/20\d{2}/)?.[0] ?? '待补'
  return { id: item.entryId, label, year }
})

function Mark({ moduleId }: { moduleId: string }) {
  const common = {
    className: 'docs-mark',
    viewBox: '0 0 32 32',
    'aria-hidden': true as const,
  }
  if (moduleId === 'yingge') {
    return (
      <svg {...common}>
        <g fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
          <path d="M8 24.5 24 8.5" />
          <path d="M8 8.5 24 24.5" />
        </g>
        <g fill="currentColor">
          <circle cx="8" cy="24.5" r="2.15" />
          <circle cx="24" cy="8.5" r="2.15" />
          <circle cx="8" cy="8.5" r="2.15" />
          <circle cx="24" cy="24.5" r="2.15" />
        </g>
      </svg>
    )
  }
  if (moduleId === 'tea') {
    return (
      <svg {...common}>
        <g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <ellipse cx="15" cy="18.2" rx="7" ry="5.1" />
          <path d="M21.6 17.2c3-.1 5.2-1.5 5.3-3.1" />
          <path d="M8.2 16.6c-2.5.4-3.5 2.3-3.1 4 .4 1.5 1.8 2.2 3.2 1.8" />
          <path d="M11.2 13.4h7.6" />
          <path d="M15 13.2V11" />
        </g>
        <circle cx="15" cy="10.2" r="1.15" fill="currentColor" />
      </svg>
    )
  }
  if (moduleId === 'food') {
    return (
      <svg {...common}>
        <g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
          <ellipse cx="16" cy="12" rx="10" ry="3.1" />
          <path d="M6.2 12.5c.9 7 4.3 10.6 9.8 10.6s8.9-3.6 9.8-10.6" />
        </g>
      </svg>
    )
  }
  if (moduleId === 'listen') {
    return (
      <svg {...common}>
        <g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
          <path d="M8 17.5v-2.2a8 8 0 0 1 16 0v2.2" />
          <path d="M8 16.5h3.2v6.2H9.2A1.2 1.2 0 0 1 8 21.5z" />
          <path d="M24 16.5h-3.2v6.2h1.9a1.2 1.2 0 0 0 1.3-1.2z" />
        </g>
      </svg>
    )
  }
  return (
    <svg {...common}>
      <g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 4.5v23" />
        <path d="M14 21.5h11.5v5.2H14z" />
        <path d="M14 21.5 19.8 18l6 3.5" />
      </g>
      <path d="M7 5.2h12.2L15.6 9.6 19.2 14H7z" fill="currentColor" />
    </svg>
  )
}

function DocFigure({ item, layout }: { item: Figure; layout: 'split' | 'stack' }) {
  const tone = item.tone ?? 'plain'
  return (
    <figure className={layout === 'split' ? `docs-split-figure is-${tone}` : `docs-figure is-${tone}`}>
      <img src={item.src} alt={item.alt} loading="lazy" />
      <figcaption>
        <span>{item.caption}</span>
        {item.credit ? (
          item.page ? (
            <a className="link-inline" href={item.page} target="_blank" rel="noopener noreferrer">
              {item.credit}
            </a>
          ) : (
            <span className="docs-credit">{item.credit}</span>
          )
        ) : null}
      </figcaption>
    </figure>
  )
}

function FigureGrid({ items }: { items: Figure[] }) {
  if (items.length === 0) return null
  return (
    <div className={items.length > 1 ? 'docs-figures' : undefined}>
      {items.map((item) => (
        <DocFigure key={item.src} item={item} layout="stack" />
      ))}
    </div>
  )
}

function IconRow({ items }: { items: Figure[] }) {
  if (items.length === 0) return null
  return (
    <div className="docs-icons">
      {items.map((fig) => (
        <figure key={fig.src}>
          <img src={fig.src} alt={fig.alt} loading="lazy" />
          <figcaption>{fig.caption}</figcaption>
        </figure>
      ))}
    </div>
  )
}

function FrameStrip({ frames }: { frames: FoodFrame[] }) {
  if (frames.length === 0) return null
  return (
    <div className="docs-frames">
      {frames.map((frame) => (
        <figure key={frame.src}>
          <img src={frame.src} alt={frame.text} loading="lazy" />
          <figcaption>{frame.text}</figcaption>
        </figure>
      ))}
    </div>
  )
}

function StoryBlock({ chapter }: { chapter: StoryChapter }) {
  const narrative = (chapter.narrative ?? '').trim()
  if (!narrative) return null
  const showSeriesNote = chapter.fiction === true && !narrative.includes('原创虚构')
  return (
    <aside id={storyAnchor(chapter)} className="docs-story">
      <p className="docs-story-k">故事</p>
      <h3 className="docs-story-t">{chapter.title}</h3>
      <p className="docs-story-d">{narrative}</p>
      {showSeriesNote ? <p className="docs-meta">本故事为原创虚构串联，不对应某地完整仪式流程。</p> : null}
    </aside>
  )
}

function ChapterHead({ meta, count }: { meta: ChapterMeta; count: string }) {
  return (
    <header className="docs-chapter-head">
      <span className="docs-chapter-num" aria-hidden="true">
        {meta.num}
      </span>
      <div className="docs-chapter-titles">
        <h2>
          <Mark moduleId={meta.id} />
          <span>{meta.label}</span>
        </h2>
        <p className="docs-chapter-meta">
          <span>{count}</span>
          <span aria-hidden="true"> · </span>
          <span>{meta.note}</span>
        </p>
      </div>
    </header>
  )
}

function Diagram({
  title,
  caption,
  children,
}: {
  title: string
  caption: string
  children: ReactNode
}) {
  return (
    <figure className="docs-diagram">
      <div className="docs-diagram-head">
        <span className="docs-diagram-k">图解</span>
        <span>{title}</span>
      </div>
      {children}
      <p className="docs-svg-hint" aria-hidden="true">
        左右滑动可看完整图解
      </p>
      <figcaption className="docs-diagram-caption">{caption}</figcaption>
    </figure>
  )
}

function CaseTable() {
  if (CASES.length === 0) return null
  return (
    <div className="docs-table-wrap">
      <table className="docs-table">
        <caption>四地案例对照：地区与时间照原文抄录，原文年份不是今年的日程。</caption>
        <thead>
          <tr>
            <th scope="col">地区</th>
            <th scope="col">原文时间</th>
            <th scope="col">原文要点</th>
          </tr>
        </thead>
        <tbody>
          {CASES.map((item) => (
            <tr key={item.entryId}>
              <th scope="row">
                <a className="link-inline" href={`#doc-${item.entryId}`}>
                  {item.region}
                </a>
              </th>
              <td>{item.time}</td>
              <td>
                <ul className="docs-table-list">
                  {item.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function EntryArticle({ entry, num }: { entry: Entry; num: string }) {
  const body = entryBodyState(entry)
  const figures = figuresFor(entry.id)
  const lead = figures.length === 1 ? figures[0] : undefined
  const gallery = figures.length > 1 ? figures : []
  const frames = FOOD_DISHES.get(entry.id)?.frames ?? []
  const icons = entry.id === 'yingge-objects' ? OBJECT_ICONS : []

  return (
    <article className="docs-entry">
      <p className="docs-entry-num" aria-hidden="true">
        {num}
      </p>
      <div className="docs-entry-main">
        <div className={lead ? 'docs-split has-figure' : 'docs-split'}>
          {lead ? <DocFigure item={lead} layout="split" /> : null}
          <div>
            <h3 id={`doc-${entry.id}`}>{entry.title}</h3>
            {entry.region || entry.verify ? (
              <p className="docs-meta">
                {entry.region ? <span>{entry.region}</span> : null}
                {entry.region && entry.verify ? <span aria-hidden="true"> · </span> : null}
                {entry.verify ? <span>{verifyLabel(entry.verify)}</span> : null}
              </p>
            ) : null}
            {entry.summary ? <p className="docs-summary">{entry.summary}</p> : null}
            {body.text.trim() ? (
              <div className={body.placeholder ? 'docs-placeholder' : 'docs-body'}>
                <Prose text={body.text} />
              </div>
            ) : null}
          </div>
        </div>
        {gallery.length > 0 ? <FigureGrid items={gallery} /> : null}
        <IconRow items={icons} />
        <FrameStrip frames={frames} />
        <p className="docs-jump-line">
          <Link to={entryHref(entry)} className="link-inline">
            在模块里看
          </Link>
        </p>
      </div>
    </article>
  )
}

function RecipeArticle({ recipe, num }: { recipe: Recipe; num: string }) {
  const ingredients = normalizeIngredients(recipe)
  const steps = normalizeSteps(recipe)
  const frames = FOOD_DISHES.get(recipe.id)?.frames ?? []
  const lead = foodFigure(recipe.id)
  const rawServings = recipe.servings
  const servingsLabel =
    typeof rawServings === 'number' || (typeof rawServings === 'string' && rawServings.trim() !== '')
      ? servingsText(rawServings)
      : ''
  const meta = [recipe.region, servingsLabel, recipe.prepTime, recipe.cookTime, recipe.difficulty]
    .map((item) => (item ?? '').trim())
    .filter(Boolean)

  return (
    <article className="docs-entry docs-recipe">
      <p className="docs-entry-num" aria-hidden="true">
        {num}
      </p>
      <div className="docs-entry-main">
        <div className={lead ? 'docs-split has-figure' : 'docs-split'}>
          {lead ? <DocFigure item={lead} layout="split" /> : null}
          <div>
            <h4 id={`doc-${recipe.id}`}>{recipe.name}</h4>
            {meta.length > 0 || recipe.verify ? (
              <p className="docs-meta">
                {meta.map((item, index) => (
                  <span key={`${recipe.id}-meta-${index}`}>
                    {index > 0 ? <span aria-hidden="true"> · </span> : null}
                    {item}
                  </span>
                ))}
                {recipe.verify ? (
                  <>
                    {meta.length > 0 ? <span aria-hidden="true"> · </span> : null}
                    <span>{verifyLabel(recipe.verify)}</span>
                  </>
                ) : null}
              </p>
            ) : null}
            {recipe.summary ? <p className="docs-summary">{recipe.summary}</p> : null}
          </div>
        </div>

        {ingredients.length > 0 ? (
          <>
            <h5 className="docs-label">用料</h5>
            <ul className="docs-list">
              {ingredients.map((item) => (
                <li key={`${recipe.id}-${item.name}`}>
                  <span>{item.name}</span>
                  {item.amount ? <span> {item.amount}</span> : null}
                  {item.note ? <span className="docs-note">（{item.note}）</span> : null}
                </li>
              ))}
            </ul>
          </>
        ) : null}

        {(recipe.tools ?? []).length > 0 ? (
          <>
            <h5 className="docs-label">器具</h5>
            <ul className="docs-list">
              {(recipe.tools ?? []).map((tool) => (
                <li key={tool}>{tool}</li>
              ))}
            </ul>
          </>
        ) : null}

        {steps.length > 0 ? (
          <>
            <h5 className="docs-label">了解制作</h5>
            <ol className="docs-steps">
              {steps.map((step, index) => {
                const frame = frames[index]
                return (
                  <li key={`${recipe.id}-step-${index}`} className="docs-step">
                    {frame ? (
                      <img src={frame.src} alt={step.text} loading="lazy" />
                    ) : (
                      <span className="docs-step-index">{index + 1}</span>
                    )}
                    <div>
                      <p>{step.text}</p>
                      {step.note ? <p className="docs-note">{step.note}</p> : null}
                    </div>
                  </li>
                )
              })}
            </ol>
          </>
        ) : null}

        {(recipe.safety ?? []).length > 0 ? (
          <>
            <h5 className="docs-label">处理安全提示</h5>
            <ul className="docs-list">
              {(recipe.safety ?? []).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </>
        ) : null}

        {(recipe.allergens ?? []).length > 0 ? (
          <>
            <h5 className="docs-label">过敏原 / 饮食注意</h5>
            <ul className="docs-list">
              {(recipe.allergens ?? []).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </>
        ) : null}

        <p className="docs-jump-line">
          <Link to={`/recipe/${recipe.id}`} className="link-inline">
            打开分步食谱
          </Link>
        </p>
      </div>
    </article>
  )
}

function ListenPhrase({ item, num }: { item: AudioItem; num: string }) {
  const pinyin = (item.pinyin ?? '').trim()
  return (
    <li id={`doc-${item.id}`} className="docs-phrase">
      <span className="docs-phrase-num" aria-hidden="true">
        {num}
      </span>
      <div className="docs-phrase-body">
        <h4 className="docs-phrase-text">{item.text || '（词句待补充）'}</h4>
        {item.meaning ? <p className="docs-phrase-meaning">{item.meaning}</p> : null}
        <dl className="docs-phrase-meta">
          {pinyin ? (
            <div>
              <dt>拼音</dt>
              <dd>{pinyin}</dd>
            </div>
          ) : null}
          {item.accent ? (
            <div>
              <dt>口音</dt>
              <dd>{item.accent}</dd>
            </div>
          ) : null}
          {item.recorder ? (
            <div>
              <dt>录音</dt>
              <dd>{item.recorder}</dd>
            </div>
          ) : null}
          {item.license ? (
            <div>
              <dt>许可</dt>
              <dd>{item.license}</dd>
            </div>
          ) : null}
        </dl>
      </div>
    </li>
  )
}

function ListenSection() {
  const allGroups = groupListenItems(audioItems)
  const groups = allGroups
    .map((group, index) => ({ ...group, index }))
    .filter((group) => group.items.length > 0)
  const meta = chapterMeta('listen')

  return (
    <section className="docs-chapter" id="doc-listen">
      <ChapterHead meta={meta} count={`${audioItems.length} 条词句`} />
      <Diagram
        title="四类词条的结构"
        caption="每个圆点代表一条词条，只表示数量，不表示录音时长或声波；录音信息按词条标注。"
      >
        <ListenMap
          groups={allGroups.map((group) => ({
            slug: group.category.slug,
            label: group.category.label,
            count: group.items.length,
          }))}
          total={audioItems.length}
        />
      </Diagram>
      <p className="docs-lead">词句按听潮里已有的分类排开。释义、拼音与口音均按词条内容展示。</p>
      {groups.length === 0 ? (
        <div className="docs-placeholder">
          <p>听潮词条待登记（content/audio.json 还没有内容）。</p>
        </div>
      ) : (
        groups.map(({ category, items, index }) => {
          const groupNum = `05.${String(index + 1).padStart(2, '0')}`
          return (
            <div key={category.slug} className="docs-listen-group" id={`doc-listen-${category.slug}`}>
              <header className="docs-group-head">
                <span className="docs-group-num" aria-hidden="true">
                  {groupNum}
                </span>
                <h3>{category.label}</h3>
                <span className="docs-count">{items.length} 条</span>
              </header>
              <p className="docs-lead">{category.intro}</p>
              <ul className="docs-phrases">
                {items.map((item, itemIndex) => (
                  <ListenPhrase key={item.id} item={item} num={`${groupNum}.${String(itemIndex + 1).padStart(2, '0')}`} />
                ))}
              </ul>
              <p className="docs-jump-line">
                <Link to={`/listen/${category.slug}`} className="link-inline">
                  去听这一类
                </Link>
              </p>
            </div>
          )
        })
      )}
    </section>
  )
}

function chapterDiagram(moduleId: string) {
  if (moduleId === 'yingge') {
    return {
      title: '阵形点位与鼓点循环',
      caption:
        '队形名称、鼓点循环数与槌数出自条目原文；点位与圆点都是示意，不代表具体队伍的人数、走位或实际鼓谱。',
      body: (
        <div className="docs-diagram-pair">
          <YinggeDrill />
          <YinggeBeat />
        </div>
      ),
    }
  }
  if (moduleId === 'tea') {
    return {
      title: '冲泡环节的关系',
      caption:
        '项目页把冲泡拆成二十余个环节，这里只取其中七环连成示意；不是唯一标准流程，页面未说明各环节的时长与温度。',
      body: <TeaFlow />,
    }
  }
  if (moduleId === 'food') {
    return {
      title: '食材 → 处理 → 成菜',
      caption:
        '节点文字取自 recipes.food.json：食材只列前两项并注明总数，处理显示首个工序词与步骤数；做法以各处食谱原文为准。',
      body: <FoodMap recipes={recipes} />,
    }
  }
  if (moduleId === 'yinglaoye') {
    return {
      title: '巡游队伍与地区案例',
      caption:
        '队伍部分只画来源里写到的组成，虚线部分表示只有部分地方、部分年份才有；案例年份照原文抄录，不是今年的日程。',
      body: (
        <>
          <ProcessionMap
            parts={PROCESSION_PARTS.map((part) => ({
              id: part.id,
              label: part.label,
              optional: part.optional,
            }))}
            cases={CASE_CHIPS}
          />
          <CaseTable />
        </>
      ),
    }
  }
  return { title: '', caption: '', body: null }
}

function ModuleSection({ moduleId }: { moduleId: string }) {
  const group = MODULES.find((mod) => mod.id === moduleId)
  if (!group) return null
  const items = entriesOfModule(group.id)
  const meta = chapterMeta(group.id)
  const chapter = storyFor(group.id)
  const showRecipes = group.id === 'food'
  const diagram = chapterDiagram(group.id)
  const figures = CHAPTER_FIGURES[group.id] ?? []

  return (
    <section className="docs-chapter" id={`doc-${group.id}`}>
      <ChapterHead meta={meta} count={countText(group.id)} />
      <Diagram title={diagram.title} caption={diagram.caption}>
        {diagram.body}
      </Diagram>
      <p className="docs-lead">{group.intro}</p>
      {chapter ? <StoryBlock chapter={chapter} /> : null}

      <div className="docs-entries">
        {items.map((entry, index) => (
          <EntryArticle key={entry.id} entry={entry} num={childNum(group.id, index)} />
        ))}
      </div>

      {showRecipes ? (
        <div className="docs-recipes">
          <header className="docs-group-head">
            <span className="docs-group-num" aria-hidden="true">
              {childNum('food', items.length)}–{childNum('food', items.length + recipes.length - 1)}
            </span>
            <h3 id="doc-food-recipes">食谱</h3>
            <span className="docs-count">{recipes.length} 份</span>
          </header>
          {recipes.map((recipe, index) => (
            <RecipeArticle key={recipe.id} recipe={recipe} num={childNum('food', items.length + index)} />
          ))}
        </div>
      ) : null}

      {figures.length > 0 ? (
        <div className="docs-archive">
          <p className="docs-label">档案图片</p>
          <FigureGrid items={figures} />
        </div>
      ) : null}
    </section>
  )
}

export default function DocsPage() {
  usePageTitle('历史介绍')
  const location = useLocation()
  const [activeId, setActiveId] = useState(() => sectionIdFromHash(location.hash))
  const prologue = storyChapters.find((chapter) => chapter.id === 'prologue')
  const entryTotal = MODULES.reduce((sum, mod) => sum + entriesOfModule(mod.id).length, 0)

  useEffect(() => {
    setActiveId(sectionIdFromHash(location.hash))
  }, [location.hash])

  useEffect(() => {
    const hash = location.hash.replace('#', '')
    if (!hash) return
    const frame = requestAnimationFrame(() => {
      document.getElementById(hash)?.scrollIntoView({ block: 'start', behavior: 'instant' })
    })
    return () => cancelAnimationFrame(frame)
  }, [location.hash])

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return undefined
    const nodes = SECTION_IDS.map((id) => document.getElementById(`doc-${id}`)).filter(
      (node): node is HTMLElement => Boolean(node),
    )
    if (nodes.length === 0) return undefined
    const observer = new IntersectionObserver(
      (observed) => {
        const visible = observed
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRect.height - a.intersectionRect.height)[0]
        const id = visible?.target.id
        if (!id?.startsWith('doc-')) return
        setActiveId(id.slice(4))
      },
      { rootMargin: '-20% 0px -65% 0px', threshold: 0 },
    )
    nodes.forEach((node) => observer.observe(node))
    return () => observer.disconnect()
  }, [])

  return (
    <div className="docs-shell">
      <aside className="docs-sidebar">
        <nav className="docs-nav" aria-label="历史介绍章节">
          <p className="docs-nav-kicker">五章</p>
          {CHAPTERS.map((chapter) => (
            <a
              key={chapter.id}
              href={`#doc-${chapter.id}`}
              aria-current={chapter.id === activeId ? 'true' : undefined}
              className={chapter.id === activeId ? 'is-current' : undefined}
            >
              <span className="docs-nav-num" aria-hidden="true">
                {chapter.num}
              </span>
              <span className="docs-nav-label">{chapter.label}</span>
              <span className="docs-nav-count">{sectionCount(chapter.id)}</span>
            </a>
          ))}
        </nav>
      </aside>

      <article className="docs-main">
        <header className="docs-hero">
          <p className="docs-kicker">历史介绍 · 五章索引</p>
          <h1>历史介绍</h1>
          <p className="docs-hero-lead">
            英歌、工夫茶、潮汕美食、营老爷和听潮排在同一页。条目、食谱、故事和词句用的是内容里已有的原文。
          </p>
          <dl className="docs-stats">
            <div>
              <dt>章节</dt>
              <dd>05</dd>
            </div>
            <div>
              <dt>条目</dt>
              <dd>{String(entryTotal).padStart(2, '0')}</dd>
            </div>
            <div>
              <dt>食谱</dt>
              <dd>{String(recipes.length).padStart(2, '0')}</dd>
            </div>
            <div>
              <dt>词条</dt>
              <dd>{audioItems.length}</dd>
            </div>
          </dl>
        </header>

        <nav className="docs-overview" aria-label="五章总览">
          {CHAPTERS.map((chapter) => (
            <a
              key={chapter.id}
              href={`#doc-${chapter.id}`}
              className={chapter.id === activeId ? 'docs-overview-card is-current' : 'docs-overview-card'}
              aria-current={chapter.id === activeId ? 'true' : undefined}
            >
              <span className="docs-overview-top">
                <span className="docs-overview-num" aria-hidden="true">
                  {chapter.num}
                </span>
                <Mark moduleId={chapter.id} />
              </span>
              <span className="docs-overview-title">{chapter.label}</span>
              <span className="docs-overview-meta">{countText(chapter.id)}</span>
              <span className="docs-overview-note">{chapter.note}</span>
            </a>
          ))}
        </nav>

        {prologue ? <StoryBlock chapter={prologue} /> : null}

        {MODULES.map((mod) => (
          <ModuleSection key={mod.id} moduleId={mod.id} />
        ))}
        <ListenSection />

        <p className="docs-footer-link">
          <Link to="/museum/food/menu" className="link-inline">
            完整食谱
          </Link>
          <span aria-hidden="true"> · </span>
          <Link to="/listen" className="link-inline">
            听潮
          </Link>
          <span aria-hidden="true"> · </span>
          <Link to="/story" className="link-inline">
            故事线
          </Link>
          <span aria-hidden="true"> · </span>
          <Link to="/guide" className="link-inline">
            攻略
          </Link>
        </p>
      </article>
    </div>
  )
}
