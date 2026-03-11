

'use strict';

window.AlgoClosestPair = (() => {

  const C = {
    dot:     '#4f8ef7',
    left:    '#8be9fd',
    right:   '#bd93f9',
    strip:   '#ffb86c',
    closest: '#50fa7b',
    divLine: '#ff79c6',
    bg:      '#1a1d27',
    grid:    '#242736',
    text:    '#f8f8f2',
    muted:   '#6272a4',
  };

  const DOT_R = 5;


  function dist(p, q) {
    return Math.sqrt((p.x - q.x) ** 2 + (p.y - q.y) ** 2);
  }


  function generateSteps(pointsInput) {

    const pts   = [...pointsInput].sort((a, b) => a.x - b.x);
    const steps = [];
    let   globalBest = { pair: [pts[0], pts[1]], d: dist(pts[0], pts[1]) };

    function push(description, phase, extra = {}) {
      steps.push({ description, phase, points: pts, globalBest: {...globalBest}, ...extra });
    }

    function bruteForce(sub) {
      let best = { pair: [sub[0], sub[1 < sub.length ? 1 : 0]], d: Infinity };
      for (let i = 0; i < sub.length; i++) {
        for (let j = i + 1; j < sub.length; j++) {
          const d = dist(sub[i], sub[j]);
          push(`Brute-force check: dist(${lbl(sub[i])}, ${lbl(sub[j])}) = <b>${d.toFixed(2)}</b>`,
               'conquer', { highlighted: [sub[i], sub[j]], sub });
          if (d < best.d) best = { pair: [sub[i], sub[j]], d };
        }
      }
      if (best.d < globalBest.d) globalBest = best;
      return best;
    }

    function stripCheck(strip, d, divX) {
      strip.sort((a, b) => a.y - b.y);
      let best = { pair: null, d };
      for (let i = 0; i < strip.length; i++) {
        for (let j = i + 1; j < strip.length && strip[j].y - strip[i].y < d; j++) {
          const cd = dist(strip[i], strip[j]);
          push(
            `Strip check: dist(${lbl(strip[i])}, ${lbl(strip[j])}) = <b>${cd.toFixed(2)}</b> (δ=${d.toFixed(2)})`,
            'combine',
            { highlighted: [strip[i], strip[j]], stripWidth: d, divX, strip }
          );
          if (cd < best.d) {
            best = { pair: [strip[i], strip[j]], d: cd };
            if (cd < globalBest.d) globalBest = best;
          }
        }
      }
      return best;
    }

    function closest(sub) {
      if (sub.length <= 3) return bruteForce(sub);

      const mid    = (sub.length / 2) | 0;
      const divX   = sub[mid].x;
      const leftHalf  = sub.slice(0, mid);
      const rightHalf = sub.slice(mid);

      push(`Divide ${sub.length} points at x = ${divX.toFixed(1)} → ${leftHalf.length} left, ${rightHalf.length} right`,
           'divide', { divX, leftSet: leftHalf, rightSet: rightHalf });

      const resL = closest(leftHalf);
      const resR = closest(rightHalf);
      const d    = Math.min(resL.d, resR.d);
      const best = resL.d <= resR.d ? resL : resR;
      if (best.d < globalBest.d) globalBest = best;

      push(`Min of left (${resL.d.toFixed(2)}) and right (${resR.d.toFixed(2)}) = δ = <b>${d.toFixed(2)}</b>`,
           'combine', { divX, stripWidth: d });


      const strip = sub.filter(p => Math.abs(p.x - divX) < d);
      if (strip.length >= 2) {
        push(`Strip check: ${strip.length} points within δ=${d.toFixed(2)} of dividing line`,
             'combine', { divX, stripWidth: d, strip });
        const stripRes = stripCheck(strip, d, divX);
        if (stripRes.pair && stripRes.d < best.d) return stripRes;
      }

      return best;
    }

    push(`${pts.length} points sorted by x-coordinate. Starting closest pair search.`, 'divide');
    const result = closest(pts);
    push(
      `Closest pair: ${lbl(result.pair[0])} and ${lbl(result.pair[1])}, distance = <b>${result.d.toFixed(3)}</b>`,
      'done',
      { closestPair: result.pair }
    );

    return steps;
  }

  function lbl(p) { return `(${p.x.toFixed(1)},${p.y.toFixed(1)})`; }


  function render(canvas, ctx, step) {
    const W = canvas.width, H = canvas.height;
    CU.clear(ctx, canvas, C.bg);

    const {
      points  = [],
      divX, stripWidth,
      leftSet, rightSet,
      strip,
      highlighted = [],
      closestPair,
      globalBest,
    } = step;

    if (!points.length) return;


    const PAD  = 40;
    const xMin = Math.min(...points.map(p => p.x));
    const xMax = Math.max(...points.map(p => p.x));
    const yMin = Math.min(...points.map(p => p.y));
    const yMax = Math.max(...points.map(p => p.y));
    const xRange = xMax - xMin || 1;
    const yRange = yMax - yMin || 1;

    function cx(x) { return PAD + ((x - xMin) / xRange) * (W - PAD * 2); }
    function cy(y) { return H - PAD - ((y - yMin) / yRange) * (H - PAD * 2); }


    for (let i = 0; i <= 5; i++) {
      const gx = Math.round(PAD + (i / 5) * (W - PAD * 2));
      const gy = Math.round(PAD + (i / 5) * (H - PAD * 2));
      CU.line(ctx, gx, PAD, gx, H - PAD, C.grid, 1);
      CU.line(ctx, PAD, gy, W - PAD, gy, C.grid, 1);
    }


    if (divX !== undefined) {
      const lx = cx(divX);
      CU.line(ctx, lx, PAD, lx, H - PAD, C.divLine, 2, [6, 4]);
    }


    if (divX !== undefined && stripWidth !== undefined) {
      const lx1 = cx(divX - stripWidth);
      const lx2 = cx(divX + stripWidth);
      CU.fillRect(ctx, lx1, PAD, lx2 - lx1, H - PAD * 2, 'rgba(255,184,108,0.12)');
    }


    if (globalBest && globalBest.pair) {
      const [p1, p2] = globalBest.pair;
      CU.line(ctx, cx(p1.x), cy(p1.y), cx(p2.x), cy(p2.y), C.closest, 2, [4, 3]);
    }


    if (closestPair) {
      const [p1, p2] = closestPair;
      CU.line(ctx, cx(p1.x), cy(p1.y), cx(p2.x), cy(p2.y), C.closest, 3);
    }


    if (highlighted.length === 2) {
      const [p1, p2] = highlighted;
      CU.line(ctx, cx(p1.x), cy(p1.y), cx(p2.x), cy(p2.y), C.strip, 2);
    }


    const hlSet   = new Set(highlighted.map(p => `${p.x},${p.y}`));
    const leftSet_  = new Set((leftSet  || []).map(p => `${p.x},${p.y}`));
    const rightSet_ = new Set((rightSet || []).map(p => `${p.x},${p.y}`));
    const stripSet  = new Set((strip    || []).map(p => `${p.x},${p.y}`));
    const cpSet     = new Set((closestPair || []).map(p => `${p.x},${p.y}`));

    for (const pt of points) {
      const key = `${pt.x},${pt.y}`;
      let color = C.dot;
      if (leftSet_.has(key))  color = C.left;
      if (rightSet_.has(key)) color = C.right;
      if (stripSet.has(key))  color = C.strip;
      if (hlSet.has(key))     color = C.strip;
      if (cpSet.has(key))     color = C.closest;

      CU.dot(ctx, cx(pt.x), cy(pt.y), DOT_R, color);

      if (cpSet.has(key)) {
        CU.circle(ctx, cx(pt.x), cy(pt.y), DOT_R + 4, null, C.closest, 2);
      }
    }


    if (closestPair) {
      closestPair.forEach(p => {
        CU.text(ctx, lbl(p), cx(p.x), cy(p.y) - 12, {
          font: '10px monospace', color: C.closest, align: 'center',
        });
      });
    }


    if (globalBest && globalBest.pair && globalBest.d !== Infinity) {
      CU.text(ctx, `Current best δ = ${globalBest.d.toFixed(3)}`, W / 2, H - 12, {
        font: 'bold 11px monospace', color: C.closest, align: 'center',
      });
    }


    CU.legend(ctx, [
      { color: C.left,    label: 'Left Half' },
      { color: C.right,   label: 'Right Half' },
      { color: C.strip,   label: 'Strip / Comparing' },
      { color: C.closest, label: 'Closest Pair' },
    ], PAD, 8);
  }


  function getInfo() {
    return {
      name: 'Closest Pair of Points',
      description:
        'Finds the two points with the smallest Euclidean distance in a set of n points on a 2-D plane using Divide and Conquer.',
      divide:
        'Sort points by x. Split into left half and right half at the median x-coordinate.',
      conquer:
        'Recursively find the closest pair in both halves. Base case: ≤3 points solved by brute force.',
      combine:
        'Let δ = min(δL, δR). Check points in the 2δ-wide strip around the dividing line. At most 8 comparisons per point in the strip.',
      recurrence: 'T(n) = 2·T(n/2) + n log n   (strip check)',
      complexitySteps: [
        'T(n) = 2T(n/2) + O(n log n)',
        '     = O(n log²n)   [unoptimised strip step]',
        'With y-sorted sub-arrays passed down:',
        'T(n) = 2T(n/2) + O(n)',
        '     = O(n log n)   [Master Theorem case 2]',
      ],
      finalComplexity: 'Θ(n log n)',
      complexityNote:
        'The strip check visits at most 7 other points per point (geometric packing argument), so the strip scan is O(n) per level.',
      defaultInput:     '12',
      inputPlaceholder: 'Number of random points (e.g. 12)',
    };
  }

  function parseInput(str) {
    let n = parseInt(str.trim(), 10);
    if (isNaN(n) || n < 4) n = 12;
    return randomPoints(Math.min(n, 20));
  }

  function randomPoints(n) {
    const pts = [];
    for (let i = 0; i < n; i++) {
      pts.push({ x: parseFloat((Math.random() * 90 + 5).toFixed(1)),
                 y: parseFloat((Math.random() * 90 + 5).toFixed(1)) });
    }
    return pts;
  }

  function getDefaultInput() { return randomPoints(12); }
  function getRandomInput()  { return randomPoints(10 + Math.floor(Math.random() * 7)); }
  function inputToString(pts) { return String(pts.length); }

  return { getInfo, parseInput, getDefaultInput, getRandomInput, inputToString, generateSteps, render };

})();
