

'use strict';

const Animator = (() => {


  let _canvas      = null;
  let _ctx         = null;
  let _steps       = [];
  let _renderFn    = null;
  let _current     = 0;
  let _playing     = false;
  let _timer       = null;
  let _speed       = 5;
  let _resizeOb    = null;


  function _delay() {

    return Math.round(140 + (5 - _speed) * 500);
  }

  function _syncSize() {
    if (!_canvas) return;
    const w = _canvas.offsetWidth;
    const h = _canvas.offsetHeight;
    if (w > 0 && h > 0 && (_canvas.width !== w || _canvas.height !== h)) {
      _canvas.width  = w;
      _canvas.height = h;
      _drawCurrent();
    }
  }

  function _drawCurrent() {
    if (!_canvas || !_ctx || _steps.length === 0) return;
    if (_current < 0 || _current >= _steps.length) return;
    CU.clear(_ctx, _canvas);
    _renderFn(_canvas, _ctx, _steps[_current]);
  }


  function _updateUI() {
    const step   = _steps[_current];
    const total  = _steps.length;

    const elCount  = document.getElementById('step-counter');
    const elBadge  = document.getElementById('phase-badge');
    const elDesc   = document.getElementById('step-desc');
    const elStart  = document.getElementById('btn-start');
    const elPause  = document.getElementById('btn-pause');

    if (elCount)  elCount.textContent = `Step: ${_current + 1} / ${total}`;

    if (step) {
      if (elBadge) {
        const phase = step.phase || 'divide';
        elBadge.textContent = phase.charAt(0).toUpperCase() + phase.slice(1);
        elBadge.className   = `badge phase-${phase}`;
      }
      if (elDesc) elDesc.innerHTML = step.description || '';
    }

    if (elStart) elStart.disabled = _playing;
    if (elPause) elPause.disabled = !_playing;
  }


  function _schedule() {
    if (!_playing) return;
    _timer = setTimeout(() => {
      if (!_playing) return;
      if (_current >= _steps.length - 1) {
        _current = _steps.length - 1;
        _playing = false;
        _updateUI();
        return;
      }
      _current++;
      _drawCurrent();
      _updateUI();
      _schedule();
    }, _delay());
  }


  return {

    get speed()       { return _speed; },
    set speed(v)      { _speed = Math.max(1, Math.min(5, v)); },
    get currentStep() { return _current; },
    get totalSteps()  { return _steps.length; },

    init(canvas) {
      _canvas = canvas;
      _ctx    = canvas.getContext('2d');


      if (typeof ResizeObserver !== 'undefined') {
        _resizeOb = new ResizeObserver(_syncSize);
        _resizeOb.observe(_canvas);
      } else {
        window.addEventListener('resize', _syncSize);
      }
      _syncSize();
    },

    load(steps, renderFn) {
      if (_timer) { clearTimeout(_timer); _timer = null; }
      _steps   = steps  || [];
      _renderFn = renderFn;
      _current  = 0;
      _playing  = false;
      _syncSize();
      _drawCurrent();
      _updateUI();
    },

    play() {
      if (_playing)                  return;
      if (_steps.length === 0)       return;
      if (_current >= _steps.length - 1) _current = 0;
      _playing = true;
      _updateUI();
      _schedule();
    },

    pause() {
      _playing = false;
      if (_timer) { clearTimeout(_timer); _timer = null; }
      _updateUI();
    },

    reset() {
      this.pause();
      _current = 0;
      _drawCurrent();
      _updateUI();
    },

    stepForward() {
      if (_current < _steps.length - 1) {
        _current++;
        _drawCurrent();
        _updateUI();
      }
    },

    stepBackward() {
      if (_current > 0) {
        _current--;
        _drawCurrent();
        _updateUI();
      }
    },

  };

})();
