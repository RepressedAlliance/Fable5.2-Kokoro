// The canon of the sheet (「心」設計記録), face on and whole, at A4 150 dpi (1240 x 1754): the reference the drawings are
// drawn to.  node tools/render.mjs "page=reportsheet&t=0,1"
//   t = 0: as she finds it (結果 empty, 起動 waiting, the socket empty, the trace flat) -> art/canon/prop_report.png
//   t = 1: as it ends (成功 stamped, 起動 OK, the 心 in the socket, the trace beating) -> art/canon/prop_report_done.png
import { drawReport } from './report.js';
export const name = 'reportsheet';
export const start = 0;
export const duration = 2;
export async function prepare() { const cv = document.getElementById('c'); cv.width = 1240; cv.height = 1754; }
export function draw(c, t) {
  c.clearRect(0, 0, 1240, 1754);
  if (t < 0.5) drawReport(c, 0, 0, 1240, {});
  else drawReport(c, 0, 0, 1240, { result: '成功', boot: 'OK', socket: { fill: 1, heart: 1 }, trace: { beat: 0.5 } });
}
