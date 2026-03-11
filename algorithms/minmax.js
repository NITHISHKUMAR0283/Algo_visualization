

'use strict';

window.AlgoMinMax = (() => {

  const C = {
    bar:     '#4a5568',
    active:  '#4f8ef7',
    min:     '#ff5555',
    max:     '#50fa7b',
    compare: '#ffb86c',
    muted:   '#6272a4',
    text:    '#f8f8f2',
    bg:      '#1a1d27',
  };


  function generateSteps(inputArray) {
    const arr    = [...inputArray];
    const steps  = [];
    let   gMin   = Infinity;
    let   gMax   = -Infinity;
    let   gMinIdx = -1, gMaxIdx = -1;

    function push(description, phase, extra = {}) {
      steps.push({
        description, phase, array: arr,
        min: gMin === Infinity ? null : gMin,
        max: gMax === -Infinity ? null : gMax,
        minIdx: gMinIdx, maxIdx: gMaxIdx,
        ...extra,
      });
    }

    function update(val, idx) {
      if (val < gMin) { gMin = val; gMinIdx = idx; }
      if (val > gMax) { gMax = val; gMaxIdx = idx; }
    }

    function minMax(lo, hi) {
      if (lo === hi) {
        push(`Base case: single element arr[${lo}] = <b>${arr[lo]}</b>. It's both local min and max.`,
          'conquer',
          { activeRange: {lo, hi}, compare: [lo] }
        );
        update(arr[lo], lo);
        push(`Update global: min = <b>${gMin}</b> (idx ${gMinIdx}), max = <b>${gMax}</b> (idx ${gMaxIdx})`,
          'conquer',
          { activeRange: {lo, hi} }
        );
        return;
      }

      if (lo + 1 === hi) {
        push(`Base case: two elements arr[${lo}]=${arr[lo]}, arr[${hi}]=${arr[hi]}. Compare them directly.`,
          'conquer',
          { activeRange: {lo, hi}, compare: [lo, hi] }
        );
        update(arr[lo], lo);
        update(arr[hi], hi);
        push(`Update global: min = <b>${gMin}</b>, max = <b>${gMax}</b>`, 'conquer',
          { activeRange: {lo, hi} }
        );
        return;
      }

      const mid = (lo + hi) >> 1;
      push(
        `Divide [${lo}..${hi}] at mid=${mid} → [${lo}..${mid}] and [${mid+1}..${hi}]`,
        'divide',
        { activeRange: {lo, hi}, midIndex: mid }
      );
      minMax(lo, mid);
      minMax(mid + 1, hi);
    }

    push('Initial array – scan for min & max using Divide and Conquer.', 'divide',
         { activeRange: {lo: 0, hi: arr.length - 1} });
    minMax(0, arr.length - 1);
    push(
      `Done! Min = <b>${gMin}</b> at index ${gMinIdx}, Max = <b>${gMax}</b> at index ${gMaxIdx}.`,
      'done',
      {}
    );

    return steps;
  }


  function render(canvas, ctx, step) {
    const W = canvas.width, H = canvas.height;
    CU.clear(ctx, canvas, C.bg);

    const {
      array      = [],
      activeRange,
      midIndex,
      compare    = [],
      minIdx,
      maxIdx,
    } = step;

    const n     = array.length;
    if (!n) return;

    const PAD      = { t: 44, b: 54, l: 20, r: 20 };
    const barAreaW = W - PAD.l - PAD.r;
    const barAreaH = H - PAD.t - PAD.b;
    const barW     = barAreaW / n;
    const maxVal   = Math.max(...array, 1);


    if (activeRange) {
      const rx = PAD.l + activeRange.lo * barW;
      const rw = (activeRange.hi - activeRange.lo + 1) * barW;
      CU.fillRect(ctx, rx, PAD.t, rw, barAreaH, 'rgba(79,142,247,0.08)');
    }


    if (midIndex !== undefined) {
      const mx = PAD.l + (midIndex + 1) * barW;
      CU.line(ctx, mx, PAD.t, mx, H - PAD.b, '#ff79c6', 2, [5, 4]);
    }


    for (let i = 0; i < n; i++) {
      const bh  = Math.max(2, (array[i] / maxVal) * barAreaH);
      const bx  = PAD.l + i * barW;
      const by  = H - PAD.b - bh;
      const gap = Math.max(1, barW * 0.07);

      let color = C.bar;
      if (activeRange && i >= activeRange.lo && i <= activeRange.hi) color = C.active;
      if (compare.includes(i)) color = C.compare;

      CU.fillRect(ctx, bx + gap, by, barW - gap * 2, bh, color);


      if (i === minIdx) {
        CU.strokeRect(ctx, bx + gap, by, barW - gap * 2, bh, C.min, 2);
        CU.text(ctx, 'MIN', bx + barW / 2, by - 9, {
          font: 'bold 9px sans-serif', color: C.min,
        });
      }
      if (i === maxIdx) {
        CU.strokeRect(ctx, bx + gap, by, barW - gap * 2, bh, C.max, 2);
        CU.text(ctx, 'MAX', bx + barW / 2, by - 9, {
          font: 'bold 9px sans-serif', color: C.max,
        });
      }

      if (n <= 24) {
        const fs = Math.max(8, Math.min(12, barW * 0.55));
        CU.text(ctx, array[i], bx + barW / 2, H - PAD.b + 14, {
          font: `bold ${fs}px monospace`, color: C.text,
        });
        CU.text(ctx, `[${i}]`, bx + barW / 2, PAD.t - 12, {
          font: `${Math.max(7, fs - 2)}px monospace`, color: C.muted,
        });
      }
    }


    const { min, max } = step;
    const bannerY = H - PAD.b + 30;
    if (min !== null) {
      CU.text(ctx, `Current Min: ${min}`, 30, bannerY, {
        font: 'bold 11px monospace', color: C.min, align: 'left',
      });
    }
    if (max !== null) {
      CU.text(ctx, `Current Max: ${max}`, W - 30, bannerY, {
        font: 'bold 11px monospace', color: C.max, align: 'right',
      });
    }


    CU.legend(ctx, [
      { color: C.active,  label: 'Active Range' },
      { color: C.compare, label: 'Comparing' },
      { color: C.min,     label: 'Min' },
      { color: C.max,     label: 'Max' },
    ], PAD.l, 6);
  }


  function getInfo() {
    return {
      name: 'Min & Max Finding (D&C)',
      description:
        'Finds both the minimum and maximum of an array using Divide and Conquer, requiring only ≈ 3n/2 comparisons — fewer than the 2(n−1) needed by two separate linear scans.',
      divide:
        'Recursively split the array at its midpoint until segments of size 1 or 2 are reached.',
      conquer:
        'For size-1 segments, the element is trivially both min and max. For size-2, compare the two elements directly (1 comparison).',
      combine:
        'Propagate local min and max upward, updating the global min/max at each level.',
      recurrence: 'T(n) = 2·T(n/2) + 2   (comparisons)',
      complexitySteps: [
        'Comparisons at leaves (pairs): n/2',
        'Each internal level adds 2 comparisons',
        'Total ≈ 3n/2 − 2  comparisons',
        'Time complexity: T(n) = Θ(n)',
      ],
      finalComplexity: 'Θ(n)',
      complexityNote:
        'D&C approach uses ≈ 3n/2 comparisons vs 2(n−1) for naïve two-pass scan, saving ~25% for large n.',
      defaultInput:     '64, 25, 12, 22, 11, 90, 38, 72',
      inputPlaceholder: 'Comma-separated integers',
    };
  }

  function parseInput(str) {
    const nums = str.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
    if (!nums.length) throw new Error('empty');
    return nums.slice(0, 32);
  }

  function getDefaultInput() { return [64, 25, 12, 22, 11, 90, 38, 72]; }

  function getRandomInput() {
    const n = 8 + Math.floor(Math.random() * 5);
    return Array.from({ length: n }, () => 1 + Math.floor(Math.random() * 99));
  }

  function inputToString(arr) { return arr.join(', '); }

  return { getInfo, parseInput, getDefaultInput, getRandomInput, inputToString, generateSteps, render };

})();
