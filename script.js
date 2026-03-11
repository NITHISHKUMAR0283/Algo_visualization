/**
 * script.js  – Main Application Controller
 *
 * Registers all algorithm modules, wires up UI events, and delegates
 * step generation + rendering to the selected algorithm module.
 *
 * Each algorithm module exposes:
 *   getInfo()          → { name, description, divide, conquer, combine,
 *                          recurrence, complexitySteps[], finalComplexity,
 *                          complexityNote, defaultInput, inputPlaceholder }
 *   parseInput(str)    → parsed input (array, matrix, number, …)
 *   getDefaultInput()  → default parsed input
 *   getRandomInput()   → random parsed input
 *   inputToString(v)   → string representation for the input field
 *   generateSteps(input) → steps[]
 *   render(canvas, ctx, step) → void
 */

'use strict';

/* ── Algorithm registry ─────────────────────────────────────────────── */
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

/* ── Load & display an algorithm ────────────────────────────────────── */
function loadAlgorithm(algoId) {
  // Pause any running animation
  Animator.pause();

  const getter = AlgorithmRegistry[algoId];
  if (!getter) { console.error('Unknown algorithm:', algoId); return; }

  currentModule = getter();
  if (!currentModule) { console.error('Module not available:', algoId); return; }

  currentAlgoId = algoId;

  // Sidebar active state
  document.querySelectorAll('.algo-item').forEach(el =>
    el.classList.toggle('active', el.dataset.algo === algoId)
  );

  // Update title
  const info = currentModule.getInfo();
  document.getElementById('algo-title').textContent = info.name;

  // Update right panel
  populateInfoPanel(info);

  // Seed the input field
  const inputEl = document.getElementById('input-data');
  inputEl.value       = info.defaultInput   || '';
  inputEl.placeholder = info.inputPlaceholder || 'Enter input…';

  // Generate steps with default input
  generateAndLoad();
}

/* ── Generate steps from current input & hand off to Animator ───────── */
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

/* ── Populate right-side info panel ─────────────────────────────────── */
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

/* ── DOM ready ───────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {

  /* Initialise canvas animator */
  const canvas = document.getElementById('viz-canvas');
  Animator.init(canvas);

  /* Sidebar clicks */
  document.getElementById('algo-list').addEventListener('click', e => {
    const item = e.target.closest('.algo-item');
    if (item && item.dataset.algo) loadAlgorithm(item.dataset.algo);
  });

  /* Control buttons */
  document.getElementById('btn-start').addEventListener('click',  () => Animator.play());
  document.getElementById('btn-pause').addEventListener('click',  () => Animator.pause());
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

  /* Speed slider */
  const speedSlider = document.getElementById('speed-slider');
  const speedLabel  = document.getElementById('speed-label');
  speedSlider.addEventListener('input', () => {
    Animator.speed = parseInt(speedSlider.value, 10);
    speedLabel.textContent = speedSlider.value + '×';
  });

  /* Load the default algorithm */
  loadAlgorithm('mergesort');
});
