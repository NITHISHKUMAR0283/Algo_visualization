/**
 * algorithms/quicksort.js
 *
 * Divide and Conquer – Quick Sort (Lomuto partition scheme)
 *
 * Visual strategy
 * ---------------
 *  • Array bars, coloured by role in the current partition step.
 *  • Pivot bar is red.
 *  • Elements known to be ≤ pivot are cyan; > pivot are purple.
 *  • The two items being swapped flash orange momentarily (swap step).
 *  • The partition boundary (i pointer) is shown as a small arrow.
 *  • Fully sorted bars turn green.
 */

'use strict';

window.AlgoQuickSort = (() => {

  const C = {
    bar:     '#4a5568',
    pivot:   '#ff5555',
    small:   '#8be9fd',   // ≤ pivot
    large:   '#bd93f9',   // > pivot (scanned but not swapped into left)
    swap:    '#ffb86c',
    sorted:  '#50fa7b',
    muted:   '#6272a4',
    text:    '#f8f8f2',
    bg:      '#1a1d27',
  };

  /* ── step generation ──────────────────────────────────────────── */
  function generateSteps(inputArray) {
    const arr    = [...inputArray];
    const steps  = [];
    const sortedSet = new Set();

    function push(description, phase, extra = {}) {
      steps.push({
        description, phase,
        array:   [...arr],
        sorted:  new Set(sortedSet),
        ...extra,
      });
    }

    function partition(lo, hi) {
      const pivotVal  = arr[hi];
      const pivotIdx  = hi;
      let   i         = lo - 1;

      push(
        `Partition [${lo}..${hi}]: pivot = <b>${pivotVal}</b> (index ${hi})`,
        'divide',
        { pivotIdx, partRange: {lo, hi}, iPtr: i, jPtr: lo, highlights: { [hi]: 'pivot' } }
      );

      for (let j = lo; j < hi; j++) {
        const hl = { [hi]: 'pivot', [j]: 'compare' };
        if (i >= lo) hl[i] = 'iptr';

        push(
          `Compare arr[${j}] = <b>${arr[j]}</b> with pivot <b>${pivotVal}</b>`,
          'divide',
          { pivotIdx, partRange: {lo, hi}, iPtr: i, jPtr: j, highlights: hl }
        );

        if (arr[j] <= pivotVal) {
          i++;
          if (i !== j) {
            push(
              `Swap arr[${i}] = ${arr[i]} ↔ arr[${j}] = ${arr[j]}`,
              'conquer',
              { pivotIdx, partRange: {lo, hi}, iPtr: i, jPtr: j,
                highlights: { [hi]: 'pivot', [i]: 'swap', [j]: 'swap' } }
            );
            [arr[i], arr[j]] = [arr[j], arr[i]];
          }
        }
      }

      // Place pivot into final position
      const finalPivot = i + 1;
      if (finalPivot !== hi) {
        push(
          `Place pivot <b>${pivotVal}</b> at index ${finalPivot} (swap with index ${hi})`,
          'conquer',
          { pivotIdx: finalPivot, partRange: {lo, hi}, iPtr: i,
            highlights: { [finalPivot]: 'swap', [hi]: 'swap' } }
        );
        [arr[finalPivot], arr[hi]] = [arr[hi], arr[finalPivot]];
      }

      sortedSet.add(finalPivot);
      push(
        `Pivot <b>${arr[finalPivot]}</b> is now in its correct position (index ${finalPivot})`,
        'conquer',
        { pivotIdx: finalPivot, partRange: {lo, hi},
          highlights: { [finalPivot]: 'sorted' } }
      );

      return finalPivot;
    }

    function qs(lo, hi) {
      if (lo >= hi) {
        if (lo === hi) sortedSet.add(lo);
        return;
      }
      const p = partition(lo, hi);
      qs(lo,   p - 1);
      qs(p + 1, hi);
    }

    push('Initial array – ready to sort.', 'divide', { highlights: {} });
    qs(0, arr.length - 1);

    const allHL = {};
    arr.forEach((_, i) => { allHL[i] = 'sorted'; });
    steps.push({
      description: 'Array fully sorted!', phase: 'done',
      array: [...arr], sorted: new Set(), highlights: allHL,
    });

    return steps;
  }

  /* ── render ───────────────────────────────────────────────────── */
  function render(canvas, ctx, step) {
    const W = canvas.width, H = canvas.height;
    CU.clear(ctx, canvas, C.bg);

    const {
      array      = [],
      highlights = {},
      sorted     = new Set(),
      pivotIdx,
      partRange,
      iPtr,
    } = step;

    const n = array.length;
    if (!n) return;

    const PAD       = { t: 28, b: 44, l: 20, r: 20 };
    const barAreaW  = W - PAD.l - PAD.r;
    const barAreaH  = H - PAD.t - PAD.b;
    const barW      = barAreaW / n;
    const maxVal    = Math.max(...array, 1);

    /* partition range background */
    if (partRange) {
      const rx = PAD.l + partRange.lo * barW;
      const rw = (partRange.hi - partRange.lo + 1) * barW;
      CU.fillRect(ctx, rx, PAD.t, rw, barAreaH, 'rgba(79,142,247,0.07)');
    }

    /* bars */
    for (let i = 0; i < n; i++) {
      const bh  = Math.max(2, (array[i] / maxVal) * barAreaH);
      const bx  = PAD.l + i * barW;
      const by  = H - PAD.b - bh;
      const gap = Math.max(1, barW * 0.06);

      let color = C.bar;
      if (sorted.has(i))           color = C.sorted;
      if (partRange) {
        if (i < (iPtr !== undefined ? iPtr + 1 : partRange.lo) && i >= partRange.lo)
          color = C.small;
      }
      if (highlights[i] === 'pivot')   color = C.pivot;
      if (highlights[i] === 'compare') color = C.large;
      if (highlights[i] === 'swap')    color = C.swap;
      if (highlights[i] === 'sorted')  color = C.sorted;
      if (highlights[i] === 'iptr')    color = C.small;
      if (i === pivotIdx)              color = C.pivot;

      CU.fillRect(ctx, bx + gap, by, barW - gap * 2, bh, color);

      if (highlights[i] === 'pivot' || i === pivotIdx) {
        CU.strokeRect(ctx, bx + gap, by, barW - gap * 2, bh, C.pivot, 2);
      }
      if (highlights[i] === 'swap') {
        CU.strokeRect(ctx, bx + gap, by, barW - gap * 2, bh, C.swap, 2);
      }

      if (n <= 20) {
        const fs = Math.max(8, Math.min(12, barW * 0.55));
        CU.text(ctx, array[i], bx + barW / 2, H - PAD.b + 14, {
          font: `bold ${fs}px monospace`, color: C.text,
        });
        CU.text(ctx, `[${i}]`, bx + barW / 2, PAD.t - 8, {
          font: `${Math.max(7, fs - 2)}px monospace`, color: C.muted,
        });
      }
    }

    /* i-pointer (partition boundary) */
    if (iPtr !== undefined && iPtr >= 0) {
      const ax = PAD.l + iPtr * barW + barW / 2;
      CU.text(ctx, 'i', ax, H - PAD.b + 30, {
        font: 'bold 11px monospace', color: C.small,
      });
    }

    /* legend */
    CU.legend(ctx, [
      { color: C.pivot,  label: 'Pivot' },
      { color: C.small,  label: '≤ Pivot' },
      { color: C.large,  label: '>  Pivot (scanning)' },
      { color: C.swap,   label: 'Swapping' },
      { color: C.sorted, label: 'Sorted' },
    ], PAD.l, 6);
  }

  /* ── getInfo ──────────────────────────────────────────────────── */
  function getInfo() {
    return {
      name: 'Quick Sort',
      description:
        'Quick Sort selects a pivot element and partitions the array so all elements to its left are ≤ pivot and all to its right are > pivot, then recurses on each partition.',
      divide:
        'Choose a pivot (here: last element). Partition the current range around the pivot using two pointers i and j.',
      conquer:
        'Recursively sort the left sub-array [lo..p-1] and right sub-array [p+1..hi].',
      combine:
        'No explicit merge is needed — the array is sorted in-place; sub-problems combine trivially.',
      recurrence: 'T(n) = T(k) + T(n-k-1) + n  (k = partition size)',
      complexitySteps: [
        'Best/Average (balanced split, k ≈ n/2):',
        '  T(n) = 2T(n/2) + n  →  Θ(n log n)',
        'Worst (sorted input, k = 0 each time):',
        '  T(n) = T(0) + T(n-1) + n',
        '       = T(n-1) + n',
        '       → Θ(n²)',
      ],
      finalComplexity: 'Avg Θ(n log n)  /  Worst Θ(n²)',
      complexityNote:
        'Random pivot selection or shuffling the input before sorting avoids the O(n²) worst case.',
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
