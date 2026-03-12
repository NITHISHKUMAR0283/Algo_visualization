

'use strict';


const AlgorithmRegistry = {
  mergesort:       () => window.AlgoMergeSort,
  quicksort:       () => window.AlgoQuickSort,
  matrixMultiply:  () => window.AlgoMatrixMultiply,
  strassen:        () => window.AlgoStrassen,
  minmax:          () => window.AlgoMinMax,
  largestSubarray: () => window.AlgoLargestSubarray,
  closestPair:     () => window.AlgoClosestPair,
  convexHull:      () => window.AlgoConvexHull,
};

let currentAlgoId = 'mergesort';
let currentModule  = null;


function loadAlgorithm(algoId) {

  Animator.pause();

  const getter = AlgorithmRegistry[algoId];
  if (!getter) { console.error('Unknown algorithm:', algoId); return; }

  currentModule = getter();
  if (!currentModule) { console.error('Module not available:', algoId); return; }

  currentAlgoId = algoId;


  document.querySelectorAll('.algo-item').forEach(el =>
    el.classList.toggle('active', el.dataset.algo === algoId)
  );


  const info = currentModule.getInfo();
  document.getElementById('algo-title').textContent = info.name;


  populateInfoPanel(info);


  const inputEl = document.getElementById('input-data');
  inputEl.value       = info.defaultInput   || '';
  inputEl.placeholder = info.inputPlaceholder || 'Enter input…';


  generateAndLoad();
}


function generateAndLoad() {
  if (!currentModule) return;

  const rawInput = document.getElementById('input-data').value;
  let parsed;
  try {
    parsed = currentModule.parseInput(rawInput);
  } catch (_) {
    parsed = currentModule.getDefaultInput();
  }

  const steps = currentModule.generateSteps(parsed);
  Animator.load(steps, (canvas, ctx, step) => currentModule.render(canvas, ctx, step));
}


function populateInfoPanel(info) {
  setText('info-name',             info.name            || '');
  setText('info-desc',             info.description     || '');
  setText('info-divide',           info.divide          || '');
  setText('info-conquer',          info.conquer         || '');
  setText('info-combine',          info.combine         || '');
  setText('info-recurrence',       info.recurrence      || '');
  setText('info-final-complexity', info.finalComplexity || '');
  setText('info-complexity-note',  info.complexityNote  || '');

  const stepsEl = document.getElementById('info-complexity-steps');
  stepsEl.innerHTML = (info.complexitySteps || [])
    .map(s => `<div>${s}</div>`).join('');
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}


document.addEventListener('DOMContentLoaded', () => {


  const canvas = document.getElementById('viz-canvas');
  Animator.init(canvas);


  document.getElementById('algo-list').addEventListener('click', e => {
    const item = e.target.closest('.algo-item');
    if (item && item.dataset.algo) loadAlgorithm(item.dataset.algo);
  });


  document.getElementById('btn-start').addEventListener('click',  () => Animator.play());
  document.getElementById('btn-pause').addEventListener('click',  () => Animator.pause());
  document.getElementById('btn-prev') .addEventListener('click',  () => Animator.stepBackward());
  document.getElementById('btn-step') .addEventListener('click',  () => Animator.stepForward());
  document.getElementById('btn-reset').addEventListener('click',  () => {
    Animator.reset();
    generateAndLoad();
  });

  document.getElementById('btn-apply') .addEventListener('click', generateAndLoad);
  document.getElementById('btn-random').addEventListener('click', () => {
    if (!currentModule) return;
    const rnd = currentModule.getRandomInput();
    document.getElementById('input-data').value = currentModule.inputToString(rnd);
    generateAndLoad();
  });


  const speedSlider = document.getElementById('speed-slider');
  const speedLabel  = document.getElementById('speed-label');
  Animator.speed = parseInt(speedSlider.value, 10);
  speedLabel.textContent = speedSlider.value + '×';
  speedSlider.addEventListener('input', () => {
    Animator.speed = parseInt(speedSlider.value, 10);
    speedLabel.textContent = speedSlider.value + '×';
  });


  loadAlgorithm('mergesort');
});
