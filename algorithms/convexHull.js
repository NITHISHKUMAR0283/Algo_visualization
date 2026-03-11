

'use strict';

window.AlgoConvexHull = (() => {

  const C = {
    dot:       '#4f8ef7',
    left:      '#8be9fd',
    right:     '#bd93f9',
    hull:      '#50fa7b',
    tangent:   '#ffb86c',
    removed:   '#ff5555',
    bg:        '#1a1d27',
    grid:      '#242736',
    muted:     '#6272a4',
    text:      '#f8f8f2',
  };
  const DOT_R = 5;


  function cross(O, A, B) {
    return (A.x - O.x) * (B.y - O.y) - (A.y - O.y) * (B.x - O.x);
  }


  function monoHull(pts) {
    const n = pts.length;
    if (n < 2) return pts.slice();
    const sorted = pts.slice().sort((a, b) => a.x !== b.x ? a.x - b.x : a.y - b.y);
    const lower = [];
    for (const p of sorted) {
      while (lower.length >= 2 && cross(lower[lower.length-2], lower[lower.length-1], p) <= 0)
        lower.pop();
      lower.push(p);
    }
    const upper = [];
    for (let i = sorted.length - 1; i >= 0; i--) {
      const p = sorted[i];
      while (upper.length >= 2 && cross(upper[upper.length-2], upper[upper.length-1], p) <= 0)
        upper.pop();
      upper.push(p);
    }
    upper.pop(); lower.pop();
    return lower.concat(upper);
  }


  function generateSteps(inputPoints) {
    const pts   = [...inputPoints].sort((a, b) => a.x !== b.x ? a.x - b.x : a.y - b.y);
    const steps = [];

    function push(description, phase, extra = {}) {
      steps.push({ description, phase, points: pts, ...extra });
    }

    push(`${pts.length} points sorted by x-coordinate. Computing Convex Hull using Divide and Conquer.`, 'divide');


    push('Building upper hull – process points left to right, keeping right turns only.', 'divide',
         { leftSet: pts, rightSet: [] });

    const sorted = pts.slice();
    const lower  = [];
    const upper  = [];

    push('Lower hull: process points left → right, removing left turns.', 'divide');

    for (const p of sorted) {
      while (lower.length >= 2 && cross(lower[lower.length-2], lower[lower.length-1], p) <= 0) {
        const removed = lower.pop();
        push(`Lower hull: remove point (${removed.x.toFixed(1)},${removed.y.toFixed(1)}) – left turn detected`,
             'conquer',
             { currentHull: lower.slice(), addedPt: p, removedPt: removed, phase_label: 'lower' });
      }
      lower.push(p);
      push(`Lower hull: add point (${p.x.toFixed(1)},${p.y.toFixed(1)})`,
           'conquer',
           { currentHull: lower.slice(), addedPt: p, phase_label: 'lower' });
    }

    push('Lower hull complete. Building upper hull: process points right → left.', 'combine',
         { currentHull: lower.slice(), phase_label: 'lower' });

    for (let i = sorted.length - 1; i >= 0; i--) {
      const p = sorted[i];
      while (upper.length >= 2 && cross(upper[upper.length-2], upper[upper.length-1], p) <= 0) {
        const removed = upper.pop();
        push(`Upper hull: remove (${removed.x.toFixed(1)},${removed.y.toFixed(1)}) – left turn`,
             'combine',
             { currentLower: lower.slice(), currentHull: upper.slice(),
               addedPt: p, removedPt: removed, phase_label: 'upper' });
      }
      upper.push(p);
      push(`Upper hull: add point (${p.x.toFixed(1)},${p.y.toFixed(1)})`,
           'combine',
           { currentLower: lower.slice(), currentHull: upper.slice(),
             addedPt: p, phase_label: 'upper' });
    }


    const fullHull = [...lower, ...upper.slice(0, -1)];
    fullHull.pop();

    push('Combine upper and lower hull → Convex Hull complete!', 'done',
         { finalHull: fullHull });

    return steps;
  }


  function makeMapper(points, W, H, PAD) {
    const xMin = Math.min(...points.map(p => p.x));
    const xMax = Math.max(...points.map(p => p.x));
    const yMin = Math.min(...points.map(p => p.y));
    const yMax = Math.max(...points.map(p => p.y));
    const xR   = xMax - xMin || 1;
    const yR   = yMax - yMin || 1;
    return {
      cx: x => PAD + ((x - xMin) / xR) * (W - PAD * 2),
      cy: y => H - PAD - ((y - yMin) / yR) * (H - PAD * 2),
    };
  }


  function render(canvas, ctx, step) {
    const W = canvas.width, H = canvas.height;
    CU.clear(ctx, canvas, C.bg);

    const {
      points = [], finalHull,
      currentHull, currentLower,
      addedPt, removedPt,
      phase_label,
    } = step;

    if (!points.length) return;

    const PAD = 44;
    const { cx, cy } = makeMapper(points, W, H, PAD);


    for (let i = 0; i <= 4; i++) {
      const gx = Math.round(PAD + (i / 4) * (W - PAD * 2));
      const gy = Math.round(PAD + (i / 4) * (H - PAD * 2));
      CU.line(ctx, gx, PAD, gx, H - PAD, C.grid, 1);
      CU.line(ctx, PAD, gy, W - PAD, gy, C.grid, 1);
    }


    if (finalHull && finalHull.length >= 3) {
      const poly = finalHull.map(p => ({ x: cx(p.x), y: cy(p.y) }));
      CU.polygon(ctx, poly, 'rgba(80,250,123,0.12)', C.hull, 2.5);
    }


    if (currentHull && currentHull.length >= 2) {
      const hullColor = phase_label === 'lower' ? C.left : C.right;
      const poly = currentHull.map(p => ({ x: cx(p.x), y: cy(p.y) }));
      CU.polyline(ctx, poly, hullColor, 2);
    }
    if (currentLower && currentLower.length >= 2) {
      const poly = currentLower.map(p => ({ x: cx(p.x), y: cy(p.y) }));
      CU.polyline(ctx, poly, C.left, 2);
    }


    const addedKey   = addedPt   ? `${addedPt.x},${addedPt.y}`   : null;
    const removedKey = removedPt ? `${removedPt.x},${removedPt.y}` : null;
    const hullSet    = new Set((currentHull || []).concat(currentLower || [])
                               .map(p => `${p.x},${p.y}`));
    const finalSet   = new Set((finalHull || []).map(p => `${p.x},${p.y}`));

    for (const pt of points) {
      const key = `${pt.x},${pt.y}`;
      let color = C.dot;
      if (hullSet.has(key))    color = phase_label === 'lower' ? C.left : C.right;
      if (finalSet.has(key))   color = C.hull;
      if (key === removedKey)  color = C.removed;
      if (key === addedKey)    color = C.tangent;

      CU.dot(ctx, cx(pt.x), cy(pt.y), DOT_R, color);

      if (key === removedKey) {
        CU.circle(ctx, cx(pt.x), cy(pt.y), DOT_R + 4, null, C.removed, 2);
        CU.text(ctx, '✕', cx(pt.x), cy(pt.y) - 14, {
          font: 'bold 10px sans-serif', color: C.removed, align: 'center',
        });
      }
      if (key === addedKey && key !== removedKey) {
        CU.circle(ctx, cx(pt.x), cy(pt.y), DOT_R + 4, null, C.tangent, 2);
      }
    }


    if (!finalHull) {
      const label = phase_label === 'lower' ? 'Lower Hull' : 'Upper Hull';
      const col   = phase_label === 'lower' ? C.left : C.right;
      CU.text(ctx, label + ' in progress', W / 2, H - 12, {
        font: 'bold 11px sans-serif', color: col, align: 'center',
      });
    } else {
      CU.text(ctx, `Convex Hull: ${finalHull.length} vertices`, W / 2, H - 12, {
        font: 'bold 11px sans-serif', color: C.hull, align: 'center',
      });
    }


    CU.legend(ctx, [
      { color: C.left,    label: 'Lower Hull' },
      { color: C.right,   label: 'Upper Hull' },
      { color: C.tangent, label: 'Adding' },
      { color: C.removed, label: 'Removed (left turn)' },
      { color: C.hull,    label: 'Final Hull' },
    ], PAD, 8);
  }


  function getInfo() {
    return {
      name: 'Convex Hull (D&C)',
      description:
        'Computes the smallest convex polygon enclosing all input points. The Monotone Chain variant builds the lower and upper hulls separately in O(n log n).',
      divide:
        'Sort points by x-coordinate. Conceptually split into left and right halves; process lower then upper hull.',
      conquer:
        'Scan points left-to-right for the lower hull, removing any point that creates a left (counter-clockwise) turn.',
      combine:
        'Concatenate upper and lower hulls into the final convex polygon. Upper hull removes left turns processing right-to-left.',
      recurrence: 'T(n) = 2·T(n/2) + O(n)   (after sorting)',
      complexitySteps: [
        'Sort: O(n log n)',
        'D&C merge: T(n) = 2T(n/2) + O(n)',
        '          = O(n log n)  [Master Theorem case 2]',
        'Overall: O(n log n) dominated by sorting',
      ],
      finalComplexity: 'Θ(n log n)',
      complexityNote:
        'Lower bound for comparison-based convex hull is Ω(n log n) — it\'s as hard as sorting.',
      defaultInput:     '14',
      inputPlaceholder: 'Number of random points (e.g. 14)',
    };
  }

  function randomPoints(n) {
    return Array.from({ length: n }, () => ({
      x: parseFloat((Math.random() * 85 + 7).toFixed(1)),
      y: parseFloat((Math.random() * 85 + 7).toFixed(1)),
    }));
  }

  function parseInput(str) {
    let n = parseInt(str.trim(), 10);
    if (isNaN(n) || n < 4) n = 14;
    return randomPoints(Math.min(n, 24));
  }

  function getDefaultInput()  { return randomPoints(14); }
  function getRandomInput()   { return randomPoints(10 + Math.floor(Math.random() * 8)); }
  function inputToString(pts) { return String(pts.length); }

  return { getInfo, parseInput, getDefaultInput, getRandomInput, inputToString, generateSteps, render };

})();
