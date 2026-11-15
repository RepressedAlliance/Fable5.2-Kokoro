# 素材、署名与使用范围 / Notice

本文件说明仓库里各部分的许可，避免把整个仓库误认为统一的 MIT 素材包。English summary below.

## 本仓库包含

| 内容 | 许可与权利 |
|---|---|
| 源代码（`web/*.html`、`web/*.py`、`web/pages/`、`src/`、`tools/` 里的脚本） | MIT，© 2026 RepressedAlliance（[LICENSE](LICENSE)） |
| 人物卡片（`web/data/cards/*.png`）、设定图（`art/canon/`）、`docs/images/` 里的剧照与动图 | CC BY-NC 4.0；画的是鏡音リン（及科学家所借用的鏡音レン形象），使用时还须遵守 Crypton 的角色使用条款 |
| 文档（`README*.md`、`docs/`）与提示词文本 | CC BY-NC 4.0 |
| 数据（`web/data/cards/v2.json`、`cc_heads.json`、`art/v2/sets.json`、`web/data/lyrics_timing.json`） | MIT；`lyrics_timing.json` 只有每个字出现的时间，不含歌词文字 |
| three.js（`web/vendor/three.module.js`，r170） | MIT，© 2010–2024 three.js authors |

## 作品与角色

- **歌曲：**《ココロ》，作词・作曲・编曲 トラボルタ，演唱 鏡音リン（2008）。词曲权利归各自权利方，**本仓库不授予词曲许可**。
- **角色：** 鏡音リン・鏡音レン © Crypton Future Media, INC. 2007。本作使用的是角色的改编插画，依照 Crypton 的 [Piapro Character License](https://piapro.net/intl/license.html) 进行非商业创作。复用人物图时请注明“features an adaptation of Kagamine Rin, © Crypton Future Media, INC. 2007, licensed under a CC BY-NC”；不得用于商业用途，不得以损害角色形象的方式使用。
- **人物图的来源：** 由 OpenAI 的图像模型（通过 Codex CLI 的内置图像工具）生成，参考图为 `art/canon/` 的设定图，提示词见 `tools/` 与 `docs/提示词.md`，再经 `src/bake_v2.py` 抠底、对齐和裁切。设定图本身也是这样生成、再经人工挑选的。
- **PV：** 压抑同盟 RepressedAlliance × Claude Code × Codex。人设、分镜和故事是本项目的同人设计，不是官方角色立绘或官方 PV。

## 不在本仓库中

- 歌曲音频、完整歌词文本、卡拉 OK 轴、完整成片视频；
- Codex 的全部原图和落选候选、逐帧渲染输出、制作过程的修改记录和审片报告、会话记录、账户资料与调用日志；
- 字体文件（`tools/fetch_fonts.py` 从 [google/fonts](https://github.com/google/fonts) 下载，均为 SIL Open Font License）。

页面代码为了把字排到版面上，按文本引用了片中用到的歌词句子（`web/pages/*.js` 里的 `line('…')` 等）；这不改变词曲的权利归属，也不构成对歌词的许可。

首页图片与动图来自本项目的正式成片，动图没有音轨；它们不意味着歌曲权利已被开放。代码的许可不能替代使用歌曲、角色图或成片画面的许可。

## 商标与关联

VOCALOID 是雅马哈株式会社的注册商标；鏡音リン、鏡音レン是 Crypton Future Media, INC. 的商标。本项目是独立的非官方同人创作，与雅马哈、Crypton、トラボルタ及所用工具的提供方没有官方关联。项目名称沿用发布时的名称，不作为任何模型身份或官方合作的证明。

---

## English summary

- **Code** (`web/*.html`, `web/*.py`, `web/pages/`, `src/`, `tools/`): MIT, © 2026 RepressedAlliance. **Data** (card measurements, set definitions, the times-only lyric timing): MIT. **three.js** r170: MIT.
- **Images** (character cards, model sheets, stills and silent animations in `docs/images/`) and **documentation**: CC BY-NC 4.0. They depict Kagamine Rin (and the fan depiction of Kagamine Len used for the scientist), © Crypton Future Media, INC. 2007, used under the [Piapro Character License](https://piapro.net/intl/license.html) for non-commercial fan work; reuse must also follow Crypton's terms and credit "features an adaptation of Kagamine Rin, © Crypton Future Media, INC. 2007, licensed under a CC BY-NC".
- The character art was generated with an OpenAI image model (through the Codex CLI's built-in image tool) from the model sheets in `art/canon/` and the prompts in `tools/`, then processed by `src/bake_v2.py`.
- **Song:** "Kokoro" by Toraboruta, sung by Kagamine Rin. No licence to the song or its lyrics is granted. The audio, the lyric text, karaoke timing and the finished video are not in this repository; bring your own (see `input/README.md`). The page code quotes the sung lines it places on screen; this does not change who holds the rights.
- **Fonts** are SIL OFL fonts downloaded from google/fonts by `tools/fetch_fonts.py`, not bundled.
- VOCALOID is a registered trademark of Yamaha Corporation; Kagamine Rin and Kagamine Len are trademarks of Crypton Future Media, INC. This is an independent, unofficial fan work, not affiliated with them.
