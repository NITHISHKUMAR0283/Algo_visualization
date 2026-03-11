

'use strict';


const CU = {


  clear(ctx, canvas, bgColor = '#1a1d27') {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  },


  fillRect(ctx, x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
  },

  strokeRect(ctx, x, y, w, h, color, lw = 1) {
    ctx.strokeStyle = color;
    ctx.lineWidth   = lw;
    ctx.strokeRect(x, y, w, h);
  },

  rect(ctx, x, y, w, h, fill, stroke, lw = 1) {
    if (fill)   { ctx.fillStyle   = fill;   ctx.fillRect  (x, y, w, h); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.strokeRect(x, y, w, h); }
  },


  text(ctx, str, x, y, {
    font      = '12px monospace',
    color     = '#f8f8f2',
    align     = 'center',
    baseline  = 'middle',
    maxWidth,
  } = {}) {
    ctx.font         = font;
    ctx.fillStyle    = color;
    ctx.textAlign    = align;
    ctx.textBaseline = baseline;
    if (maxWidth !== undefined) ctx.fillText(str, x, y, maxWidth);
    else                        ctx.fillText(str, x, y);
  },


  line(ctx, x1, y1, x2, y2, color = '#6272a4', lw = 1, dash = []) {
    ctx.strokeStyle = color;
    ctx.lineWidth   = lw;
    ctx.setLineDash(dash);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.setLineDash([]);
  },


  circle(ctx, cx, cy, r, fill = null, stroke = null, lw = 1) {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    if (fill)   { ctx.fillStyle   = fill;   ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); }
  },

  dot(ctx, cx, cy, r, color) {
    this.circle(ctx, cx, cy, r, color);
  },


  arrow(ctx, x1, y1, x2, y2, color = '#4f8ef7', lw = 2) {
    const angle   = Math.atan2(y2 - y1, x2 - x1);
    const headLen = 9;
    ctx.strokeStyle = color;
    ctx.fillStyle   = color;
    ctx.lineWidth   = lw;

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - headLen * Math.cos(angle - Math.PI / 6),
               y2 - headLen * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(x2 - headLen * Math.cos(angle + Math.PI / 6),
               y2 - headLen * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();
  },


  polygon(ctx, pts, fill = null, stroke = null, lw = 2) {
    if (!pts || pts.length < 2) return;
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.closePath();
    if (fill)   { ctx.fillStyle   = fill;   ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); }
  },

  polyline(ctx, pts, color = '#4f8ef7', lw = 2) {
    if (!pts || pts.length < 2) return;
    ctx.strokeStyle = color;
    ctx.lineWidth   = lw;
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.stroke();
  },


  roundRect(ctx, x, y, w, h, r, fill = null, stroke = null, lw = 1) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    if (fill)   { ctx.fillStyle   = fill;   ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); }
  },


  legend(ctx, items, x, y) {
    const sw = 12, sh = 12, gap = 4, spacing = 110;
    items.forEach((item, i) => {
      const lx = x + i * spacing;
      this.fillRect(ctx, lx, y, sw, sh, item.color);
      this.text(ctx, item.label, lx + sw + gap, y + sh / 2, {
        font: '10px sans-serif', color: '#6272a4', align: 'left', baseline: 'middle',
      });
    });
  },

};
