# 老爷保号 · 三套 1:1 传统文化视觉资产提示词总册（GPT-Image-2.6 图生图）

- **生成接口**：Provider 14 (`http://127.0.0.1:8791/v1/images/edits`)
- **模��**：`gpt-image-2.6`（基于站内真实实拍/馆藏参考图锚定构图）
- **画幅规格**：`1024×1024`（1:1 方形，WebP 自托管）
- **目录结构**：`public/media/cultural-sets/<版本目录>/<页面子文件夹>/<编号-名称>.webp`
- **规模**：3 个版本 × 每套 50 张 = **共 150 张**

---

## 一、三套版本的「风格一致性高级锁（Style DNA Lock）」

### V1 · `v1-dunhuang-mineral`
**版本一：敦煌藏经洞矿物重彩 × 宋刻本古籍留白风 (Dunhuang Mineral Pigment & Song Woodblock Print)**

- **视觉定位**：参考 cave17.e-dunhuang.com 与宋代善本版画：粗颗粒手工麻纸/桑皮纸肌理（#D9CBAF 暖沙纸底），天然矿物颜料（朱砂 #824239、石青 #3B5B5E、石绿 #536B66、赭石 #9A6B46、泥金 #C8A464），铁线描勾勒，单主体居中偏黄金分割位，四周 ≥45% 呼吸感古纸留白。
- **Master Style Lock Prompt**：
```text
Masterpiece traditional Chinese mineral pigment illustration on aged Dunhuang hemp-mulberry paper (#D9CBAF warm sand parchment texture), inspired by cave17.e-dunhuang.com and Song Dynasty fine woodblock book art (Lü Jingren editorial aesthetic). Natural ground mineral palette: cinnabar vermilion (#824239), azurite mineral blue-green (#536B66), raw ochre (#9A6B46), and delicate gold-leaf hairlines (#C8A464). Fine iron-wire ink linework (铁线描) with weathered mural patina, museum-grade editorial composition, 1:1 square aspect ratio, at least 45% negative parchment space around a single iconic subject, flat diffused archival lighting, strictly no text, no letters, no watermark, no modern UI.
```

### V2 · `v2-palace-lacquer`
**版本二：故宫多宝阁黑漆描金 × 宋代院体静物光影风 (Imperial Dark Lacquer & Song Court Still-Life)**

- **视觉定位**：参考故宫数字多宝阁 (dpm.org.cn/shuziduobaoge.html) 与宋徽宗院体画：深邃推光乌木黑漆与深墨青暗场（#141C18 → #0E1310），单束博物馆级戏剧化伦勃朗顶侧聚光，温润汝窑/紫砂/丝绸/金漆真实文物级材质反射，暗部藏入极静负空间，庄重、内敛、皇家典藏感。
- **Master Style Lock Prompt**：
```text
Imperial Palace Museum Digital Duobaoge (数字多宝阁) curatorial aesthetic fused with Song Dynasty court academy realism (院体工笔重彩). Set against a deep polished ebony-lacquer and dark ink-pine void (#141C18 to #0D120F), illuminated by a single dramatic museum spotlight from top-left. Hyper-tactile heritage materials: luminous gilded lacquer, translucent porcelain glaze, aged bronze, hand-woven silk, and warm incense smoke. Strict 1:1 square composition with 50% velvety dark negative space, subtle gold-dust rim highlights (#B08A5A), timeless museum gravitas, strictly no text, no watermark, no artificial neon.
```

### V3 · `v3-chaoshan-craft`
**版本三：潮汕金漆木雕·屋脊嵌瓷·佛山潮州木版年画在地非遗风 (Chaoshan Gilded Woodcarving, Porcelain Inlay & Folk Woodcut)**

- **视觉定位**：纯正岭南与潮汕在地工艺美术语言：融合潮州金漆木雕（多层镂空贴金）、潮汕古厝屋脊嵌瓷（彩瓷片立体拼贴）、潮州朱泥手拉壶与传统木版套色年画刀味；靛蓝海潮底（#1B2A32）配潮州大红（#B63B2A）、金箔（#E0AE4E）与贝灰白（#F2ECE1），既有民间烟火气又有当代艺术馆版式克制感。
- **Master Style Lock Prompt**：
```text
Authentic Chaoshan intangible cultural heritage craft aesthetic: a synthesis of Chaozhou多层镂空 gilded woodcarving (潮州金漆木雕), iridescent Chaoshan rooftop porcelain-shard inlay (嵌瓷), and traditional Teochew polychrome woodblock printmaking (木版年画). Color harmony anchored in South China Sea indigo (#1B2A32), auspicious Chaoshan vermilion (#B63B2A), pure 24k gold leaf (#E0AE4E), and shell-lime white (#F2ECE1). Crisp carved relief edges, tactile ceramic and woodgrain textures, curated 1:1 square gallery framing with generous clean breathing room, strictly no text, no letters, no watermark.
```

---

## 二、按页面设计的 50 张 1:1 资产母题与提示词明细

| # | 页面子文件夹 | 文件 ID | 中文设计说明 | 参考底图 (`image`) | Subject Prompt（与上方版本 Style Lock 拼接） |
|---:|---|---|---|---|---|
| 1 | `01-home` | `01-seal-emblem.webp` | 老爷保号·总馆朱文方印章徽 | `public/media/home/hero/panorama-master.webp` | A ceremonial square carving seal emblem crafted from aged red-stone and gilded wood, featuring abstract motifs of Yingge wooden clubs, a Gongfu teapot, a porcelain soup bowl, and a deity lantern harmoniously intertwined at the center. |
| 2 | `01-home` | `02-chaoshan-gate.webp` | 潮汕传统四点金祠堂中门开启 | `public/media/home/hero/panorama-master.webp` | Slightly ajar ornate wooden double doors of a traditional Chaoshan Si-Dian-Jin ancestral hall, warm golden lantern light spilling through the center gap, stone drum pedestals on both sides. |
| 3 | `01-home` | `03-door-yingge.webp` | 首页四章门扉之一·英歌战舞 | `public/media/home/hero/panel-yingge.webp` | Curatorial chapter emblem for Yingge Dance: a pair of crossed dark-wood Yingge clubs tied with crimson silk ribbons hovering above a ceremonial war drum. |
| 4 | `01-home` | `04-door-tea.webp` | 首页四章门扉之二·工夫茶席 | `public/media/home/hero/panel-tea.webp` | Curatorial chapter emblem for Chaoshan Gongfu Tea: a miniature Mengchen vermilion clay teapot poised over three delicate white porcelain cups arranged in a品-character triangle. |
| 5 | `01-home` | `05-door-food.webp` | 首页四章门扉之三·潮味食单 | `public/media/home/hero/panel-food.webp` | Curatorial chapter emblem for Chaoshan Cuisine: a blue-and-white porcelain bowl of steaming beef balls with bamboo chopsticks resting on a carved wooden stand. |
| 6 | `01-home` | `06-door-yinglaoye.webp` | 首页四章门扉之四·营老爷夜巡 | `public/media/home/hero/panel-yinglaoye.webp` | Curatorial chapter emblem for Yinglaoye Procession: an八抬 gilded deity palanquin roof crown flanked by two glowing bamboo-frame red paper lanterns. |
| 7 | `01-home` | `07-guangji-bridge.webp` | 潮州广济桥十八梭船廿四洲意象 | `public/media/home/hero/panorama-master.webp` | Poetic architectural study of Chaozhou Guangji Bridge: a traditional timber pavilion pier connected by floating wooden pontoons over misty river water. |
| 8 | `01-home` | `08-red-head-junk.webp` | 樟林古港红头船下南洋印记 | `public/media/home/hero/panorama-master.webp` | A classic Chaoshan Red-Head Junk (红头船) with crimson bow and billowing woven sails gliding across calm stylized sea waves. |
| 9 | `02-yingge` | `01-head-club-red.webp` | 头槌角色·关胜红面红须立像 | `public/media/home/gdstwhg/yingge-portrait.webp` | Heroic portrait of the First-Stick (头槌) Yingge dancer with fierce red-and-gold painted opera face and long red beard, leaping mid-air while striking two wooden sticks. |
| 10 | `02-yingge` | `02-second-club-black.webp` | 二槌角色·李逵黑面旋身立像 | `public/media/home/gdstwhg/yingge-stage.webp` | Dynamic portrait of the Second-Stick (二槌) Yingge warrior with bold black-and-white vortex opera face paint, horse-stance crouch, swinging dual wooden sticks. |
| 11 | `02-yingge` | `03-snake-dancer.webp` | 时迁舞蛇·引队灵动角色 | `public/media/home/gdstwhg/yingge-stage.webp` | The agile Scout character (时迁) in Chaoshan Yingge Dance, wearing a swallow-tail headscarf and holding a coiled cloth serpent prop, guiding the formation. |
| 12 | `02-yingge` | `04-twin-clubs-strike.webp` | 器物特写·双槌对击迸发金星 | `public/media/home/hero/panel-yingge.webp` | Close-up still-life of two polished hardwood Yingge sticks (英歌槌) wrapped in red cloth at the grip, colliding in mid-air with a burst of fine golden dust. |
| 13 | `02-yingge` | `05-command-drum.webp` | 器物特写·司鼓大鼓与鼓槌 | `public/media/home/gdstwhg/yingge-village.webp` | A traditional Chaoshan cowhide command drum (司鼓) painted with auspicious cloud rims on a wooden stand, two heavy drumsticks resting on top. |
| 14 | `02-yingge` | `06-brass-cymbals-gong.webp` | 器物特写·钦仔铜锣与大钹 | `public/media/home/gdstwhg/yingge-village.webp` | Hand-hammered Chaoshan bronze gong and pair of brass cymbals tied with aged red cords, catching warm side light with subtle acoustic ripples. |
| 15 | `02-yingge` | `07-facepaint-mask.webp` | 脸谱图谱·梁山好汉脸谱精绘 | `public/media/home/collage/yingge/yingge-face-detail.webp` | Symmetrical frontal study of a traditional Chaoshan Yingge opera face-paint pattern featuring fire-clouds, black eye-frames, and gold brow markings. |
| 16 | `02-yingge` | `08-formation-dragon.webp` | 阵形俯瞰·双龙出海阵势图 | `public/media/home/gdstwhg/yingge-village.webp` | Top-down architectural diagram of the "Twin Dragons Emerging from the Sea" (双龙出海) Yingge dance formation: two parallel curving streams of tiny dancer figures and red lantern markers. |
| 17 | `02-yingge` | `09-formation-coil.webp` | 阵形俯瞰·田螺阵盘旋图 | `public/media/home/gdstwhg/yingge-village.webp` | Top-down geometric bird-eye view of the "Snail Spiral" (田螺阵) Yingge formation, concentric spiral of dancers converging toward the central drum. |
| 18 | `02-yingge` | `10-costume-bracer.webp` | 服饰细节·刺绣战袍与护腕草鞋 | `public/media/home/gdstwhg/yingge-portrait.webp` | Curated museum flat-lay of Chaoshan Yingge attire: embroidered martial sash, woven wrist bracers, red-tasseled headband, and braided straw sandals. |
| 19 | `03-tea` | `01-step1-warm-cups.webp` | 五步之一·温杯热罐白雾初起 | `public/media/home/hero/panel-tea.webp` | Gongfu Tea Step 1 (温杯热罐): boiling water poured over a small vermilion clay teapot and white porcelain cups, delicate ribbons of warm steam rising. |
| 20 | `03-tea` | `02-step2-load-leaves.webp` | 五步之二·竹茶荷纳茶凤凰单丛 | `public/media/home/teochew-kanghu-tea.webp` | Gongfu Tea Step 2 (纳茶): a curved bamboo tea scoop holding dark twisted Fenghuang Dancong oolong tea leaves beside an open clay teapot. |
| 21 | `03-tea` | `03-step3-high-pour.webp` | 五步之三·提壶高冲一注水线 | `public/media/home/hero/panel-tea.webp` | Gongfu Tea Step 3 (高冲注水): a kettle held high pouring a long, unbroken amber-clear arc of hot water into a tiny clay teapot. |
| 22 | `03-tea` | `04-step4-orbit-pour.webp` | 五步之四·关公巡城韩信点兵 | `public/media/home/hero/panel-tea.webp` | Gongfu Tea Step 4 (出汤分茶): low-Pouring golden-amber tea liquor evenly in a circular sweep across three tiny white Ruochen porcelain cups touching rims. |
| 23 | `03-tea` | `05-step5-offer-tea.webp` | 五步之五·双手奉茶闻香品茗 | `public/media/home/gdstwhg/tea-salon.webp` | Gongfu Tea Step 5 (敬茶闻香): a single tiny white porcelain cup filled with luminous amber tea resting on a brass saucer, fragrant steam curling upward. |
| 24 | `03-tea` | `06-vessel-mengchen-pot.webp` | 器物图谱·潮州朱泥孟臣小壶 | `public/media/home/teochew-kanghu-tea.webp` | Solo museum portrait of a pear-shaped Chaozhou Zhuni red-clay teapot (孟臣壶) with a lustrous patina and fine hand-thrown rings. |
| 25 | `03-tea` | `07-vessel-ruochen-cups.webp` | 器物图谱·三只若琛白瓷品字杯 | `public/media/home/teochew-kanghu-tea.webp` | Three eggshell-thin white porcelain tea cups (若琛杯) arranged in a tight triangle on a dark slotted wooden tea tray, filled with clear golden tea. |
| 26 | `03-tea` | `08-vessel-charcoal-stove.webp` | 器物图谱·红泥火炉与砂铫榄核炭 | `public/media/home/gdstwhg/tea-salon.webp` | A traditional Chaoshan red-clay wind stove (红泥小火炉) with glowing olive-pit charcoal embers and a side-handled clay kettle boiling gently. |
| 27 | `03-tea` | `09-vessel-gaiwan-scrape.webp` | 冲泡细节·盖碗刮沫淋顶一瞬 | `public/media/home/teochew-kanghu-tea.webp` | Close-up of a porcelain Gaiwan lid gently skimming the fine white foam off the top of steeping oolong tea leaves. |
| 28 | `03-tea` | `10-fenghuang-tea-branch.webp` | 茶源风物·凤凰山古树单丛茶枝 | `public/media/home/gdstwhg/tea-salon.webp` | Botanical and cultural study of a fresh Camellia sinensis branch from Chaozhou Phoenix Mountain alongside roasted twisted Dancong tea leaves. |
| 29 | `04-food` | `01-dish-beef-ball-soup.webp` | 代表菜·手打牛肉丸清汤配芹菜粒 | `public/media/home/collage/food/bowl-beef-ball.webp` | A classic Chaoshan porcelain bowl of clear beef-ball soup with bouncy hand-pounded beef balls, diced green celery, golden fried garlic bits, and a porcelain spoon. |
| 30 | `04-food` | `02-craft-iron-mallets.webp` | 非遗工序·双铁槌捶打牛后腿肉成浆 | `public/media/home/gdstwhg/food-beefball.webp` | Two heavy square-headed iron mallets resting on a thick pine chopping block beside freshly pounded bright-red beef paste. |
| 31 | `04-food` | `03-dish-kway-teow-soup.webp` | 代表菜·鲜切牛肉粿条汤 | `public/media/home/hero/panel-food.webp` | Steaming bowl of Chaoshan beef kway teow noodle soup: silky white flat rice ribbons topped with tender blanched beef slices, beef balls, and a saucer of shacha sauce. |
| 32 | `04-food` | `04-dish-braised-goose.webp` | 代表菜·潮州溪口卤鹅斩件拼盘 | `public/media/photos/food-braised-goose.jpg` | Glistening amber-skinned Chaozhou braised lion-head goose slices neatly arranged on an oval porcelain platter with coriander and a small dish of garlic-vinegar dip. |
| 33 | `04-food` | `05-craft-goose-spices.webp` | 非遗工序·老卤锅与八角桂皮南姜香料 | `public/media/photos/food-braised-goose.jpg` | Still-life of Chaoshan master滷水 aromatics: galangal root (南姜), star anise, cinnamon bark, cloves, licorice, and a clay pot of rich dark braising broth. |
| 34 | `04-food` | `06-dish-oyster-omelette.webp` | 代表菜·铁板香煎珠蚝烙 | `public/media/photos/food-oyster-omelette.jpg` | Crispy golden-edged Chaoshan oyster omelette (蚝烙) sizzling on a flat cast-iron griddle, plump pearl oysters embedded in translucent sweet-potato starch batter. |
| 35 | `04-food` | `07-dish-red-peach-kueh.webp` | 时节粿品·红桃粿与雕花木粿印 | `public/media/home/hero/panel-food.webp` | Three blush-pink Chaoshan Red Peach Rice Cakes (红桃粿) embossed with auspicious longevity patterns, placed beside a hand-carved wooden kueh mold. |
| 36 | `04-food` | `08-craft-rice-noodle-steam.webp` | 非遗工序·竹箕炊蒸薄米浆切粿条 | `public/media/home/hero/panel-food.webp` | A round woven bamboo steamer tray holding a translucent sheet of freshly steamed rice-milk skin being sliced into flat kway teow strips. |
| 37 | `04-food` | `09-condiment-shacha-fishsauce.webp` | 潮味灵魂·沙茶酱、鱼露与金蒜油三味碟 | `public/media/home/collage/food/bowl-beef-ball.webp` | Three small porcelain seasoning dishes arranged symmetrically: rich peanut-sesame shacha sauce, amber Chaoshan fish sauce, and golden crispy fried garlic oil. |
| 38 | `04-food` | `10-night-porridge-table.webp` | 夜粥风物·白糜竹篓咸杂小菜一席 | `public/media/home/collage/food/bowl-beef-ball.webp` | Chaoshan late-night糜 (Daa-Leng) still-life: a clay bowl of thick white rice porridge surrounded by tiny plates of pickled olives, salted fish, and marinated raw crab. |
| 39 | `05-yinglaoye` | `01-gilded-sedan-chair.webp` | 核心器物·八抬金漆木雕老爷神轿 | `public/media/photos/yinglaoye-chaoyang-sedan.jpg` | An ornate Chaoshan eight-bearer gilded woodcarving deity palanquin (老爷神轿) with dragon-phoenix roof finials, red silk curtains, and brass carrying poles. |
| 40 | `05-yinglaoye` | `02-bamboo-red-lanterns.webp` | 巡游仪仗·潮阳双忠竹编红灯笼对 | `public/media/home/collage/yinglaoye/lantern.webp` | A pair of traditional Chaoshan oil-glazed bamboo-woven red festival lanterns glowing warmly from within, suspended from carved wooden poles. |
| 41 | `05-yinglaoye` | `03-chaozhou-qinglong-parade.webp` | 三城案例之潮州·青龙古庙长街巡安 | `public/media/home/gdstwhg/parade-float.webp` | Atmospheric architectural view of Chaozhou ancient archway street at dusk with a procession of red banners, lanterns, and a gilded palanquin passing beneath a stone牌坊. |
| 42 | `05-yinglaoye` | `04-shantou-chenghai-procession.webp` | 三城案例之汕头·澄海村落标旗与英歌开路 | `public/media/photos/yinglaoye-chaoyang-sedan.jpg` | Embroidered triangular silk festival banners (标旗) and carved wooden仪仗 plaques carried along a traditional Shantou village lane lined with banyan trees. |
| 43 | `05-yinglaoye` | `05-jieyang-puning-fire-jump.webp` | 三城案例之揭阳·普宁夜间營老爷跳火堆 | `public/media/photos/yinglaoye-fire-jump.jpg` | A blazing ceremonial straw-and-charcoalbonfire in a village courtyard at night, golden sparks spiraling upward as a palanquin silhouette leaps across the flames. |
| 44 | `05-yinglaoye` | `06-southern-lion-guard.webp` | 巡游瑞兽·潮汕青狮与金狮采青 | `public/media/home/gdstwhg/parade-float.webp` | A traditional Chaoshan Southern Lion mask (青狮) with bold painted brow, brass bells, and colorful pom-poms poised on a stone plinth. |
| 45 | `05-yinglaoye` | `07-chaozhou-big-gong-drum.webp` | 声景器物·潮州大锣鼓苏锣与深波 | `public/media/home/gdstwhg/parade-float.webp` | A ceremonial Chaoshan large bronze gong (深波重锣) suspended in a carved rosewood frame with a padded mallet, warm metallic sheen. |
| 46 | `05-yinglaoye` | `08-ancestral-incense-altar.webp` | 祈福空间·古祠供桌香炉与红烛瑞烟 | `public/media/home/hero/panel-yinglaoye.webp` | A quiet bronze tripod incense burner on a carved wooden altar table, three curling threads of sandalwood smoke rising into the calm negative space. |
| 47 | `06-agent-listen` | `01-chaobot-avatar-idle.webp` | 潮Bot专注模式·少年英歌引路人半身像 | `public/media/home/collage/yingge/yingge-face-detail.webp` | Refined cultural mascot portrait: a young Chaoshan archivist figure wearing a minimalist Yingge headband and holding miniature twin wooden sticks, calm welcoming expression. |
| 48 | `06-agent-listen` | `02-chaobot-archivist-scroll.webp` | 潮Bot检索态·翻阅潮州线装古籍与竹简 | `public/media/home/hero/panel-tea.webp` | An open thread-bound traditional Chinese古籍 book with a brass bookmark, a magnifying glass, and a small cup of Gongfu tea on a quiet scholar desk. |
| 49 | `06-agent-listen` | `03-listen-dialect-waves.webp` | 听潮方言页·潮州八音声律与古戏台水波纹 | `public/media/home/hero/panorama-master.webp` | Poetic visualization of Chaoshan Eight-Tone dialect (潮州八音): a traditional Erxian fiddle and moon lute floating above concentric golden sound-ripples on dark water. |
| 50 | `06-agent-listen` | `04-listen-old-courtyard-chat.webp` | 听潮日常页·潮汕下山虎老厝天井闲话家常 | `public/media/home/gdstwhg/tea-salon.webp` | A tranquil Chaoshan courtyard patio under a banyan tree with a stone tea table, two bamboo stools, and a singing cicada cage, evoking everyday Teochew conversation. |
