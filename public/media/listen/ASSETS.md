# 听潮音频资产记录（public/media/listen）

本目录的音频全部来自 Wikimedia Commons 的潮州话（Teochew）发音文件。
逐条核对过文件页的 `extmetadata`：作者（Artist）、许可证（LicenseShortName / LicenseUrl）、
文件描述（ImageDescription，含汉字与口音说明）与原始文件 URL。核对日期：2026-11-05。

## 署名与许可（必须保留）

- 作者：Austin Zhang（20 条）、Oh! Tea（1 条）
- 许可证：Creative Commons Attribution-ShareAlike 4.0 International（CC BY-SA 4.0）
- 许可全文：https://creativecommons.org/licenses/by-sa/4.0/
- 署名格式：`Austin Zhang, CC BY-SA 4.0, via Wikimedia Commons`
- 授权要点（CC BY-SA 4.0 官方摘要）：允许复制、分发、修改，允许商业使用；
  必须署名、附许可链接、注明是否修改；修改后的作品须以同一许可分享；不得暗示作者为本站背书。
- 本站修改：仅把原始 Ogg Vorbis / WAV 转码为 MP3（`ffmpeg -acodec libmp3lame -q:a 4`），
  未剪辑、未改变读音。转码件同样按 CC BY-SA 4.0 提供。

## 上线文件

| 词条 ID | 本地文件 | 原始文件（Wikimedia Commons） | 作者 | 许可 | 口音（来源页标注） | 时长 | MP3 SHA-256 |
|---|---|---|---|---|---|---|---|
| audio-greeting-1 | `greeting-sih-pa-bui.mp3` | https://commons.wikimedia.org/wiki/File:Zh-nan-czhu,_ziah8_ba2_bhu%C3%AA7.ogg | Austin Zhang | CC BY-SA 4.0 | 潮州话，普宁—潮阳混合口音，男声 | 1.05s | `43ed1be7b6d79d5c9b71878209abd8523ab0f016f07536c85c9e1c2893c9ef8b` |
| audio-greeting-2 | `greeting-sing-ni-kuai-lak.mp3` | https://commons.wikimedia.org/wiki/File:Zh-nan-czhu,_Sing1_ni5_kuai3_lag8.ogg | Austin Zhang | CC BY-SA 4.0 | 潮州话，普宁—潮阳混合口音，男声 | 2.87s | `04d94d3d09502dd6fbac598945309f0f579f1a621bf693b6c65282a1bef19d3b` |
| audio-tea-food-1 | `tea-food-ziah-menhng.mp3` | https://commons.wikimedia.org/wiki/File:Zh-nan-czhu,_ziah8_m%C3%AAn5_hng1.ogg | Austin Zhang | CC BY-SA 4.0 | 潮州话，普宁—潮阳混合口音，男声 | 0.79s | `4d4a849f2d4a99b000176c4ca25c65d20c2bcc8e859b9c29b0aff4a4cfb01f31` |
| audio-tea-food-2 | `tea-food-meicai-pei-mue.mp3` | https://commons.wikimedia.org/wiki/File:%E6%A2%85%E8%8F%9C%E9%85%8D%E7%B3%9C_(bvu%C3%AA-tsh%C3%A0i_pfhu%C3%A8-mvu%C3%AA).wav | Oh! Tea | CC BY-SA 4.0 | 潮州话（Teochew Min），普宁男声 | 1.51s | `91aaaa7b714f8b184d6b72d9e0632ffb2f7dcb314f09297e5d14b9039ba825ca` |
| audio-courtesy-1 | `courtesy-zoi-sia.mp3` | https://commons.wikimedia.org/wiki/File:Zh-nan-czhu,_zoi7_sia7.ogg | Austin Zhang | CC BY-SA 4.0 | 潮州话，普宁—潮阳混合口音，男声 | 0.92s | `8edf7733514249f6aeed2dc71c88a02d0a189fc736ee0126101c850c82bd3d49` |
| audio-courtesy-2 | `courtesy-mai-kheh-khi.mp3` | https://commons.wikimedia.org/wiki/File:Zh-nan-czhu,_mai3_k%C3%AAh4_ki3.ogg | Austin Zhang | CC BY-SA 4.0 | 潮州话，普宁—潮阳混合口音，男声 | 1.04s | `17b30f24d473a78b99640eb6248a73c569ea1d3bafafe25eeea9ceff64d52574` |
| audio-culture-1 | `culture-dio-ziu.mp3` | https://commons.wikimedia.org/wiki/File:Zh-nan-czhu,_dio5_ziu1.ogg | Austin Zhang | CC BY-SA 4.0 | 潮州话，普宁—潮阳混合口音，男声 | 0.95s | `51c6a6ab969c78d199129ad58a79f0f1493f7e7dd8fad1574adb6d6e8553db4b` |
| audio-culture-2 | `culture-dio-suan-ue.mp3` | https://commons.wikimedia.org/wiki/File:Zh-nan-czhu,_dio5_suan1_u%C3%AA7.ogg | Austin Zhang | CC BY-SA 4.0 | 潮州话，普宁—潮阳混合口音，男声 | 1.20s | `49606f054ae27812c274cf62ef7c1fcb68b429bd91699e42d00545b9763a26b0` |
| audio-greeting-3 | `greeting-sing-ti-giang-kang.mp3` | https://commons.wikimedia.org/wiki/File:Zh-nan-czhu,_Sing1_ti2_giang6_kang1.ogg | Austin Zhang | CC BY-SA 4.0 | 潮州话，普宁—潮阳混合口音，男声 | 2.71s | `cc0ca877cebc4a207f43e8752613420ea7aa77f725e7854f88f9639e21d5cd72` |
| audio-tea-food-3 | `tea-food-dou-iao.mp3` | https://commons.wikimedia.org/wiki/File:Zh-nan-czhu,_dou2_iao1.ogg | Austin Zhang | CC BY-SA 4.0 | 潮州话，普宁—潮阳混合口音，男声 | 0.67s | `8b0072d7828dfb852ae6b857c88f1b1cd5a7a8d29f7f2316201a2946d0f2606e` |
| audio-tea-food-4 | `tea-food-uan-gian-min.mp3` | https://commons.wikimedia.org/wiki/File:Zh-nan-czhu,_uan2_gian2_min7.ogg | Austin Zhang | CC BY-SA 4.0 | 潮州话，普宁—潮阳混合口音，男声 | 0.80s | `28d3df043910b126538e037f518f37f554272a165a1e8434bf670d54e4876672` |
| audio-tea-food-5 | `tea-food-goi-zab-min.mp3` | https://commons.wikimedia.org/wiki/File:Zhx-teo,_goi1_zab4_min7.ogg | Austin Zhang | CC BY-SA 4.0 | 潮州话，普宁—潮阳混合口音，男声 | 1.08s | `e6e23435bf2c8d4010ec9b862fc80d9b41dd603673841bddac4381cfbd34a243` |
| audio-courtesy-3 | `courtesy-bho-iao-ging.mp3` | https://commons.wikimedia.org/wiki/File:Zh-nan-czhu,_bho5_iao3_ging2.ogg | Austin Zhang | CC BY-SA 4.0 | 潮州话，普宁—潮阳混合口音，男声 | 0.98s | `88b8c042b58cbe0ff9e4020bf7cf7bb1fd0d8a01beee5252ee5dfdaa64823eba` |
| audio-courtesy-4 | `courtesy-mo-i-su.mp3` | https://commons.wikimedia.org/wiki/File:Zh-nan-czhu,_mo2_i3_su3.ogg | Austin Zhang | CC BY-SA 4.0 | 潮州话，普宁—潮阳混合口音，男声 | 1.03s | `93d38681e204a7a35883fcb62d9efc482ff77177ebd6ff4c229401f70021b3d5` |
| audio-courtesy-5 | `courtesy-bho-biang.mp3` | https://commons.wikimedia.org/wiki/File:Zh-nan-czhu,_Bho5_biang3.ogg | Austin Zhang | CC BY-SA 4.0 | 潮州话，普宁—潮阳混合口音，男声 | 1.88s | `f29dc055624d9b1c81118912a34db742a322599a37afc434212bb5270590d5dc` |
| audio-culture-3 | `culture-ghueh-nio.mp3` | https://commons.wikimedia.org/wiki/File:Zh-nan-chzu,_ghu%C3%AAh8_nio5.ogg | Austin Zhang | CC BY-SA 4.0 | 潮州话，普宁—潮阳混合口音，男声 | 1.11s | `b51f3b8d96a8fcb168ecb6fd763a568711b2779b3747b26b8a4b7d358ab61751` |
| audio-culture-4 | `culture-nou-gian.mp3` | https://commons.wikimedia.org/wiki/File:Zh-nan-czhu,_nou1_gian2.ogg | Austin Zhang | CC BY-SA 4.0 | 潮州话，普宁—潮阳混合口音，男声 | 0.87s | `e318d8ee6c9821f3f2a6616d97e68ac70e33a4b103aced1d9e9d115d8fcb7bb0` |
| audio-culture-5 | `culture-bag-nang.mp3` | https://commons.wikimedia.org/wiki/File:Zh-nan-czhu,_bag8_nang5.ogg | Austin Zhang | CC BY-SA 4.0 | 潮州话，普宁—潮阳混合口音，男声 | 1.00s | `bb35cec3a3bd2d7b6b3193769878ed1896d165a3cbf007610405ac5d2b2cf6eb` |
| audio-culture-6 | `culture-zo-ni-mueh.mp3` | https://commons.wikimedia.org/wiki/File:Zh-nan-czhu,_Zo3_ni5_mu%C3%AAh8.ogg | Austin Zhang | CC BY-SA 4.0 | 潮州话，普宁—潮阳混合口音，男声 | 2.00s | `2583c15019b493819d256ba197e783a1d2d00eeedc6f9c43da6ca362a1738cab` |
| audio-culture-7 | `culture-dan-m-tian.mp3` | https://commons.wikimedia.org/wiki/File:Zh-nan-czhu,_Dan3_m6_tian1.ogg | Austin Zhang | CC BY-SA 4.0 | 潮州话，普宁—潮阳混合口音，男声 | 2.21s | `d188d7bac0a772c8ae241e57ace7fc4bbcabf4e8e284692cc2b35a181d5d2e33` |
| audio-culture-8 | `culture-suan-tao.mp3` | https://commons.wikimedia.org/wiki/File:Zh-nan-czhu,_suan1_tao5.ogg | Austin Zhang | CC BY-SA 4.0 | 潮州话，普宁—潮阳混合口音，男声 | 1.08s | `6d02281e5cb0873d1d09d43ce8c6fc0bfa42e2da8166bd2fe488f56b1cca7fe5` |

原始文件同时保留在 `source/`（未改动），便于复核：

| 本地原文件 | SHA-256 |
|---|---|
| `source/greeting-sih-pa-bui.ogg` | `98890a72980545d9d9e095bbf3b6d8295bd3275fa2d4326032a68d2c159282bf` |
| `source/greeting-sing-ni-kuai-lak.ogg` | `6b60d84a4fe7ba4cae6449dffb30bfea44b375e3bd7e361b340c1efbadacf760` |
| `source/tea-food-ziah-menhng.ogg` | `f5f910db5b09a7f4242d7df792eb8126ee974c5d266f56cd3303d88fdb57b5fb` |
| `source/tea-food-meicai-pei-mue.wav` | `c55a580bfb8379f390f36754692865b12080946c88fe3e5be5f360a652fe0ca8` |
| `source/courtesy-zoi-sia.ogg` | `4d11971221c107f92d1a364b5c3577bd0479cfd08759f65d7f3aca84b482ff85` |
| `source/courtesy-mai-kheh-khi.ogg` | `37c20156811b187e9d1ea45f4cb415d5d49dbe7285900b6755f83ebb734d27ff` |
| `source/culture-dio-ziu.ogg` | `0510b7507690ce627c4b53382fc8e913c131a587fdf584998ed509fd9ef53c57` |
| `source/culture-dio-suan-ue.ogg` | `bc8d45eab8deef42cd4573591406af1abe50a5fc27de7fa974a78bebe0249bd4` |
| `source/greeting-sing-ti-giang-kang.ogg` | `105cc630ad5336d2d7c387627102766ce773d0b79ab7a61cceaa6c95685a7daf` |
| `source/tea-food-dou-iao.ogg` | `200bf4724551a2560878038227343707dd6e47ee9e57cf2899626e7f370c9ae4` |
| `source/tea-food-uan-gian-min.ogg` | `13726e4f85f8bcec2863ff62bdeda544d7c97a6bd9b1a225a8c44e63478e8c4b` |
| `source/tea-food-goi-zab-min.ogg` | `1ec6fecd9dffd07f4df4d8d4d513fa24d8ed042ce78b560df25f84e5e4ddd583` |
| `source/courtesy-bho-iao-ging.ogg` | `fbf5426d6672a38f0edd92252ec63f01b9ffbbfc8b7ef074c3492cea2e946266` |
| `source/courtesy-mo-i-su.ogg` | `cfcbc4012624f491cdd46e83bb9665193e888f688dfc2ef869171cbc08f7714e` |
| `source/courtesy-bho-biang.ogg` | `b3aa070e403358536ed822fa6576fdd722c4b95ef335b395aad4c4c535c87e06` |
| `source/culture-ghueh-nio.ogg` | `05f288b7cb6168a52622e1a234a2659d4b75f7aeb0d33384dfad08fd43a59676` |
| `source/culture-nou-gian.ogg` | `66ddd45549ba7ca9c24658f175a9c174fcb33039e22ce66b8a6e3e4c55c9f3ec` |
| `source/culture-bag-nang.ogg` | `b46bab6608cf2c259c054e32a6ce6712c10bb08389efdf3fc2eac9a5b6231f02` |
| `source/culture-zo-ni-mueh.ogg` | `9a26d25182f4510a4aa9893f89bc4f278189f868a2995005a26a15d45b51bee4` |
| `source/culture-dan-m-tian.ogg` | `ed474fc68db2d08362911e25285c9c94967bf836d136705fd73e4bce1c4b1219` |
| `source/culture-suan-tao.ogg` | `3986d5112a13b335e42bedddab6691a05ee94fef43de2d0813c3619eabec6b41` |

## 已核验但未上线

| 原始文件 | 作者/许可 | 原因 |
|---|---|---|
| https://commons.wikimedia.org/wiki/File:Zh-nan-czhu,_ang5_cai3_tao5.ogg （紅菜頭） | Austin Zhang / CC BY-SA 4.0 | 来源页只给汉字「紅菜頭」，没有给出普通话释义；仅凭汉字无法确定普通话定名，按规则不使用。文件留在 `source/tea-food-ang-cai-tao.ogg` 备查，页面不引用。 |

同一分类（Category:Teochew pronunciation，共 62 个文件）里逐条看过、但本轮不收录的：

- 粗俗或骂人的词（`ka1 ceng1` 尻川、`lang6 ziao2` 𡳞鳥、`ku3 si2` 去死 等）：不适合作入门词句。
- 政治／政党名（`Dong1-hua5 Ming5-gog4`、`gog4 ming5 dang2` 等）：与「场景短句」目标无关。
- 境外地名（臺灣、新加坡、馬來西亞、加拿大、廣州、朝鮮……）：同上，暂不收。
- 释义无法只凭来源页确定、需要母语者确认的（`ci1 cam2` 淒慘、`Diam7 diam7` 惦惦、`Pu2 bho2` 甫母、
  `Bho5 rioh8 gu2` 無偌久、`U6 so2 bug4 zai1` 有所不知、`si3 suan3 dan3` 四散呾、`dua7 soi3 mag8` 大細目、
  `gang1 dang1` 共同／蕳砃、`bag8 gian2` 菝囝、`za1 bhou2` 查某、`zu1 nio5` 諸娘、`mog8 cêng5` 疫情、
  `zao2 gian2` 走囝 等）：先不写释义，等母语者复核后再决定是否上线。

## 口音与局限

- 全部条目按来源页描述标注为「潮州话」（Teochew / 潮州話），其中 20 条明确写着
  “Puning-Chaoyang mixed accent”（普宁—潮阳混合口音），1 条为普宁男声。
  没有冒用粤语或泛闽南语（厦门/台湾）录音。
- 文件描述与文件名给的是方言字与拼音，本站不另行标注声调或改写汉字。
- 释义只按来源页给出的汉字与英文描述直译，标「字面」的仅解释汉字对应关系，
  不据此断言完整语用；来源页没给汉字的文件一律不上线（见下节）。
- 这些录音尚未请潮汕母语者逐条复核，页面已如实提示。若复核发现不符，应下线对应文件。

## 2026-11-07 补充：Lingua Libre / Wikimedia Commons 真人发音（21 条）

| 词条 ID | 本地文件 | 原始文件页 | 录音者 | 许可 | 口音 | 时长 |
|---|---|---|---|---|---|---|
| audio-commons-buygoose | `commons-buygoose.mp3` | https://commons.wikimedia.org/wiki/File:Zh-nan-czhu,_bhoi2_gho5_lai7_ziah8.ogg | Wikimedia Commons | CC BY-SA 4.0 | 潮州话 · 普宁—潮阳混合口音（男声） | 1.15s |
| audio-commons-ceng1ki3 | `commons-ceng1ki3.mp3` | https://commons.wikimedia.org/wiki/File:Zh-nan-czhu,_cêng1_ki3.ogg | Wikimedia Commons | CC BY-SA 4.0 | 潮州话 · 普宁—潮阳混合口音（男声） | 1s |
| audio-commons-china | `commons-china.mp3` | https://commons.wikimedia.org/wiki/File:Zh-nan-czhu,_Dong1-gog4.ogg | Wikimedia Commons | CC BY-SA 4.0 | 潮州话 · 普宁—潮阳混合口音（男声） | 1.47s |
| audio-commons-diam7 | `commons-diam7.mp3` | https://commons.wikimedia.org/wiki/File:Zh-nan-czhu,_Diam7_diam7.ogg | Austin Zhang | CC BY-SA 4.0 | 潮州话 · 普宁—潮阳混合口音（男声） | 1.77s |
| audio-commons-gang1dang1 | `commons-gang1dang1.mp3` | https://commons.wikimedia.org/wiki/File:Zh-nan-czhu,_gang1_dang1.ogg | Wikimedia Commons | CC BY-SA 4.0 | 潮州话 · 普宁—潮阳混合口音（男声） | 0.87s |
| audio-commons-geng2dang1 | `commons-geng2dang1.mp3` | https://commons.wikimedia.org/wiki/File:Zh-nan-czhu,_geng2_dang1.ogg | Wikimedia Commons | CC BY-SA 4.0 | 潮州话 · 普宁—潮阳混合口音（男声） | 1.07s |
| audio-commons-gig4ion5 | `commons-gig4ion5.mp3` | https://commons.wikimedia.org/wiki/File:Zh-nan-czhu,_gig4_ion5.ogg | Wikimedia Commons | CC BY-SA 4.0 | 潮州话 · 普宁—潮阳混合口音（男声） | 0.84s |
| audio-commons-ll-beef | `commons-ll-beef.mp3` | https://commons.wikimedia.org/wiki/File:LL-Q36759-Assassas77-牛肉.wav | Assassas77 | CC BY-SA 4.0 | 潮州话 · Lingua Libre 母语者录音（Assassas77） | 0.8s |
| audio-commons-ll-big | `commons-ll-big.mp3` | https://commons.wikimedia.org/wiki/File:Zh-nan-czhu,_加拿大.ogg | Austin Zhang | CC BY-SA 4.0 | 潮州话 · 普宁—潮阳混合口音（男声） | 0.88s |
| audio-commons-ll-congee | `commons-ll-congee.mp3` | https://commons.wikimedia.org/wiki/File:LL-Q36759-Assassas77-粥.wav | Assassas77 | CC BY-SA 4.0 | 潮州话 · Lingua Libre 母语者录音（Assassas77） | 0.88s |
| audio-commons-ll-eat | `commons-ll-eat.mp3` | https://commons.wikimedia.org/wiki/File:LL-Q36759-Assassas77-食.wav | Assassas77 | CC BY-SA 4.0 | 潮州话 · Lingua Libre 母语者录音（Assassas77） | 0.8s |
| audio-commons-ll-good | `commons-ll-good.mp3` | https://commons.wikimedia.org/wiki/File:LL-Q36759-Assassas77-好.wav | Assassas77 | CC BY-SA 4.0 | 潮州话 · Lingua Libre 母语者录音（Assassas77） | 0.88s |
| audio-commons-ll-kueh | `commons-ll-kueh.mp3` | https://commons.wikimedia.org/wiki/File:LL-Q36759-Assassas77-粿.wav | Assassas77 | CC BY-SA 4.0 | 潮州话 · Lingua Libre 母语者录音（Assassas77） | 0.8s |
| audio-commons-ll-me | `commons-ll-me.mp3` | https://commons.wikimedia.org/wiki/File:LL-Q36759-Assassas77-我.wav | Assassas77 | CC BY-SA 4.0 | 潮州话 · Lingua Libre 母语者录音（Assassas77） | 0.8s |
| audio-commons-ll-rice | `commons-ll-rice.mp3` | https://commons.wikimedia.org/wiki/File:LL-Q36759-Assassas77-飯.wav | Assassas77 | CC BY-SA 4.0 | 潮州话 · Lingua Libre 母语者录音（Assassas77） | 0.88s |
| audio-commons-ll-tea | `commons-ll-tea.mp3` | https://commons.wikimedia.org/wiki/File:LL-Q36759-Assassas77-茶米.wav | Assassas77 | CC BY-SA 4.0 | 潮州话 · Lingua Libre 母语者录音（Assassas77） | 0.97s |
| audio-commons-ll-water | `commons-ll-water.mp3` | https://commons.wikimedia.org/wiki/File:LL-Q36759-Assassas77-水.wav | Assassas77 | CC BY-SA 4.0 | 潮州话 · Lingua Libre 母语者录音（Assassas77） | 0.8s |
| audio-commons-ll-you | `commons-ll-you.mp3` | https://commons.wikimedia.org/wiki/File:LL-Q36759-Assassas77-你.wav | Assassas77 | CC BY-SA 4.0 | 潮州话 · Lingua Libre 母语者录音（Assassas77） | 0.8s |
| audio-commons-mog8ceng5 | `commons-mog8ceng5.mp3` | https://commons.wikimedia.org/wiki/File:Zh-nan-czhu,_mog8_cêng5.ogg | Wikimedia Commons | CC BY-SA 4.0 | 潮州话 · 普宁—潮阳混合口音（男声） | 0.97s |
| audio-commons-pou2leng5 | `commons-pou2leng5.mp3` | https://commons.wikimedia.org/wiki/File:Zh-nan-czhu,_pou2_lêng5.ogg | Wikimedia Commons | CC BY-SA 4.0 | 潮州话 · 普宁—潮阳混合口音（男声） | 0.96s |
| audio-commons-si3suan3dan3 | `commons-si3suan3dan3.mp3` | https://commons.wikimedia.org/wiki/File:Zh-nan-czhu,_si3_suan3_dan3.ogg | Wikimedia Commons | CC BY-SA 4.0 | 潮州话 · 普宁—潮阳混合口音（男声） | 0.93s |

## 2026-11-07 继续补充（17 条）

| 词条 ID | 本地文件 | 原始文件页 | 录音者 | 许可 | 时长 |
|---|---|---|---|---|---|
| audio-commons-more-1-加拿大 | `commons-more-1-加拿大.mp3` | https://commons.wikimedia.org/wiki/File:Zh-nan-czhu,_加拿大.ogg | Austin Zhang | CC BY-SA 4.0 | 0.91s |
| audio-commons-more-2-廣州 | `commons-more-2-廣州.mp3` | https://commons.wikimedia.org/wiki/File:Zh-nan-czhu,_廣州.ogg | Austin Zhang | CC BY-SA 4.0 | 0.64s |
| audio-commons-more-3-新加坡 | `commons-more-3-新加坡.mp3` | https://commons.wikimedia.org/wiki/File:Zh-nan-czhu,_新加坡.ogg | Austin Zhang | CC BY-SA 4.0 | 0.91s |
| audio-commons-more-4-馬來西亞 | `commons-more-4-馬來西亞.mp3` | https://commons.wikimedia.org/wiki/File:Zh-nan-czhu,_馬來西亞.ogg | Austin Zhang | CC BY-SA 4.0 | 1.18s |
| audio-commons-more-5-肉骨茶 | `commons-more-5-肉骨茶.mp3` | https://commons.wikimedia.org/wiki/File:LL-Q36759-Assassas77-肉骨茶.wav | Assassas77 | CC BY-SA 4.0 | 1.22s |
| audio-commons-more-6-雞卵粿 | `commons-more-6-雞卵粿.mp3` | https://commons.wikimedia.org/wiki/File:LL-Q36759-Assassas77-雞卵粿.wav | Assassas77 | CC BY-SA 4.0 | 1.14s |
| audio-commons-more-7-麥粉粿 | `commons-more-7-麥粉粿.mp3` | https://commons.wikimedia.org/wiki/File:LL-Q36759-Assassas77-麥粉粿.wav | Assassas77 | CC BY-SA 4.0 | 1.14s |
| audio-commons-more-8-火雞 | `commons-more-8-火雞.mp3` | https://commons.wikimedia.org/wiki/File:LL-Q36759-Assassas77-火雞.wav | Assassas77 | CC BY-SA 4.0 | 1.14s |
| audio-commons-more-9-火腿 | `commons-more-9-火腿.mp3` | https://commons.wikimedia.org/wiki/File:LL-Q36759-Assassas77-火腿.wav | Assassas77 | CC BY-SA 4.0 | 1.05s |
| audio-commons-more-10-海鲜醬 | `commons-more-10-海鲜醬.mp3` | https://commons.wikimedia.org/wiki/File:LL-Q36759-Assassas77-hai2(6)_chin1_jion3_海鲜醬_-sauce_hoisin_(utilisée_notamment_pour_laquer_les_aliments)-.wav | Assassas77 | CC BY-SA 4.0 | 1.41s |
| audio-commons-more-11-旅行 | `commons-more-11-旅行.mp3` | https://commons.wikimedia.org/wiki/File:LL-Q36759-Apsaltini-li2(6)_gian5_旅行_-voyage-.wav | Apsaltini | CC BY-SA 4.0 | 1.13s |
| audio-commons-more-12-地圖 | `commons-more-12-地圖.mp3` | https://commons.wikimedia.org/wiki/File:LL-Q36759-Apsaltini-di7_dou5_地圖_-carte-.wav | Apsaltini | CC BY-SA 4.0 | 1.04s |
| audio-commons-more-13-去 | `commons-more-13-去.mp3` | https://commons.wikimedia.org/wiki/File:LL-Q36759-Apsaltini-keu3_去_-aller,_partir-.wav | Apsaltini | CC BY-SA 4.0 | 0.85s |
| audio-commons-more-14-來 | `commons-more-14-來.mp3` | https://commons.wikimedia.org/wiki/File:LL-Q36759-Assassas77-lai5_來_-to_come-.wav | Assassas77 | CC BY-SA 4.0 | 0.55s |
| audio-commons-more-15-行逷迌 | `commons-more-15-行逷迌.mp3` | https://commons.wikimedia.org/wiki/File:LL-Q36759-Apsaltini-gian5(7)_tik4(8)_to5_行逷迌_-faire_une_promenade,_faire_une_balade-.wav | Apsaltini | CC BY-SA 4.0 | 1.41s |
| audio-commons-more-16-泅水 | `commons-more-16-泅水.mp3` | https://commons.wikimedia.org/wiki/File:LL-Q36759-Apsaltini-siu5(7)_jui2_泅水_-nager_(à_la_surface_de_l'eau)-.wav | Apsaltini | CC BY-SA 4.0 | 1.22s |
| audio-commons-more-17-盛水 | `commons-more-17-盛水.mp3` | https://commons.wikimedia.org/wiki/File:LL-Q36759-Ah_Mean_(Kitkatmaw)-seng5(7)_jui2_盛水_-remplir_(un_récipient)_d'eau-.wav | Ah Mean (Kitkatmaw) | CC BY-SA 4.0 | 1.91s |

## 2026-11-07 最后补录（7 条）

| 词条 ID | 本地文件 | 原始文件页 | 录音者 | 许可 | 时长 |
|---|---|---|---|---|---|
| audio-commons-final-無偌久 | `commons-final-無偌久.mp3` | https://commons.wikimedia.org/wiki/File:Zh-nan-czhu,_Bho5_rioh8_gu2.ogg | Austin Zhang | CC BY-SA 4.0 | 2.38s |
| audio-commons-final-淒慘 | `commons-final-淒慘.mp3` | https://commons.wikimedia.org/wiki/File:Zh-nan-czhu,_ci1_cam2.ogg | Austin Zhang | CC BY-SA 4.0 | 1.17s |
| audio-commons-final-臺灣 | `commons-final-臺灣.mp3` | https://commons.wikimedia.org/wiki/File:Zh-nan-czhu,_tai5_uang1.ogg | Austin Zhang | CC BY-SA 4.0 | 0.77s |
| audio-commons-final-有所不知 | `commons-final-有所不知.mp3` | https://commons.wikimedia.org/wiki/File:Zh-nan-czhu,_U6_so2_bug4_zai1.ogg | Austin Zhang | CC BY-SA 4.0 | 2.28s |
| audio-commons-final-查某 | `commons-final-查某.mp3` | https://commons.wikimedia.org/wiki/File:Zh-nan-czhu,_za1_bhou2.ogg | Austin Zhang | CC BY-SA 4.0 | 0.80s |
| audio-commons-final-走囝 | `commons-final-走囝.mp3` | https://commons.wikimedia.org/wiki/File:Zh-nan-czhu,_zao2_gian2.ogg | Austin Zhang | CC BY-SA 4.0 | 1.00s |
| audio-commons-final-諸娘 | `commons-final-諸娘.mp3` | https://commons.wikimedia.org/wiki/File:Zh-nan-czhu,_zu1_nio5.ogg | Austin Zhang | CC BY-SA 4.0 | 0.87s |
