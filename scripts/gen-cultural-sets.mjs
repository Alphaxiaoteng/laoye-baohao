/**
 * 潮汕文化互动馆 · 三套 1:1 (1024x1024) 传统文化视觉资产批量生成管线
 *
 * 走本地 Provider 14 密钥池代理 (http://127.0.0.1:8791/v1/images/edits)
 * 模型：gpt-image-2.6（基于站内真实参考图 + 三套截然不同的大师级东方传统风格锁）
 *
 * 用法：
 *   node scripts/gen-cultural-sets.mjs v1          # 生成版本 1（50 张）
 *   node scripts/gen-cultural-sets.mjs v2          # 生成版本 2（50 张）
 *   node scripts/gen-cultural-sets.mjs v3          # 生成版本 3（50 张）
 *   node scripts/gen-cultural-sets.mjs all         # 生成全部三套（150 张）
 *   node scripts/gen-cultural-sets.mjs dump-md     # 导出完整提示词手册 PROMPTS.md
 */
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import path from 'node:path'

const API_BASE = process.env.AINEXT_BASE || 'http://127.0.0.1:8791/v1'
const ROOT_OUT = path.resolve('public/media/cultural-sets')
const CONCURRENCY = Number(process.env.GEN_CONCURRENCY || 3)
const FORCE = process.argv.includes('--force')

/**
 * 站内真实参考图池（按主题映射，��� /v1/images/edits 图生图锚定构图与器物形制）
 */
const REF_IMAGES = {
  home_pano: 'public/media/home/hero/panorama-master.webp',
  yingge_stage: 'public/media/home/gdstwhg/yingge-stage.webp',
  yingge_portrait: 'public/media/home/gdstwhg/yingge-portrait.webp',
  yingge_village: 'public/media/home/gdstwhg/yingge-village.webp',
  yingge_face: 'public/media/home/collage/yingge/yingge-face-detail.webp',
  yingge_panel: 'public/media/home/hero/panel-yingge.webp',
  tea_panel: 'public/media/home/hero/panel-tea.webp',
  tea_tray: 'public/media/home/teochew-kanghu-tea.webp',
  tea_salon: 'public/media/home/gdstwhg/tea-salon.webp',
  food_bowl: 'public/media/home/collage/food/bowl-beef-ball.webp',
  food_beefball: 'public/media/home/gdstwhg/food-beefball.webp',
  food_goose: 'public/media/photos/food-braised-goose.jpg',
  food_omelette: 'public/media/photos/food-oyster-omelette.jpg',
  food_panel: 'public/media/home/hero/panel-food.webp',
  yl_sedan: 'public/media/photos/yinglaoye-chaoyang-sedan.jpg',
  yl_lantern: 'public/media/home/collage/yinglaoye/lantern.webp',
  yl_fire: 'public/media/photos/yinglaoye-fire-jump.jpg',
  yl_parade: 'public/media/home/gdstwhg/parade-float.webp',
  yl_panel: 'public/media/home/hero/panel-yinglaoye.webp',
}

/**
 * 三套截然不同、各自高度统一的传统文化高级风格锁（Style DNA Lock）
 */
export const STYLE_VERSIONS = {
  v1: {
    id: 'v1-dunhuang-mineral',
    title: '版本一：敦煌藏经洞矿物重彩 × 宋刻本古籍留白风 (Dunhuang Mineral Pigment & Song Woodblock Print)',
    summary:
      '参考 cave17.e-dunhuang.com 与宋代善本版画：粗颗粒手工麻纸/桑皮纸肌理（#D9CBAF 暖沙纸底），天然矿物颜料（朱砂 #824239、石青 #3B5B5E、石绿 #536B66、赭石 #9A6B46、泥金 #C8A464），铁线描勾勒，单主体居中偏黄金分割位，四周 ≥45% 呼吸感古纸留白。',
    styleLock:
      'Masterpiece traditional Chinese mineral pigment illustration on aged Dunhuang hemp-mulberry paper (#D9CBAF warm sand parchment texture), ' +
      'inspired by cave17.e-dunhuang.com and Song Dynasty fine woodblock book art (Lü Jingren editorial aesthetic). ' +
      'Natural ground mineral palette: cinnabar vermilion (#824239), azurite mineral blue-green (#536B66), raw ochre (#9A6B46), and delicate gold-leaf hairlines (#C8A464). ' +
      'Fine iron-wire ink linework (铁线描) with weathered mural patina, museum-grade editorial composition, 1:1 square aspect ratio, ' +
      'at least 45% negative parchment space around a single iconic subject, flat diffused archival lighting, strictly no text, no letters, no watermark, no modern UI.',
  },
  v2: {
    id: 'v2-palace-lacquer',
    title: '版本二：故宫多宝阁黑漆描金 × 宋代院体静物光影风 (Imperial Dark Lacquer & Song Court Still-Life)',
    summary:
      '参考故宫数字多宝阁 (dpm.org.cn/shuziduobaoge.html) 与宋徽宗院体画：深邃推光乌木黑漆与深墨青暗场（#141C18 → #0E1310），单束博物馆级戏剧化伦勃朗顶侧聚光，温润汝窑/紫砂/丝绸/金漆真实文物级材质反射，暗部藏入极静负空间，庄重、内敛、皇家典藏感。',
    styleLock:
      'Imperial Palace Museum Digital Duobaoge (数字多宝阁) curatorial aesthetic fused with Song Dynasty court academy realism (院体工笔重彩). ' +
      'Set against a deep polished ebony-lacquer and dark ink-pine void (#141C18 to #0D120F), illuminated by a single dramatic museum spotlight from top-left. ' +
      'Hyper-tactile heritage materials: luminous gilded lacquer, translucent porcelain glaze, aged bronze, hand-woven silk, and warm incense smoke. ' +
      'Strict 1:1 square composition with 50% velvety dark negative space, subtle gold-dust rim highlights (#B08A5A), timeless museum gravitas, strictly no text, no watermark, no artificial neon.',
  },
  v3: {
    id: 'v3-chaoshan-craft',
    title: '版本三：潮汕金漆木雕·屋脊嵌瓷·佛山潮州木版年画在地非遗风 (Chaoshan Gilded Woodcarving, Porcelain Inlay & Folk Woodcut)',
    summary:
      '纯正岭南与潮汕在地工艺美术语言：融合潮州金漆木雕（多层镂空贴金）、潮汕古厝屋脊嵌瓷（彩瓷片立体拼贴）、潮州朱泥手拉壶与传统木版套色年画刀味；靛蓝海潮底（#1B2A32）配潮州大红（#B63B2A）、金箔（#E0AE4E）与贝灰白（#F2ECE1），既有民间烟火气又有当代艺术馆版式克制感。',
    styleLock:
      'Authentic Chaoshan intangible cultural heritage craft aesthetic: a synthesis of Chaozhou多层镂空 gilded woodcarving (潮州金漆木雕), ' +
      'iridescent Chaoshan rooftop porcelain-shard inlay (嵌瓷), and traditional Teochew polychrome woodblock printmaking (木版年画). ' +
      'Color harmony anchored in South China Sea indigo (#1B2A32), auspicious Chaoshan vermilion (#B63B2A), pure 24k gold leaf (#E0AE4E), and shell-lime white (#F2ECE1). ' +
      'Crisp carved relief edges, tactile ceramic and woodgrain textures, curated 1:1 square gallery framing with generous clean breathing room, strictly no text, no letters, no watermark.',
  },
}

/**
 * 50 张按页面与子模块设计的母题矩阵（6 大页面目录，每个版本生成全套 50 张 1:1）
 */
export const PAGE_SHOTS = [
  // ==================== 01-home (首页与总览 · 8 张) ====================
  {
    folder: '01-home',
    id: '01-seal-emblem',
    title: '老爷保号·总馆朱文方印章徽',
    ref: 'home_pano',
    subject:
      'A ceremonial square carving seal emblem crafted from aged red-stone and gilded wood, featuring abstract motifs of Yingge wooden clubs, a Gongfu teapot, a porcelain soup bowl, and a deity lantern harmoniously intertwined at the center.',
  },
  {
    folder: '01-home',
    id: '02-chaoshan-gate',
    title: '潮汕传统四点金祠堂中门开启',
    ref: 'home_pano',
    subject:
      'Slightly ajar ornate wooden double doors of a traditional Chaoshan Si-Dian-Jin ancestral hall, warm golden lantern light spilling through the center gap, stone drum pedestals on both sides.',
  },
  {
    folder: '01-home',
    id: '03-door-yingge',
    title: '首页四章门扉之一·英歌战舞',
    ref: 'yingge_panel',
    subject:
      'Curatorial chapter emblem for Yingge Dance: a pair of crossed dark-wood Yingge clubs tied with crimson silk ribbons hovering above a ceremonial war drum.',
  },
  {
    folder: '01-home',
    id: '04-door-tea',
    title: '首页四章门扉之二·工夫茶席',
    ref: 'tea_panel',
    subject:
      'Curatorial chapter emblem for Chaoshan Gongfu Tea: a miniature Mengchen vermilion clay teapot poised over three delicate white porcelain cups arranged in a品-character triangle.',
  },
  {
    folder: '01-home',
    id: '05-door-food',
    title: '首页四章门扉之三·潮味食单',
    ref: 'food_panel',
    subject:
      'Curatorial chapter emblem for Chaoshan Cuisine: a blue-and-white porcelain bowl of steaming beef balls with bamboo chopsticks resting on a carved wooden stand.',
  },
  {
    folder: '01-home',
    id: '06-door-yinglaoye',
    title: '首页四章门扉之四·营老爷夜巡',
    ref: 'yl_panel',
    subject:
      'Curatorial chapter emblem for Yinglaoye Procession: an八抬 gilded deity palanquin roof crown flanked by two glowing bamboo-frame red paper lanterns.',
  },
  {
    folder: '01-home',
    id: '07-guangji-bridge',
    title: '潮州广济桥十八梭船廿四洲意象',
    ref: 'home_pano',
    subject:
      'Poetic architectural study of Chaozhou Guangji Bridge: a traditional timber pavilion pier connected by floating wooden pontoons over misty river water.',
  },
  {
    folder: '01-home',
    id: '08-red-head-junk',
    title: '樟林古港红头船下南洋印记',
    ref: 'home_pano',
    subject:
      'A classic Chaoshan Red-Head Junk (红头船) with crimson bow and billowing woven sails gliding across calm stylized sea waves.',
  },

  // ==================== 02-yingge (英歌舞页 · 10 张) ====================
  {
    folder: '02-yingge',
    id: '01-head-club-red',
    title: '头槌角色·关胜红面红须立像',
    ref: 'yingge_portrait',
    subject:
      'Heroic portrait of the First-Stick (头槌) Yingge dancer with fierce red-and-gold painted opera face and long red beard, leaping mid-air while striking two wooden sticks.',
  },
  {
    folder: '02-yingge',
    id: '02-second-club-black',
    title: '二槌角色·李逵黑面旋身立像',
    ref: 'yingge_stage',
    subject:
      'Dynamic portrait of the Second-Stick (二槌) Yingge warrior with bold black-and-white vortex opera face paint, horse-stance crouch, swinging dual wooden sticks.',
  },
  {
    folder: '02-yingge',
    id: '03-snake-dancer',
    title: '时迁舞蛇·引队灵动角色',
    ref: 'yingge_stage',
    subject:
      'The agile Scout character (时迁) in Chaoshan Yingge Dance, wearing a swallow-tail headscarf and holding a coiled cloth serpent prop, guiding the formation.',
  },
  {
    folder: '02-yingge',
    id: '04-twin-clubs-strike',
    title: '器物特写·双槌对击迸发金星',
    ref: 'yingge_panel',
    subject:
      'Close-up still-life of two polished hardwood Yingge sticks (英歌槌) wrapped in red cloth at the grip, colliding in mid-air with a burst of fine golden dust.',
  },
  {
    folder: '02-yingge',
    id: '05-command-drum',
    title: '器物特写·司鼓大鼓与鼓槌',
    ref: 'yingge_village',
    subject:
      'A traditional Chaoshan cowhide command drum (司鼓) painted with auspicious cloud rims on a wooden stand, two heavy drumsticks resting on top.',
  },
  {
    folder: '02-yingge',
    id: '06-brass-cymbals-gong',
    title: '器物特写·钦仔铜锣与大钹',
    ref: 'yingge_village',
    subject:
      'Hand-hammered Chaoshan bronze gong and pair of brass cymbals tied with aged red cords, catching warm side light with subtle acoustic ripples.',
  },
  {
    folder: '02-yingge',
    id: '07-facepaint-mask',
    title: '脸谱图谱·梁山好汉脸谱精绘',
    ref: 'yingge_face',
    subject:
      'Symmetrical frontal study of a traditional Chaoshan Yingge opera face-paint pattern featuring fire-clouds, black eye-frames, and gold brow markings.',
  },
  {
    folder: '02-yingge',
    id: '08-formation-dragon',
    title: '阵形俯瞰·双龙出海阵势图',
    ref: 'yingge_village',
    subject:
      'Top-down architectural diagram of the "Twin Dragons Emerging from the Sea" (双龙出海) Yingge dance formation: two parallel curving streams of tiny dancer figures and red lantern markers.',
  },
  {
    folder: '02-yingge',
    id: '09-formation-coil',
    title: '阵形俯瞰·田螺阵盘旋图',
    ref: 'yingge_village',
    subject:
      'Top-down geometric bird-eye view of the "Snail Spiral" (田螺阵) Yingge formation, concentric spiral of dancers converging toward the central drum.',
  },
  {
    folder: '02-yingge',
    id: '10-costume-bracer',
    title: '服饰细节·刺绣战袍与护腕草鞋',
    ref: 'yingge_portrait',
    subject:
      'Curated museum flat-lay of Chaoshan Yingge attire: embroidered martial sash, woven wrist bracers, red-tasseled headband, and braided straw sandals.',
  },

  // ==================== 03-tea (工夫茶页 · 10 张) ====================
  {
    folder: '03-tea',
    id: '01-step1-warm-cups',
    title: '五步之一·温杯热罐白雾初起',
    ref: 'tea_panel',
    subject:
      'Gongfu Tea Step 1 (温杯热罐): boiling water poured over a small vermilion clay teapot and white porcelain cups, delicate ribbons of warm steam rising.',
  },
  {
    folder: '03-tea',
    id: '02-step2-load-leaves',
    title: '五步之二·竹茶荷纳茶凤凰单丛',
    ref: 'tea_tray',
    subject:
      'Gongfu Tea Step 2 (纳茶): a curved bamboo tea scoop holding dark twisted Fenghuang Dancong oolong tea leaves beside an open clay teapot.',
  },
  {
    folder: '03-tea',
    id: '03-step3-high-pour',
    title: '五步之三·提壶高冲一注水线',
    ref: 'tea_panel',
    subject:
      'Gongfu Tea Step 3 (高冲注水): a kettle held high pouring a long, unbroken amber-clear arc of hot water into a tiny clay teapot.',
  },
  {
    folder: '03-tea',
    id: '04-step4-orbit-pour',
    title: '五步之四·关公巡城韩信点兵',
    ref: 'tea_panel',
    subject:
      'Gongfu Tea Step 4 (出汤分茶): low-Pouring golden-amber tea liquor evenly in a circular sweep across three tiny white Ruochen porcelain cups touching rims.',
  },
  {
    folder: '03-tea',
    id: '05-step5-offer-tea',
    title: '五步之五·双手奉茶闻香品茗',
    ref: 'tea_salon',
    subject:
      'Gongfu Tea Step 5 (敬茶闻香): a single tiny white porcelain cup filled with luminous amber tea resting on a brass saucer, fragrant steam curling upward.',
  },
  {
    folder: '03-tea',
    id: '06-vessel-mengchen-pot',
    title: '器物图谱·潮州朱泥孟臣小壶',
    ref: 'tea_tray',
    subject:
      'Solo museum portrait of a pear-shaped Chaozhou Zhuni red-clay teapot (孟臣壶) with a lustrous patina and fine hand-thrown rings.',
  },
  {
    folder: '03-tea',
    id: '07-vessel-ruochen-cups',
    title: '器物图谱·三只若琛白瓷品字杯',
    ref: 'tea_tray',
    subject:
      'Three eggshell-thin white porcelain tea cups (若琛杯) arranged in a tight triangle on a dark slotted wooden tea tray, filled with clear golden tea.',
  },
  {
    folder: '03-tea',
    id: '08-vessel-charcoal-stove',
    title: '器物图谱·红泥火炉与砂铫榄核炭',
    ref: 'tea_salon',
    subject:
      'A traditional Chaoshan red-clay wind stove (红泥小火炉) with glowing olive-pit charcoal embers and a side-handled clay kettle boiling gently.',
  },
  {
    folder: '03-tea',
    id: '09-vessel-gaiwan-scrape',
    title: '冲泡细节·盖碗刮沫淋顶一瞬',
    ref: 'tea_tray',
    subject:
      'Close-up of a porcelain Gaiwan lid gently skimming the fine white foam off the top of steeping oolong tea leaves.',
  },
  {
    folder: '03-tea',
    id: '10-fenghuang-tea-branch',
    title: '茶源风物·凤凰山古树单丛茶枝',
    ref: 'tea_salon',
    subject:
      'Botanical and cultural study of a fresh Camellia sinensis branch from Chaozhou Phoenix Mountain alongside roasted twisted Dancong tea leaves.',
  },

  // ==================== 04-food (潮汕美食页 · 10 张) ====================
  {
    folder: '04-food',
    id: '01-dish-beef-ball-soup',
    title: '代表菜·手打牛肉丸清汤配芹菜粒',
    ref: 'food_bowl',
    subject:
      'A classic Chaoshan porcelain bowl of clear beef-ball soup with bouncy hand-pounded beef balls, diced green celery, golden fried garlic bits, and a porcelain spoon.',
  },
  {
    folder: '04-food',
    id: '02-craft-iron-mallets',
    title: '非遗工序·双铁槌捶打牛后腿肉成浆',
    ref: 'food_beefball',
    subject:
      'Two heavy square-headed iron mallets resting on a thick pine chopping block beside freshly pounded bright-red beef paste.',
  },
  {
    folder: '04-food',
    id: '03-dish-kway-teow-soup',
    title: '代表菜·鲜切牛肉粿条汤',
    ref: 'food_panel',
    subject:
      'Steaming bowl of Chaoshan beef kway teow noodle soup: silky white flat rice ribbons topped with tender blanched beef slices, beef balls, and a saucer of shacha sauce.',
  },
  {
    folder: '04-food',
    id: '04-dish-braised-goose',
    title: '代表菜·潮州溪口卤鹅斩件拼盘',
    ref: 'food_goose',
    subject:
      'Glistening amber-skinned Chaozhou braised lion-head goose slices neatly arranged on an oval porcelain platter with coriander and a small dish of garlic-vinegar dip.',
  },
  {
    folder: '04-food',
    id: '05-craft-goose-spices',
    title: '非遗工序·老卤锅与八角桂皮南姜香料',
    ref: 'food_goose',
    subject:
      'Still-life of Chaoshan master滷水 aromatics: galangal root (南姜), star anise, cinnamon bark, cloves, licorice, and a clay pot of rich dark braising broth.',
  },
  {
    folder: '04-food',
    id: '06-dish-oyster-omelette',
    title: '代表菜·铁板香煎珠蚝烙',
    ref: 'food_omelette',
    subject:
      'Crispy golden-edged Chaoshan oyster omelette (蚝烙) sizzling on a flat cast-iron griddle, plump pearl oysters embedded in translucent sweet-potato starch batter.',
  },
  {
    folder: '04-food',
    id: '07-dish-red-peach-kueh',
    title: '时节粿品·红桃粿与雕花木粿印',
    ref: 'food_panel',
    subject:
      'Three blush-pink Chaoshan Red Peach Rice Cakes (红桃粿) embossed with auspicious longevity patterns, placed beside a hand-carved wooden kueh mold.',
  },
  {
    folder: '04-food',
    id: '08-craft-rice-noodle-steam',
    title: '非遗工序·竹箕炊蒸薄米浆切粿条',
    ref: 'food_panel',
    subject:
      'A round woven bamboo steamer tray holding a translucent sheet of freshly steamed rice-milk skin being sliced into flat kway teow strips.',
  },
  {
    folder: '04-food',
    id: '09-condiment-shacha-fishsauce',
    title: '潮味灵魂·沙茶酱、鱼露与金蒜油三味碟',
    ref: 'food_bowl',
    subject:
      'Three small porcelain seasoning dishes arranged symmetrically: rich peanut-sesame shacha sauce, amber Chaoshan fish sauce, and golden crispy fried garlic oil.',
  },
  {
    folder: '04-food',
    id: '10-night-porridge-table',
    title: '夜粥风物·白糜竹篓咸杂小菜一席',
    ref: 'food_bowl',
    subject:
      'Chaoshan late-night糜 (Daa-Leng) still-life: a clay bowl of thick white rice porridge surrounded by tiny plates of pickled olives, salted fish, and marinated raw crab.',
  },

  // ==================== 05-yinglaoye (营老爷页 · 8 张) ====================
  {
    folder: '05-yinglaoye',
    id: '01-gilded-sedan-chair',
    title: '核心器物·八抬金漆木雕老爷神轿',
    ref: 'yl_sedan',
    subject:
      'An ornate Chaoshan eight-bearer gilded woodcarving deity palanquin (老爷神轿) with dragon-phoenix roof finials, red silk curtains, and brass carrying poles.',
  },
  {
    folder: '05-yinglaoye',
    id: '02-bamboo-red-lanterns',
    title: '巡游仪仗·潮阳双忠竹编红灯笼对',
    ref: 'yl_lantern',
    subject:
      'A pair of traditional Chaoshan oil-glazed bamboo-woven red festival lanterns glowing warmly from within, suspended from carved wooden poles.',
  },
  {
    folder: '05-yinglaoye',
    id: '03-chaozhou-qinglong-parade',
    title: '三城案例之潮州·青龙古庙长街巡安',
    ref: 'yl_parade',
    subject:
      'Atmospheric architectural view of Chaozhou ancient archway street at dusk with a procession of red banners, lanterns, and a gilded palanquin passing beneath a stone牌坊.',
  },
  {
    folder: '05-yinglaoye',
    id: '04-shantou-chenghai-procession',
    title: '三城案例之汕头·澄海村落标旗与英歌开路',
    ref: 'yl_sedan',
    subject:
      'Embroidered triangular silk festival banners (标旗) and carved wooden仪仗 plaques carried along a traditional Shantou village lane lined with banyan trees.',
  },
  {
    folder: '05-yinglaoye',
    id: '05-jieyang-puning-fire-jump',
    title: '三城案例之揭阳·普宁夜间營老爷跳火堆',
    ref: 'yl_fire',
    subject:
      'A blazing ceremonial straw-and-charcoalbonfire in a village courtyard at night, golden sparks spiraling upward as a palanquin silhouette leaps across the flames.',
  },
  {
    folder: '05-yinglaoye',
    id: '06-southern-lion-guard',
    title: '巡游瑞兽·潮汕青狮与金狮采青',
    ref: 'yl_parade',
    subject:
      'A traditional Chaoshan Southern Lion mask (青狮) with bold painted brow, brass bells, and colorful pom-poms poised on a stone plinth.',
  },
  {
    folder: '05-yinglaoye',
    id: '07-chaozhou-big-gong-drum',
    title: '声景器物·潮州大锣鼓苏锣与深波',
    ref: 'yl_parade',
    subject:
      'A ceremonial Chaoshan large bronze gong (深波重锣) suspended in a carved rosewood frame with a padded mallet, warm metallic sheen.',
  },
  {
    folder: '05-yinglaoye',
    id: '08-ancestral-incense-altar',
    title: '祈福空间·古祠供桌香炉与红烛瑞烟',
    ref: 'yl_panel',
    subject:
      'A quiet bronze tripod incense burner on a carved wooden altar table, three curling threads of sandalwood smoke rising into the calm negative space.',
  },

  // ==================== 06-agent-listen (Agent 问一问 & 听潮页 · 4 张) ====================
  {
    folder: '06-agent-listen',
    id: '01-chaobot-avatar-idle',
    title: '潮Bot专注模式·少年英歌引路人半身像',
    ref: 'yingge_face',
    subject:
      'Refined cultural mascot portrait: a young Chaoshan archivist figure wearing a minimalist Yingge headband and holding miniature twin wooden sticks, calm welcoming expression.',
  },
  {
    folder: '06-agent-listen',
    id: '02-chaobot-archivist-scroll',
    title: '潮Bot检索态·翻阅潮州线装古籍与竹简',
    ref: 'tea_panel',
    subject:
      'An open thread-bound traditional Chinese古籍 book with a brass bookmark, a magnifying glass, and a small cup of Gongfu tea on a quiet scholar desk.',
  },
  {
    folder: '06-agent-listen',
    id: '03-listen-dialect-waves',
    title: '听潮方言页·潮州八音声律与古戏台水波纹',
    ref: 'home_pano',
    subject:
      'Poetic visualization of Chaoshan Eight-Tone dialect (潮州八音): a traditional Erxian fiddle and moon lute floating above concentric golden sound-ripples on dark water.',
  },
  {
    folder: '06-agent-listen',
    id: '04-listen-old-courtyard-chat',
    title: '听潮日常页·潮汕下山虎老厝天井闲话家常',
    ref: 'tea_salon',
    subject:
      'A tranquil Chaoshan courtyard patio under a banyan tree with a stone tea table, two bamboo stools, and a singing cicada cage, evoking everyday Teochew conversation.',
  },
]

const refCache = new Map()
function getRefDataUrl(refKey) {
  if (refCache.has(refKey)) return refCache.get(refKey)
  const filePath = REF_IMAGES[refKey] || REF_IMAGES.home_pano
  const ext = path.extname(filePath).toLowerCase()
  const mime = ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : ext === '.png' ? 'image/png' : 'image/webp'
  const b64 = readFileSync(filePath).toString('base64')
  const url = `data:${mime};base64,${b64}`
  refCache.set(refKey, url)
  return url
}

async function generateOne(verKey, shot, idx, total) {
  const ver = STYLE_VERSIONS[verKey]
  const outDir = path.join(ROOT_OUT, ver.id, shot.folder)
  mkdirSync(outDir, { recursive: true })
  const outWebp = path.join(outDir, `${shot.id}.webp`)
  const outMeta = path.join(outDir, `${shot.id}.json`)

  if (!FORCE && existsSync(outWebp)) {
    console.log(`[${ver.id}] (${idx}/${total}) 跳过已存在: ${shot.folder}/${shot.id}.webp`)
    return { ok: true, skipped: true, file: outWebp }
  }

  const fullPrompt = `${ver.styleLock} Subject: ${shot.subject}`
  const refDataUrl = getRefDataUrl(shot.ref)

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      console.log(`[${ver.id}] (${idx}/${total}) 生成 ${shot.folder}/${shot.id} (attempt ${attempt})...`)
      const res = await fetch(`${API_BASE}/images/edits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gpt-image-2.6',
          prompt: fullPrompt,
          size: '1024x1024',
          response_format: 'url',
          image: [refDataUrl],
        }),
      })
      const text = await res.text()
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${text.slice(0, 180)}`)
      const parsed = JSON.parse(text)
      const item = (parsed.data && parsed.data[0]) || {}
      let rawBuf
      if (item.b64_json) {
        rawBuf = Buffer.from(item.b64_json, 'base64')
      } else if (item.url) {
        const dl = await fetch(item.url)
        if (!dl.ok) throw new Error(`下载失败 ${dl.status}: ${item.url}`)
        rawBuf = Buffer.from(await dl.arrayBuffer())
      } else {
        throw new Error(`无图片数据: ${text.slice(0, 180)}`)
      }

      const tmpPng = path.join(outDir, `${shot.id}.tmp.png`)
      writeFileSync(tmpPng, rawBuf)
      execFileSync('ffmpeg', ['-y', '-i', tmpPng, '-vf', 'scale=1024:1024', '-q:v', '86', outWebp], {
        stdio: 'ignore',
      })
      try {
        execFileSync('rm', ['-f', tmpPng])
      } catch {
        // ignore
      }

      writeFileSync(
        outMeta,
        JSON.stringify(
          {
            version: ver.id,
            versionTitle: ver.title,
            folder: shot.folder,
            id: shot.id,
            title: shot.title,
            model: 'gpt-image-2.6',
            size: '1024x1024',
            referenceImage: REF_IMAGES[shot.ref],
            prompt: fullPrompt,
            generatedAt: new Date().toISOString(),
          },
          null,
          2,
        ),
      )
      console.log(`[${ver.id}] (${idx}/${total}) ✓ 完成 ${shot.folder}/${shot.id}.webp`)
      return { ok: true, file: outWebp }
    } catch (err) {
      console.error(`[${ver.id}] (${idx}/${total}) ✗ ${shot.id} 第 ${attempt} 次失败: ${err.message}`)
      if (attempt === 3) return { ok: false, id: shot.id, error: err.message }
      await new Promise((r) => setTimeout(r, 4000 * attempt))
    }
  }
}

async function runVersion(verKey) {
  const ver = STYLE_VERSIONS[verKey]
  if (!ver) throw new Error(`未知版本: ${verKey}`)
  console.log(`\n=== 开始生成 ${ver.id} (${ver.title}) · 共 ${PAGE_SHOTS.length} 张 1:1 ===`)
  const results = []
  let cursor = 0

  async function worker() {
    while (cursor < PAGE_SHOTS.length) {
      const i = cursor++
      const shot = PAGE_SHOTS[i]
      const r = await generateOne(verKey, shot, i + 1, PAGE_SHOTS.length)
      results.push(r)
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()))
  const okCount = results.filter((r) => r?.ok).length
  const failCount = results.length - okCount
  console.log(`=== ${ver.id} 完成：成功 ${okCount}/${PAGE_SHOTS.length}，失败 ${failCount} ===`)
  return { ver: ver.id, okCount, failCount }
}

function dumpMarkdown() {
  mkdirSync(ROOT_OUT, { recursive: true })
  const lines = [
    '# 老爷保号 · 三套 1:1 传统文化视觉资产提示词总册（GPT-Image-2.6 图生图）',
    '',
    '- **生成接口**：Provider 14 (`http://127.0.0.1:8791/v1/images/edits`)',
    '- **模��**：`gpt-image-2.6`（基于站内真实实拍/馆藏参考图锚定构图）',
    '- **画幅规格**：`1024×1024`（1:1 方形，WebP 自托管）',
    '- **目录结构**：`public/media/cultural-sets/<版本目录>/<页面子文件夹>/<编号-名称>.webp`',
    '- **规模**：3 个版本 × 每套 50 张 = **共 150 张**',
    '',
    '---',
    '',
    '## 一、三套版本的「风格一致性高级锁（Style DNA Lock）」',
    '',
  ]

  for (const [k, v] of Object.entries(STYLE_VERSIONS)) {
    lines.push(`### ${k.toUpperCase()} · \`${v.id}\``)
    lines.push(`**${v.title}**`)
    lines.push('')
    lines.push(`- **视觉定位**：${v.summary}`)
    lines.push('- **Master Style Lock Prompt**：')
    lines.push('```text')
    lines.push(v.styleLock)
    lines.push('```')
    lines.push('')
  }

  lines.push('---')
  lines.push('')
  lines.push('## 二、按页面设计的 50 张 1:1 资产母题与提示词明细')
  lines.push('')
  lines.push('| # | 页面子文件夹 | 文件 ID | 中文设计说明 | 参考底图 (`image`) | Subject Prompt（与上方版本 Style Lock 拼接） |')
  lines.push('|---:|---|---|---|---|---|')

  PAGE_SHOTS.forEach((s, i) => {
    lines.push(
      `| ${i + 1} | \`${s.folder}\` | \`${s.id}.webp\` | ${s.title} | \`${REF_IMAGES[s.ref]}\` | ${s.subject} |`,
    )
  })

  const mdPath = path.join(ROOT_OUT, 'PROMPTS.md')
  writeFileSync(mdPath, lines.join('\n') + '\n')
  console.log(`已写入提示词总册: ${mdPath}`)
}

const arg = process.argv[2] || 'dump-md'
if (arg === 'dump-md') {
  dumpMarkdown()
} else if (arg === 'all') {
  dumpMarkdown()
  for (const k of ['v1', 'v2', 'v3']) {
    await runVersion(k)
  }
} else if (STYLE_VERSIONS[arg]) {
  dumpMarkdown()
  await runVersion(arg)
} else {
  console.error('用法: node scripts/gen-cultural-sets.mjs [v1|v2|v3|all|dump-md]')
  process.exit(1)
}
