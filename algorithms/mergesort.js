

'use strict';

window.AlgoMergeSort = (() => {


  const C = {
    bar:      '#4a5568',
    left:     '#8be9fd',
    right:    '#bd93f9',
    compare:  '#ffb86c',
    placing:  '#ff79c6',
    sorted:   '#50fa7b',
    pivot:    '#ff5555',
    muted:    '#6272a4',
    text:     '#f8f8f2',
    bg:       '#1a1d27',
    bg2:      '#242736',
    divLine:  '#ff79c6',
  };


  function generateSteps(inputArray) {
    const arr   = [...inputArray];
    const steps = [];

    function push(description, phase, extra = {}) {
      steps.push({ description, phase, array: [...arr], ...extra });
    }

    function merge(lo, mid, hi) {
      const leftCopy  = arr.slice(lo, mid + 1);
      const rightCopy = arr.slice(mid + 1, hi + 1);
      let i = 0, j = 0, k = lo;

      while (i < leftCopy.length && j < rightCopy.length) {
        const hl = {};

        hl[lo + i]       = 'compare';
        hl[mid + 1 + j]  = 'compare';
        push(
          `Merge [${lo}..${hi}]: compare <b>${leftCopy[i]}</b> vs <b>${rightCopy[j]}</b>`,
          'combine',
          { leftRange: {lo, hi: mid}, rightRange: {lo: mid+1, hi},
            auxLeft: [...leftCopy], auxRight: [...rightCopy],
            leftPtr: i, rightPtr: j, mergePtr: k, highlights: hl }
        );

        if (leftCopy[i] <= rightCopy[j]) arr[k++] = leftCopy[i++];
        else                              arr[k++] = rightCopy[j++];
      }
      while (i < leftCopy.length)  arr[k++] = leftCopy[i++];
      while (j < rightCopy.length) arr[k++] = rightCopy[j++];

      const sh = {};
      for (let x = lo; x <= hi; x++) sh[x] = 'sorted';
      push(
        `Merged [${lo}..${hi}] → [ ${arr.slice(lo, hi+1).join(', ')} ]`,
        'combine',
        { highlights: sh }
      );
    }

    function ms(lo, hi) {
      if (lo >= hi) return;
      const mid = (lo + hi) >> 1;
      push(
        `Divide [${lo}..${hi}]  mid = ${mid}  →  [${lo}..${mid}] and [${mid+1}..${hi}]`,
        'divide',
        { activeRange: {lo, hi}, midIndex: mid, highlights: {} }
      );
      ms(lo,   mid);
      ms(mid+1, hi);
      merge(lo, mid, hi);
    }

    push('Initial array – ready to sort.', 'divide', { highlights: {} });
    ms(0, arr.length - 1);

    const allSorted = {};
    arr.forEach((_, i) => { allSorted[i] = 'sorted'; });
    push('Array fully sorted!', 'done', { highlights: allSorted });

    return steps;
  }


  function render(canvas, ctx, step) {
    const W = canvas.width, H = canvas.height;
    CU.clear(ctx, canvas, C.bg);

    const {
      array      = [],
      highlights = {},
      activeRange, midIndex,
      leftRange, rightRange,
      auxLeft, auxRight,
      leftPtr, rightPtr,
    } = step;

    const n      = array.length;
    if (!n) return;

    const hasAux   = auxLeft && auxRight;
    const mainH    = hasAux ? H * 0.62 : H * 0.88;
    const PAD      = { t: 28, b: 36, l: 20, r: 20 };
    const barAreaW = W - PAD.l - PAD.r;
    const barAreaH = mainH - PAD.t - PAD.b;
    const barW     = barAreaW / n;
    const maxVal   = Math.max(...array, 1);


    if (activeRange) {
      const rx = PAD.l + activeRange.lo * barW;
      const rw = (activeRange.hi - activeRange.lo + 1) * barW;
      CU.fillRect(ctx, rx, PAD.t, rw, barAreaH, 'rgba(79,142,247,0.07)');
    }


    if (leftRange) {
      const rx = PAD.l + leftRange.lo * barW;
      const rw = (leftRange.hi - leftRange.lo + 1) * barW;
      CU.fillRect(ctx, rx, PAD.t, rw, barAreaH, 'rgba(139,233,253,0.08)');
    }
    if (rightRange) {
      const rx = PAD.l + rightRange.lo * barW;
      const rw = (rightRange.hi - rightRange.lo + 1) * barW;
      CU.fillRect(ctx, rx, PAD.t, rw, barAreaH, 'rgba(189,147,249,0.08)');
    }


    if (midIndex !== undefined) {
      const mx = PAD.l + (midIndex + 1) * barW;
      CU.line(ctx, mx, PAD.t, mx, mainH - PAD.b, C.divLine, 2, [6, 4]);
    }


    for (let i = 0; i < n; i++) {
      const bh = Math.max(2, (array[i] / maxVal) * barAreaH);
      const bx = PAD.l + i * barW;
      const by = mainH - PAD.b - bh;
      const gap = Math.max(1, barW * 0.06);

      let color = C.bar;
      if (leftRange  && i >= leftRange.lo  && i <= leftRange.hi)  color = C.left;
      if (rightRange && i >= rightRange.lo && i <= rightRange.hi) color = C.right;
      if (highlights[i] === 'compare') color = C.compare;
      if (highlights[i] === 'sorted')  color = C.sorted;
      if (highlights[i] === 'placing') color = C.placing;

      CU.fillRect(ctx, bx + gap, by, barW - gap * 2, bh, color);

      if (highlights[i] === 'compare') {
        CU.strokeRect(ctx, bx + gap, by, barW - gap * 2, bh, C.compare, 2);
      }


      if (n <= 20) {
        const fs = Math.max(8, Math.min(12, barW * 0.55));
        CU.text(ctx, array[i], bx + barW / 2, mainH - PAD.b + 14, {
          font: `bold ${fs}px monospace`, color: C.text,
        });
        CU.text(ctx, `[${i}]`, bx + barW / 2, PAD.t - 8, {
          font: `${Math.max(7, fs - 2)}px monospace`, color: C.muted,
        });
      }
    }


    if (hasAux) {
      const auxY     = mainH + 6;
      const auxH     = H - auxY - 10;
      const halfW    = (W - PAD.l - PAD.r - 16) / 2;
      const lblY     = auxY + 12;


      renderAuxArray(ctx, auxLeft,  PAD.l,            auxY + 18, halfW, auxH - 18,
                     C.left, leftPtr, 'Left [ ]');

      renderAuxArray(ctx, auxRight, PAD.l + halfW + 16, auxY + 18, halfW, auxH - 18,
                     C.right, rightPtr, 'Right [ ]');
    }


    CU.legend(ctx, [
      { color: C.left,    label: 'Left Half' },
      { color: C.right,   label: 'Right Half' },
      { color: C.compare, label: 'Comparing' },
      { color: C.sorted,  label: 'Sorted' },
    ], PAD.l, 6);
  }

  function renderAuxArray(ctx, arr, x, y, W, H, barColor, ptr, title) {
    if (!arr || arr.length === 0) return;
    const n      = arr.length;
    const maxVal = Math.max(...arr, 1);
    const barW   = W / n;
    const fs     = Math.min(10, barW * 0.6);

    CU.text(ctx, title, x + W / 2, y - 10, {
      font: `bold 10px sans-serif`, color: barColor, align: 'center',
    });

    for (let i = 0; i < n; i++) {
      const bh  = Math.max(2, (arr[i] / maxVal) * (H - 18));
      const bx  = x + i * barW;
      const by  = y + H - 18 - bh;
      const gap = Math.max(1, barW * 0.08);
      const col = (i === ptr) ? '#ffb86c' : barColor;
      CU.fillRect(ctx, bx + gap, by, barW - gap * 2, bh, col);
      if (fs >= 8) {
        CU.text(ctx, arr[i], bx + barW / 2, y + H - 6, {
          font: `${fs}px monospace`, color: '#f8f8f2',
        });
      }
    }

    if (ptr !== undefined && ptr < n) {
      const ax = x + ptr * barW + barW / 2;
      CU.text(ctx, '▲', ax, y + H, {
        font: '11px sans-serif', color: '#ffb86c',
      });
    }
  }


  function getInfo() {
    return {
      name: 'Merge Sort',
      description:
        'Merge Sort divides the array recursively into halves until single elements remain, then merges them back in sorted order.',
      divide:
        'Split the array at mid = ⌊(lo+hi)/2⌋. Recurse on both halves.',
      conquer:
        'Each sub-array of size 1 is trivially sorted (base case).',
      combine:
        'Merge two sorted sub-arrays by repeatedly picking the smaller front element into a temp buffer, then copy back.',
      recurrence: 'T(n) = 2·T(n/2) + n',
      complexitySteps: [
        'T(n) = 2T(n/2) + n',
        'Expand: T(n) = 4T(n/4) + 2n',
        'After k levels: T(n) = 2ᵏT(n/2ᵏ) + k·n',
        'Base: n/2ᵏ = 1  ⟹  k = log₂n',
        'T(n) = n·T(1) + n·log₂n',
        '     = n + n·log n',
      ],
      finalComplexity: 'Θ(n log n)',
      complexityNote:
        'All three cases (best, average, worst) are Θ(n log n) because the split is always balanced.',
      defaultInput:     '64, 25, 12, 22, 11, 90, 38, 72',
      inputPlaceholder: 'Comma-separated integers (e.g. 64, 25, 12, 22)',
    };
  }


  function parseInput(str) {
    const nums = str.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
    if (!nums.length) throw new Error('empty');
    return nums.slice(0, 32);
  }

  function getDefaultInput() {
    return [64, 25, 12, 22, 11, 90, 38, 72];
  }

  function getRandomInput() {
    const n = 8 + Math.floor(Math.random() * 5);
    return Array.from({ length: n }, () => 1 + Math.floor(Math.random() * 99));
  }

  function inputToString(arr) { return arr.join(', '); }


  return { getInfo, parseInput, getDefaultInput, getRandomInput, inputToString, generateSteps, render };

})();
