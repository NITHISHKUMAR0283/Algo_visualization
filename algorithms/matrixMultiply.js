

'use strict';

window.AlgoMatrixMultiply = (() => {


  const QCOL = ['#2563eb','#10b981','#f97316','#7c3aed'];
  const QNAME = ['11','12','21','22'];


  function randMatrix(n) {
    return Array.from({ length: n }, () =>
      Array.from({ length: n }, () => Math.floor(Math.random() * 9) + 1)
    );
  }

  function zeroMatrix(n) {
    return Array.from({ length: n }, () => new Array(n).fill(0));
  }

  function addMatrix(A, B) {
    const n = A.length;
    return A.map((row, i) => row.map((v, j) => v + B[i][j]));
  }

  function mulMatrix(A, B) {
    const n = A.length;
    const C = zeroMatrix(n);
    for (let i = 0; i < n; i++)
      for (let k = 0; k < n; k++)
        for (let j = 0; j < n; j++)
          C[i][j] += A[i][k] * B[k][j];
    return C;
  }

  function getQuadrant(M, qi, qj, half) {
    return Array.from({ length: half }, (_, r) =>
      Array.from({ length: half }, (_, c) => M[qi * half + r][qj * half + c])
    );
  }

  function setQuadrant(M, qi, qj, half, sub) {
    for (let r = 0; r < half; r++)
      for (let c = 0; c < half; c++)
        M[qi * half + r][qj * half + c] = sub[r][c];
  }


  function parseInput(str) {
    let n = parseInt(str.trim(), 10);
    if (isNaN(n) || n < 2) n = 4;

    if (n <= 2) n = 2;
    else if (n <= 4) n = 4;
    else n = 4;
    return n;
  }

  function getDefaultInput()  { return 4; }
  function getRandomInput()   { return [2, 4][Math.floor(Math.random() * 2)]; }
  function inputToString(n)   { return String(n); }


  function generateSteps(N) {
    const A = randMatrix(N);
    const B = randMatrix(N);
    const C = zeroMatrix(N);
    const steps = [];

    function push(description, phase, extra = {}) {
      steps.push({ description, phase, A, B, C: extra.C || C, N, ...extra });
    }

    push(`Initial ${N}×${N} matrices A and B. We will compute C = A × B.`, 'divide', { C: zeroMatrix(N) });

    if (N === 2) {

      push('Divide & Conquer on 2×2 matrices: each quadrant is a scalar product.', 'divide',
           { hlA: [[0,0]], hlB: [[0,0]], hlC: null, C: zeroMatrix(N) });

      for (let ri = 0; ri < N; ri++) {
        for (let ci = 0; ci < N; ci++) {
          let sum = 0;
          const row = [];
          for (let k = 0; k < N; k++) {
            sum += A[ri][k] * B[k][ci];
            row.push(`A[${ri}][${k}]×B[${k}][${ci}]`);
          }
          const Ccopy = C.map(r => [...r]);
          Ccopy[ri][ci] = sum;
          push(
            `C[${ri}][${ci}] = ${row.join(' + ')} = <b>${sum}</b>`,
            'combine',
            { hlA: [[ri, 0], [ri, 1]], hlB: [[0, ci], [1, ci]], hlC: [ri, ci],
              C: Ccopy }
          );
          C[ri][ci] = sum;
        }
      }
    } else {

      const half = N / 2;
      push(`Divide each ${N}×${N} matrix into four ${half}×${half} quadrants.`, 'divide',
           { showQuadrants: true, C: zeroMatrix(N) });


      const ops = [
        { ci: 0, cj: 0, terms: [[0,0,0,0],[0,1,1,0]], label: 'C₁₁ = A₁₁·B₁₁ + A₁₂·B₂₁' },
        { ci: 0, cj: 1, terms: [[0,0,0,1],[0,1,1,1]], label: 'C₁₂ = A₁₁·B₁₂ + A₁₂·B₂₂' },
        { ci: 1, cj: 0, terms: [[1,0,0,0],[1,1,1,0]], label: 'C₂₁ = A₂₁·B₁₁ + A₂₂·B₂₁' },
        { ci: 1, cj: 1, terms: [[1,0,0,1],[1,1,1,1]], label: 'C₂₂ = A₂₁·B₁₂ + A₂₂·B₂₂' },
      ];

      for (const op of ops) {
        const { ci, cj, terms, label } = op;


        push(
          `Computing ${label} — multiplying sub-matrices recursively`,
          'divide',
          { activeQuadA: terms.map(t => [t[0], t[1]]),
            activeQuadB: terms.map(t => [t[2], t[3]]),
            activeQuadC: [ci, cj],
            C: C.map(r => [...r]) }
        );

        let Cq = zeroMatrix(half);
        for (const [ai, aj, bi, bj] of terms) {
          const Asub = getQuadrant(A, ai, aj, half);
          const Bsub = getQuadrant(B, bi, bj, half);
          const prod = mulMatrix(Asub, Bsub);
          Cq = addMatrix(Cq, prod);

          const Ctmp = C.map(r => [...r]);
          setQuadrant(Ctmp, ci, cj, half, Cq);
          push(
            `${label}: partial product A[${ai+1}${aj+1}] × B[${bi+1}${bj+1}] added to C[${ci+1}${cj+1}]`,
            'conquer',
            { activeQuadA: [[ai, aj]], activeQuadB: [[bi, bj]],
              activeQuadC: [ci, cj], C: Ctmp }
          );
        }

        setQuadrant(C, ci, cj, half, Cq);
        push(
          `${label} complete. Quadrant C[${ci+1}${cj+1}] filled.`,
          'combine',
          { doneQuadC: [ci, cj], C: C.map(r => [...r]) }
        );
      }
    }

    push('Matrix multiplication complete. C = A × B computed!', 'done', { C: C.map(r => [...r]) });
    return steps;
  }


  function render(canvas, ctx, step) {
    const W = canvas.width, H = canvas.height;
    CU.clear(ctx, canvas, '#f8f9fa');

    const { A, B, C, N } = step;
    if (!A || !B || !C) return;


    const PAD  = 24;
    const GAP  = 30;
    const labelH = 22;
    const availW = (W - PAD * 2 - GAP * 4) / 3;
    const availH = H - PAD * 2 - labelH - 20;
    const cellSize = Math.floor(Math.min(availW / N, availH / N));
    const gridW  = cellSize * N;
    const gridH  = cellSize * N;
    const totalW = gridW * 3 + GAP * 2;
    const startX = (W - totalW) / 2;
    const startY = PAD + labelH + (availH - gridH) / 2;

    const Axo = startX;
    const Bxo = startX + gridW + GAP;
    const Cxo = startX + (gridW + GAP) * 2;


    function drawMatrix(mat, xo, yo, title, hlCells, activeQuads, doneQuad, cellModeFn) {

      CU.text(ctx, title, xo + gridW / 2, yo - 10, {
        font: 'bold 13px sans-serif', color: '#8be9fd', align: 'center',
      });

      const half = N / 2;
      for (let r = 0; r < N; r++) {
        for (let ci = 0; ci < N; ci++) {
          const x = xo + ci * cellSize;
          const y = yo + r  * cellSize;


          const qi = r  < half ? 0 : 1;
          const qj = ci < half ? 0 : 1;
          const qIdx = qi * 2 + qj;


          let fill = '#242736';

          if (activeQuads) {
            const isActive = activeQuads.some(([aq, bq]) => aq === qi && bq === qj);
            if (isActive) fill = `${QCOL[qIdx]}28`;
          }
          if (doneQuad) {
            if (doneQuad[0] === qi && doneQuad[1] === qj) fill = `${QCOL[qIdx]}40`;
          }
          if (hlCells) {
            const isHl = hlCells.some(([hr, hc]) => hr === r && hc === ci);
            if (isHl) fill = `${QCOL[qIdx]}88`;
          }
          if (cellModeFn) {
            const customFill = cellModeFn(r, ci);
            if (customFill) fill = customFill;
          }

          CU.rect(ctx, x + 1, y + 1, cellSize - 2, cellSize - 2, fill, '#44475a', 1);


          const val = mat[r][ci];
          const fs  = Math.max(8, Math.min(14, cellSize * 0.45));
          CU.text(ctx, val, x + cellSize / 2, y + cellSize / 2, {
            font: `${fs}px monospace`,
            color: fill !== '#242736' ? '#f8f8f2' : '#6272a4',
          });
        }
      }


      if (N > 2) {
        const half = N / 2;
        const mx = xo + half * cellSize;
        const my = yo + half * cellSize;
        CU.line(ctx, mx, yo, mx, yo + gridH, '#44475a', 2, [4, 3]);
        CU.line(ctx, xo, my, xo + gridW, my, '#44475a', 2, [4, 3]);
      }


      CU.strokeRect(ctx, xo, yo, gridW, gridH, '#44475a', 1);
    }

    const { hlA, hlB, hlC, activeQuadA, activeQuadB, activeQuadC, doneQuadC, showQuadrants } = step;

    drawMatrix(A, Axo, startY, 'Matrix A', hlA, activeQuadA, null, null);


    CU.text(ctx, '×', Axo + gridW + GAP / 2, startY + gridH / 2, {
      font: 'bold 22px sans-serif', color: '#6272a4',
    });

    drawMatrix(B, Bxo, startY, 'Matrix B', hlB, activeQuadB, null, null);


    CU.text(ctx, '=', Bxo + gridW + GAP / 2, startY + gridH / 2, {
      font: 'bold 22px sans-serif', color: '#6272a4',
    });


    const cHlCells = (hlC && !Array.isArray(hlC[0])) ? [hlC] : (hlC || null);
    drawMatrix(C, Cxo, startY, 'Matrix C  (Result)', cHlCells,
               activeQuadC ? [activeQuadC] : null,
               doneQuadC || null, null);


    if (N > 2) {
      const legendItems = [
        { color: QCOL[0], label: 'Q₁₁' },
        { color: QCOL[1], label: 'Q₁₂' },
        { color: QCOL[2], label: 'Q₂₁' },
        { color: QCOL[3], label: 'Q₂₂' },
      ];
      CU.legend(ctx, legendItems, PAD, H - 18);
    }
  }


  function getInfo() {
    return {
      name: 'Matrix Multiplication (D&C)',
      description:
        'Divides each n×n matrix into four (n/2)×(n/2) sub-matrices and recursively computes the product, achieving the same O(n³) complexity as naive multiplication but illustrating the D&C paradigm.',
      divide:
        'Partition A, B, and C each into four (n/2)×(n/2) quadrants: A₁₁, A₁₂, A₂₁, A₂₂.',
      conquer:
        'Recursively multiply sub-matrices: C₁₁ = A₁₁B₁₁ + A₁₂B₂₁, C₁₂ = A₁₁B₁₂ + A₁₂B₂₂, etc.',
      combine:
        'Sum the two recursive products for each quadrant of C using matrix addition.',
      recurrence: 'T(n) = 8·T(n/2) + n²',
      complexitySteps: [
        'T(n) = 8T(n/2) + n²',
        'By Master Theorem (case 1):',
        'a = 8, b = 2  →  log₂8 = 3',
        'f(n) = n² = O(n^(log_b a - ε))',
        'ε = 1 > 0  →  apply Master Theorem case 1',
      ],
      finalComplexity: 'Θ(n³)',
      complexityNote:
        'This D&C approach still has O(n³) complexity. Strassen\'s algorithm reduces the 8 multiplications to 7, lowering the exponent to ~2.81.',
      defaultInput:     '4',
      inputPlaceholder: 'Matrix size N (2 or 4)',
    };
  }

  return { getInfo, parseInput, getDefaultInput, getRandomInput, inputToString, generateSteps, render };

})();
