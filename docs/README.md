# 文档索引

简体中文 · [English](guide.en.md) · [日本語](guide.ja.md)

这些文档讲这支片子怎么做，方便对照代码研究具体做法。每篇独立可读，都指向具体的文件和函数。

## 按你想学的

| 你想学 | 读这篇 | 主要代码 |
|---|---|---|
| 画出来的循环帧：走路、奔跑、风吹头发、结尾的泪 | [连贯动作](连贯动作.md) | `web/pages/kit.js` `windFrame()`、`know.js`、`chorus1.js`、`outro.js`、`tools/w1_*.py`、`tools/w2_endt.py` |
| 歌词唱到哪个字、哪个字落下；几种版式和排版规则 | [歌词动效](歌词动效.md) | `kit.js` `column()` `row()` `hit()`、`src/lyric_timing.py`、`src/apply_lyrics.py` |
| 人物图怎么保持一致、几乎不出错 | [人物图怎么不出错](人物图怎么不出错.md) → [提示词](提示词.md) | `art/canon/`、`tools/gen.ps1`、`tools/codex_review.ps1`、`src/bake_v2.py` |
| 歌声逐笔写成「心」 | [歌声写成心](歌声写成心.md) | `web/pages/finale_ra.js` |
| 照片从胸口涌出，不挡脸 | [记忆涌出](记忆涌出.md) | `web/pages/verse2_overflow.js` |
| 拍点、换张卡拍、换张审计 | [按拍对点](按拍对点.md) | `tools/beat_grid.py`、`tools/audit_swaps.*`、`tools/sync_check.py` |
| 从零跑起来：环境、自备文件、渲染、合成 | [制作流程](制作流程.md) | `web/serve.py`、`tools/render.mjs`、`tools/capture_all.py`、`src/assemble_pages.py` |
| 我们犯过的错，和现在的做法 | [踩过的坑](踩过的坑.md) | — |

## 建议的阅读顺序

1. [制作流程](制作流程.md) 第 0 节：知道这套工程由哪几块组成；
2. 挑你感兴趣的那一篇；
3. [踩过的坑](踩过的坑.md)：动手之前看一遍，省掉最贵的几次返工。

## 没有放进仓库的

- 制作过程中的逐轮修改记录、审片报告、会话记录：它们是给当时的我们看的，有用的结论已经写进上面几篇。
- 几百个一次性的出图和修图脚本（每一轮各写一套）：留下的是最后一轮实际用的、写法有代表性的几个（`tools/g1_r9_prompts.py`、`tools/w1_wind_prompts.py`、`tools/w1_align.py`、`tools/w2_endt.py`、`tools/v2_edits.ps1`）。
- Codex 的原图和落选候选（约 7 GB）：仓库只带成片用到的 244 张卡片和设定图。
- 歌曲音频、歌词文本、卡拉 OK 轴、成片视频：见 [NOTICE](../NOTICE.md)。
