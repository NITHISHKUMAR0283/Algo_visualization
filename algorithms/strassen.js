

'use strict';

window.AlgoStrassen = (() => {


  function randMat() {
    return [[rnd(), rnd()], [rnd(), rnd()]];
  }
  function rnd() { return Math.floor(Math.random() * 9) + 1; }

  function matAdd(A, B) {
    return [[A[0][0]+B[0][0], A[0][1]+B[0][1]],
            [A[1][0]+B[1][0], A[1][1]+B[1][1]]];
  }
  function matSub(A, B) {
    return [[A[0][0]-B[0][0], A[0][1]-B[0][1]],
            [A[1][0]-B[1][0], A[1][1]-B[1][1]]];
  }
  function matMul(A, B) {
    return [
      [A[0][0]*B[0][0]+A[0][1]*B[1][0], A[0][0]*B[0][1]+A[0][1]*B[1][1]],
      [A[1][0]*B[0][0]+A[1][1]*B[1][0], A[1][0]*B[0][1]+A[1][1]*B[1][1]],
    ];
  }


  const M_DEFS = [
    { name: 'M₁', formula: '(a+d)·(e+h)',   desc: 'A₁₁+A₂₂  times  B₁₁+B₂₂' },
    { name: 'M₂', formula: '(c+d)·e',        desc: 'A₂₁+A₂₂  times  B₁₁' },
    { name: 'M₃', formula: 'a·(f-h)',         desc: 'A₁₁  times  B₁₂-B₂₂' },
    { name: 'M₄', formula: 'd·(g-e)',         desc: 'A₂₂  times  B₂₁-B₁₁' },
    { name: 'M₅', formula: '(a+b)·h',         desc: 'A₁₁+A₁₂  times  B₂₂' },
    { name: 'M₆', formula: '(c-a)·(e+f)',     desc: 'A₂₁-A₁₁  times  B₁₁+B₁₂' },
    { name: 'M₇', formula: '(b-d)·(g+h)',     desc: 'A₁₂-A₂₂  times  B₂₁+B₂₂' },
  ];

  const C_DEFS = [
    { name: 'C₁₁', formula: 'M₁+M₄-M₅+M₇', idx: [0,0] },
    { name: 'C₁₂', formula: 'M₃+M₅',         idx: [0,1] },
    { name: 'C₂₁', formula: 'M₂+M₄',         idx: [1,0] },
    { name: 'C₂₂', formula: 'M₁-M₂+M₃+M₆',  idx: [1,1] },
  ];


  function generateSteps(ignored) {
    const A = randMat();
    const B = randMat();
    const [a,b,c,d] = [A[0][0],A[0][1],A[1][0],A[1][1]];
    const [e,f,g,h] = [B[0][0],B[0][1],B[1][0],B[1][1]];
    const steps = [];
    const Ms = new Array(7).fill(null);

    function push(description, phase, extra = {}) {
      steps.push({ description, phase, A, B, Ms:[...Ms], ...extra });
    }

    push('Initial 2×2 matrices A and B. Strassen computes C = A·B using only <b>7</b> multiplications.', 'divide');

    push('Divide: partition each 2×2 matrix into scalar elements: a, b, c, d and e, f, g, h.', 'divide',
         { highlightAll: true });


    const Mvals = [
      (a+d)*(e+h),
      (c+d)*e,
      a*(f-h),
      d*(g-e),
      (a+b)*h,
      (c-a)*(e+f),
      (b-d)*(g+h),
    ];

    for (let i = 0; i < 7; i++) {
      push(
        `Compute <b>${M_DEFS[i].name}</b> = ${M_DEFS[i].formula} = <b>${Mvals[i]}</b><br><small>${M_DEFS[i].desc}</small>`,
        'conquer',
        { currentM: i }
      );
      Ms[i] = Mvals[i];
      push(
        `${M_DEFS[i].name} = <b>${Mvals[i]}</b>  ✓`,
        'conquer',
        { currentM: i, doneMs: Ms.map((v,k)=>k<=i?true:false) }
      );
    }


    const C = [[0,0],[0,0]];
    for (const cd of C_DEFS) {
      const [ri, ci] = cd.idx;
      let val;
      if (cd.name === 'C₁₁') val = Mvals[0]+Mvals[3]-Mvals[4]+Mvals[6];
      if (cd.name === 'C₁₂') val = Mvals[2]+Mvals[4];
      if (cd.name === 'C₂₁') val = Mvals[1]+Mvals[3];
      if (cd.name === 'C₂₂') val = Mvals[0]-Mvals[1]+Mvals[2]+Mvals[5];
      C[ri][ci] = val;
      push(
        `Combine: <b>${cd.name}</b> = ${cd.formula} = <b>${val}</b>`,
        'combine',
        { C: C.map(r=>[...r]), currentC: cd.idx }
      );
    }

    push('Strassen complete!  C = A·B computed with only <b>7</b> multiplications (vs 8 in naïve D&C).', 'done',
         { C: C.map(r=>[...r]) });

    return steps;
  }


  const MC = ['#2563eb','#10b981','#f97316','#7c3aed','#ec4899','#0d9488','#eab308'];

  function drawMat2x2(ctx, mat, xo, yo, cs, title, fill) {
    if (title) {
      CU.text(ctx, title, xo + cs, yo - 10, {
        font: 'bold 12px sans-serif', color: '#0d9488', align: 'center',
      });
    }
    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < 2; c++) {
        const x = xo + c * cs;
        const y = yo + r * cs;
        CU.rect(ctx, x+1, y+1, cs-2, cs-2, fill || '#f0f1f5', '#d1d5db', 1);
        if (mat && mat[r] && mat[r][c] !== undefined) {
          CU.text(ctx, mat[r][c], x + cs/2, y + cs/2, {
            font: `bold ${Math.max(9,cs*0.38)}px monospace`, color: '#1a1a1a',
          });
        }
      }
    }
    CU.strokeRect(ctx, xo, yo, cs*2, cs*2, '#d1d5db', 1);
  }

  function render(canvas, ctx, step) {
    const W = canvas.width, H = canvas.height;
    CU.clear(ctx, canvas, '#f8f9fa');

    const { A, B, Ms, C, currentM, currentC, doneMs, highlightAll } = step;

    const cs     = Math.max(28, Math.min(52, Math.floor((W - 60) / 22)));
    const matW   = cs * 2;
    const PAD    = 20;
    const topY   = 36;
    const midY   = topY + matW + 44;


    const row1Items = [
      { mat: A,    title: 'A',          x: PAD },
      { mat: B,    title: 'B',          x: PAD + matW + 36 },
    ];
    if (C) {
      row1Items.push({ mat: C, title: 'C (Result)', x: PAD + (matW + 36) * 2 });
    }

    row1Items.forEach(({ mat, title, x }) => {
      drawMat2x2(ctx, mat, x, topY, cs, title, '#f0f1f5');
    });

    CU.text(ctx, '×', PAD + matW + 18, topY + matW / 2, {
      font: 'bold 22px sans-serif', color: '#6b7280',
    });
    if (C) {
      CU.text(ctx, '=', PAD + (matW + 36) * 2 - 18, topY + matW / 2, {
        font: 'bold 22px sans-serif', color: '#6b7280',
      });
    }


    if (currentC && C) {
      const cxo = PAD + (matW + 36) * 2;
      const [r, c] = currentC;
      const hx = cxo + c * cs;
      const hy = topY + r * cs;
      CU.rect(ctx, hx+1, hy+1, cs-2, cs-2, '#10b98144', '#10b981', 2);
      CU.text(ctx, C[r][c], hx + cs/2, hy + cs/2, {
        font: `bold ${Math.max(9,cs*0.38)}px monospace`, color: '#10b981',
      });
    }


    const aLabels = [['a','b'],['c','d']];
    const bLabels = [['e','f'],['g','h']];
    [[aLabels, PAD], [bLabels, PAD + matW + 36]].forEach(([labels, xo]) => {
      for (let r = 0; r < 2; r++) {
        for (let c = 0; c < 2; c++) {
          const x = xo + c * cs;
          const y = topY + r * cs;
          CU.text(ctx, labels[r][c], x + cs - 4, y + 10, {
            font: '8px monospace', color: '#6b7280', align: 'right',
          });
        }
      }
    });


    const boxW   = Math.min(cs * 2, Math.floor((W - PAD * 2 - 6 * 8) / 7));
    const boxH   = Math.max(28, Math.min(cs * 2, H - midY - 20));
    const totalMW = boxW * 7 + 8 * 6;
    const mStartX = (W - totalMW) / 2;

    CU.text(ctx, '7 Strassen Products  M₁…M₇', W / 2, midY - 12, {
      font: 'bold 11px sans-serif', color: '#f97316', align: 'center',
    });

    for (let i = 0; i < 7; i++) {
      const mx   = mStartX + i * (boxW + 8);
      const isDone    = doneMs && doneMs[i];
      const isCurrent = currentM === i;
      const col  = MC[i];
      const fill = isDone    ? `${col}44`
                 : isCurrent ? `${col}66`
                 :              '#242736';
      const border = (isDone || isCurrent) ? col : '#44475a';

      CU.roundRect(ctx, mx, midY, boxW, boxH, 4, fill, border, isCurrent ? 2 : 1);

      CU.text(ctx, M_DEFS[i].name, mx + boxW / 2, midY + 14, {
        font: `bold ${Math.min(12, boxW * 0.25)}px monospace`,
        color: (isDone || isCurrent) ? col : '#6272a4',
      });

      if (Ms[i] !== null) {
        CU.text(ctx, '= ' + Ms[i], mx + boxW / 2, midY + boxH / 2 + 4, {
          font: `bold ${Math.min(13, boxW * 0.28)}px monospace`, color: '#f8f8f2',
        });
      } else {
        CU.text(ctx, M_DEFS[i].formula, mx + boxW / 2, midY + boxH * 0.6, {
          font: `${Math.min(9, boxW * 0.18)}px monospace`, color: '#6272a4',
          maxWidth: boxW - 4,
        });
      }
    }


    CU.text(ctx,
      'Strassen: 7 multiplications  vs  8 in standard D&C  →  T(n) = 7T(n/2) + n²  →  O(n^2.807)',
      W / 2, H - 8, {
        font: '10px sans-serif', color: '#6272a4', align: 'center',
      }
    );
  }


  function getInfo() {
    return {
      name: "Strassen's Algorithm",
      description:
        "Strassen's algorithm multiplies two 2×2 matrices using only 7 multiplications instead of 8, by introducing auxiliary matrices M₁…M₇.",
      divide:
        'Divide each n×n matrix into four (n/2)×(n/2) sub-matrices (scalars at the 2×2 base case).',
      conquer:
        'Compute the 7 auxiliary products M₁…M₇ using additions, subtractions, and one multiplication each.',
      combine:
        'Reconstruct the four quadrants of C: C₁₁=M₁+M₄−M₅+M₇, C₁₂=M₃+M₅, C₂₁=M₂+M₄, C₂₂=M₁−M₂+M₃+M₆.',
      recurrence: 'T(n) = 7·T(n/2) + n²',
      complexitySteps: [
        'T(n) = 7T(n/2) + n²',
        'Master Theorem: a=7, b=2, f(n)=n²',
        'log_b(a) = log₂7 ≈ 2.807',
        'f(n) = n² = O(n^(2.807 - ε))  for ε≈0.807',
        'Case 1 of Master Theorem applies.',
      ],
      finalComplexity: 'Θ(n^log₂7) ≈ Θ(n^2.807)',
      complexityNote:
        'Saving one multiplication per level propagates across the recursion tree, shaving ~0.19 from the exponent compared to the standard O(n³).',
      defaultInput:     '2',
      inputPlaceholder: 'Matrix size (2 only)',
    };
  }

  function parseInput()        { return 2; }
  function getDefaultInput()   { return 2; }
  function getRandomInput()    { return 2; }
  function inputToString()     { return '2'; }

  return { getInfo, parseInput, getDefaultInput, getRandomInput, inputToString, generateSteps, render };

})();
