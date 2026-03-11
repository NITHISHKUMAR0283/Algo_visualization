/**
 * algorithms/largestSubarray.js
 *
 * Divide and Conquer – Maximum Subarray Sum (Kadane's D&C variant)
 *
 * Algorithm
 * ---------
 *  Divide the array at mid.  The maximum subarray either lies:
 *    (a) entirely in the left half   [lo..mid]
 *    (b) entirely in the right half  [mid+1..hi]
 *    (c) crosses the midpoint        [i..mid..j]
 *
 *  Crossing sum: expand left from mid, then right from mid+1, take the
 *  best sum on each side and add them.
 *
 * Visual strategy
 * ---------------
 *  • Bars drawn above the baseline for positives, below for negatives.
 *  • Left half → cyan, right half → purple, crossing subarray → orange.
 *  • Running best subarray → green outline.
 *  • A thin mid-line guides the eye.
 */

'use strict';

window.AlgoLargestSubarray = (() => {

  const C = {
    pos:     '#4f8ef7',
    neg:     '#4a5568',
    left:    '#8be9fd',
    right:   '#bd93f9',
    cross:   '#ffb86c',
    best:    '#50fa7b',
    mid:     '#ff79c6',
    text:    '#f8f8f2',
    muted:   '#6272a4',
    bg:      '#1a1d27',
  };

  /* ── step generation ─────────────────────────────────────────── */
  function generateSteps(inputArray) {
    const arr    = [...inputArray];
    const steps  = [];
    let   bestSoFar = { lo: 0, hi: 0, sum: -Infinity };

    function push(description, phase, extra = {}) {
      steps.push({ description, phase, array: arr, bestSoFar: {...bestSoFar}, ...extra });
    }

    function maxCrossing(lo, mid, hi) {
      let leftSum = -Infinity, rightSum = -Infinity;
      let sum = 0, leftIdx = mid, rightIdx = mid + 1;

      for (let i = mid; i >= lo; i--) {
        sum += arr[i];
        if (sum > leftSum) { leftSum = sum; leftIdx = i; }
        push(`Crossing left scan: arr[${i}]=${arr[i]}, cumSum=${sum}`, 'combine',
             { leftHalf: {lo, hi: mid}, rightHalf: {lo: mid+1, hi},
               crossLeft: {lo: leftIdx, hi: mid}, midLine: mid });
      }

      sum = 0;
      for (let j = mid + 1; j <= hi; j++) {
        sum += arr[j];
        if (sum > rightSum) { rightSum = sum; rightIdx = j; }
        push(`Crossing right scan: arr[${j}]=${arr[j]}, cumSum=${sum}`, 'combine',
             { leftHalf: {lo, hi: mid}, rightHalf: {lo: mid+1, hi},
               crossLeft: {lo: leftIdx, hi: mid},
               crossRight: {lo: mid+1, hi: rightIdx}, midLine: mid });
      }

      const crossSum = leftSum + rightSum;
      push(`Crossing subarray [${leftIdx}..${rightIdx}] sum = ${leftSum}+${rightSum} = <b>${crossSum}</b>`,
           'combine',
           { leftHalf: {lo, hi: mid}, rightHalf: {lo: mid+1, hi},
             crossRange: {lo: leftIdx, hi: rightIdx}, midLine: mid });

      return { lo: leftIdx, hi: rightIdx, sum: crossSum };
    }

    function maxSub(lo, hi) {
      if (lo === hi) {
        push(`Base case [${lo}]: single element ${arr[lo]}`, 'conquer',
             { activeRange: {lo, hi} });
        return { lo, hi, sum: arr[lo] };
      }

      const mid = (lo + hi) >> 1;
      push(`Divide [${lo}..${hi}] at mid=${mid}`, 'divide',
           { activeRange: {lo, hi}, midLine: mid,
             leftHalf: {lo, hi: mid}, rightHalf: {lo: mid+1, hi} });

      const leftResult  = maxSub(lo,   mid);
      const rightResult = maxSub(mid+1, hi);
      const crossResult = maxCrossing(lo, mid, hi);

      const best = [leftResult, rightResult, crossResult]
        .reduce((a, b) => b.sum > a.sum ? b : a);

      if (best.sum > bestSoFar.sum) bestSoFar = { ...best };

      push(
        `[${lo}..${hi}] best = <b>${best.sum}</b> from subarray [${best.lo}..${best.hi}]`,
        'combine',
        { activeRange: {lo, hi}, bestRange: {lo: best.lo, hi: best.hi},
          leftResult, rightResult, crossResult }
      );

      return best;
    }

    push('Initial array – find the contiguous subarray with the largest sum.', 'divide',
         { activeRange: {lo: 0, hi: arr.length - 1} });
    const result = maxSub(0, arr.length - 1);

    push(
      `Maximum subarray: [${result.lo}..${result.hi}], sum = <b>${result.sum}</b>`,
      'done',
      { bestRange: {lo: result.lo, hi: result.hi} }
    );

    return steps;
  }

  /* ── render ───────────────────────────────────────────────────── */
  function render(canvas, ctx, step) {
    const W = canvas.width, H = canvas.height;
    CU.clear(ctx, canvas, C.bg);

    const {
      array      = [],
      leftHalf, rightHalf,
      crossRange, crossLeft, crossRight,
      bestRange, midLine,
      activeRange,
    } = step;

    const n     = array.length;
    if (!n) return;

    const PAD       = { t: 28, b: 54, l: 20, r: 20 };
    const barAreaW  = W - PAD.l - PAD.r;
    const barAreaH  = H - PAD.t - PAD.b;
    const barW      = barAreaW / n;
    const midLine_y = PAD.t + barAreaH / 2;     // zero line
    const absMax    = Math.max(...array.map(Math.abs), 1);
    const half_h    = barAreaH / 2 - 2;

    /* background shading */
    function shadeBand(range, color) {
      if (!range) return;
      const rx = PAD.l + range.lo * barW;
      const rw = (range.hi - range.lo + 1) * barW;
      CU.fillRect(ctx, rx, PAD.t, rw, barAreaH, color);
    }

    if (leftHalf)  shadeBand(leftHalf,  'rgba(139,233,253,0.08)');
    if (rightHalf) shadeBand(rightHalf, 'rgba(189,147,249,0.08)');
    if (crossRange) shadeBand(crossRange, 'rgba(255,184,108,0.12)');
    if (bestRange)  shadeBand(bestRange,  'rgba(80,250,123,0.10)');

    /* zero baseline */
    CU.line(ctx, PAD.l, midLine_y, W - PAD.r, midLine_y, '#44475a', 1);

    /* mid-point line */
    if (midLine !== undefined) {
      const mx = PAD.l + (midLine + 1) * barW;
      CU.line(ctx, mx, PAD.t, mx, PAD.t + barAreaH, C.mid, 2, [6, 4]);
    }

    /* bars */
    for (let i = 0; i < n; i++) {
      const val  = array[i];
      const bh   = Math.max(2, (Math.abs(val) / absMax) * half_h);
      const bx   = PAD.l + i * barW;
      const by   = val >= 0 ? midLine_y - bh : midLine_y;
      const gap  = Math.max(1, barW * 0.07);

      let color = val >= 0 ? C.pos : C.neg;
      if (leftHalf  && i >= leftHalf.lo  && i <= leftHalf.hi)  color = C.left;
      if (rightHalf && i >= rightHalf.lo && i <= rightHalf.hi) color = C.right;
      if (crossLeft  && i >= crossLeft.lo  && i <= crossLeft.hi)  color = C.cross;
      if (crossRight && i >= crossRight.lo && i <= crossRight.hi) color = C.cross;
      if (crossRange && i >= crossRange.lo && i <= crossRange.hi) color = C.cross;

      CU.fillRect(ctx, bx + gap, by, barW - gap * 2, bh, color);

      if (bestRange && i >= bestRange.lo && i <= bestRange.hi) {
        CU.strokeRect(ctx, bx + gap, val >= 0 ? midLine_y - bh : midLine_y,
                      barW - gap * 2, bh, C.best, 2);
      }

      if (n <= 20) {
        const fs = Math.max(8, Math.min(11, barW * 0.5));
        CU.text(ctx, val, bx + barW / 2,
          val >= 0 ? midLine_y - bh - 9 : midLine_y + bh + 9, {
          font: `bold ${fs}px monospace`, color: C.text,
        });
        CU.text(ctx, `[${i}]`, bx + barW / 2, H - PAD.b + 14, {
          font: `${Math.max(7, fs - 2)}px monospace`, color: C.muted,
        });
      }
    }

    /* best sum banner */
    if (step.bestSoFar && step.bestSoFar.sum !== -Infinity) {
      const { lo, hi, sum } = step.bestSoFar;
      CU.text(ctx, `Best so far: [${lo}..${hi}] = ${sum}`, W / 2, H - PAD.b + 32, {
        font: 'bold 11px monospace', color: C.best, align: 'center',
      });
    }

    /* legend */
    CU.legend(ctx, [
      { color: C.left,  label: 'Left Half' },
      { color: C.right, label: 'Right Half' },
      { color: C.cross, label: 'Crossing' },
      { color: C.best,  label: 'Best So Far' },
    ], PAD.l, 6);
  }

  /* ── getInfo ──────────────────────────────────────────────────── */
  function getInfo() {
    return {
      name: 'Largest Subarray Sum (D&C)',
      description:
        'Finds the contiguous subarray with the maximum sum using Divide and Conquer. The result is the best of: left-half max, right-half max, and crossing-midpoint max.',
      divide:
        'Split the array at mid. Recurse on [lo..mid] and [mid+1..hi].',
      conquer:
        'Base case: single element. Its sum is itself (could be negative).',
      combine:
        'Find the max crossing subarray by expanding left from mid and right from mid+1. Return max(left_result, right_result, cross_result).',
      recurrence: 'T(n) = 2·T(n/2) + n',
      complexitySteps: [
        'T(n) = 2T(n/2) + n',
        'By Master Theorem / recursion tree:',
        '  a=2, b=2 → log₂2 = 1',
        '  f(n) = n = Θ(n^log_b(a))',
        '  Case 2 of Master Theorem → Θ(n log n)',
      ],
      finalComplexity: 'Θ(n log n)',
      complexityNote:
        'Kadane\'s algorithm achieves Θ(n) but is not D&C. This D&C approach trades a log factor for the pedagogical value of the divide-and-conquer pattern.',
      defaultInput:     '-2, 1, -3, 4, -1, 2, 1, -5, 4',
      inputPlaceholder: 'Comma-separated integers (negatives allowed)',
    };
  }

  function parseInput(str) {
    const nums = str.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
    if (!nums.length) throw new Error('empty');
    return nums.slice(0, 24);
  }

  function getDefaultInput() { return [-2, 1, -3, 4, -1, 2, 1, -5, 4]; }

  function getRandomInput() {
    const n = 8 + Math.floor(Math.random() * 4);
    return Array.from({ length: n }, () => Math.floor(Math.random() * 20) - 7);
  }

  function inputToString(arr) { return arr.join(', '); }

  return { getInfo, parseInput, getDefaultInput, getRandomInput, inputToString, generateSteps, render };

})();
