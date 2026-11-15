# input/：自备的文件

歌曲和歌词的权利不属于我们，仓库里没有它们。要预览带声音的页面、合成整片，请把**自己合法取得**的文件放在这里（这个目录里除了本说明，其余文件都不会进 Git）。

| 文件 | 用途 | 必需？ |
|---|---|---|
| `kokoro.wav` | 原曲音频。`page.html?play=1` 播放它，`src/assemble_pages.py` 把它接进成片 | 合成整片时需要 |
| `lyrics_lines.txt` | 片中用到的 44 句歌词，一句一行，按片中顺序；`python src/apply_lyrics.py` 把它和 `web/data/lyrics_timing.json` 合成页面要读的 `web/data/lyrics.json` | **渲染任何一页都需要**（页面按句子找时间） |
| `karaoke.ass` | 卡拉 OK 轴（`{\k}` 音节），只在你想自己重新对时时用 | 可选 |
| `vocals.wav` | 分离出来的人声（`demucs -n htdemucs --two-stems vocals input/kokoro.wav`），同上 | 可选 |
| `lyric_syllables.txt` | 每句的第一个音节时间和“每个字占几个音节”，格式见 `src/lyric_timing.py`，同上 | 可选 |
| `timing.json` | `{"ass_offset_seconds": …}`：卡拉 OK 轴相对你的音频的整体偏移 | 可选 |

## 音频要和片子对得上

片子的所有时间都按“音频文件开头 = 0 秒”写，第 0 拍在 20.016 秒、每拍 0.42858 秒。不同来源的音频，开头的静音长度可能不同。拿到文件后先跑一次：

```powershell
python tools/beat_grid.py input/kokoro.wav
```

如果打印的 `phase: a beat at …` 不是 20.016 s 附近，说明你的文件整体偏了这么多：在开头补上或剪掉相应长度的静音，再用。

## lyrics_lines.txt 怎么写

- 写的是**唱出来的一句**（片中按演唱断句，一行比歌词本上的一行短），共 44 行；空行和 `#` 开头的行会被跳过；
- 每个字都有自己的时间，**全角空格也是一个字**：每行的字数要等于 `web/data/lyrics_timing.json` 里对应那句的 `n`；
- 页面按文本找句子（`web/pages/kit.js` 的 `line()`），所以写法要和页面代码里引用的一致。`apply_lyrics.py` 会逐行核对字数，不一致就不写文件。

格式示例（占位文字）见 `web/data/lyrics.example.json`。
