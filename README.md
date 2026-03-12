# Nithish Visualizer

An interactive educational web application that teaches **Divide and Conquer algorithms** through animated, step-by-step visualizations with time complexity analysis.

##   Live  Demo

** [ Click here to view the live application](https://nithishkumar0283.github.io/Algo_visualization/)**

Or open `index.html` directly in any modern browser, no server, build tools, or dependencies required.

---

## Algorithms Implemented

| # | Algorithm | Complexity | Input Type |
|---|-----------|------------|------------|
| 1 | **Merge Sort** | Θ(n log n) | Array of integers |
| 2 | **Quick Sort** (Lomuto partition) | Avg Θ(n log n) | Array of integers |
| 3 | **Matrix Multiplication** (D&C) | Θ(n³) | Matrix size N |
| 4 | **Strassen's Algorithm** | Θ(n^2.807) | 2×2 matrices |
| 5 | **Min & Max Finding** | Θ(n) | Array of integers |
| 6 | **Largest Subarray Sum** (D&C) | Θ(n log n) | Array w/ negatives |
| 7 | **Closest Pair of Points** | Θ(n log n) | Random 2-D points |
| 8 | **Convex Hull** (Monotone Chain) | Θ(n log n) | Random 2-D points |

---

## Project Structure

```
project/
│
├── index.html                  ← Main HTML page
├── styles.css                  ← Dark-themed responsive CSS
├── script.js                   ← App controller & algorithm registry
│
├── visualization/
│   ├── canvasUtils.js          ← Low-level Canvas 2D drawing helpers
│   └── animation.js            ← Step-based animation controller (Animator)
│
├── algorithms/
│   ├── mergesort.js            ← Merge Sort module
│   ├── quicksort.js            ← Quick Sort module
│   ├── matrixMultiply.js       ← D&C Matrix Multiplication module
│   ├── strassen.js             ← Strassen's Algorithm module
│   ├── minmax.js               ← Min & Max Finding module
│   ├── largestSubarray.js      ← Largest Subarray Sum module
│   ├── closestPair.js          ← Closest Pair of Points module
│   └── convexHull.js           ← Convex Hull module
│
└── README.md                   ← This file
```

---

## How to Run

1. Clone or download the project folder.
2. Open `index.html` in a modern browser (Chrome, Firefox, Edge, Safari).
3. No internet connection required, zero external dependencies.

---

## UI Layout

```
┌─────────────────────────────────────────────────────────────┐
│  ⟨D&C⟩  Header   [▶ Start] [⏸ Pause] [⏭ Step] [↺ Reset] …  │
├────────────┬──────────────────────────────┬─────────────────┤
│  Sidebar   │   Visualization Canvas       │  Info Panel     │
│            │   ┌──────────────────────┐   │  • Description  │
│ Algorithm  │   │  Animated Canvas     │   │  • Divide step  │
│ list with  │   │                      │   │  • Conquer step │
│ complexity │   └──────────────────────┘   │  • Combine step │
│ badges     │   Step description bar       │  • Recurrence   │
│            ├──────────────────────────────│  • Complexity   │
│            │  [Input field]  [Apply]      │  • Result       │
└────────────┴──────────────────────────────┴─────────────────┘
```

---

## Visualization Approach

Each algorithm module exposes a consistent interface:

```javascript
window.AlgoXxx = {
  getInfo()              // Returns { name, description, divide, conquer,
                         //   combine, recurrence, complexitySteps, ... }
  parseInput(str)        // Parses the text-field input string
  getDefaultInput()      // Returns default parsed input
  getRandomInput()       // Generates random input
  inputToString(input)   // Converts parsed input → display string
  generateSteps(input)   // Returns array of step objects
  render(canvas, ctx, step) // Draws one step on the canvas
};
```

### Step Objects

Each step is a plain object containing all data needed to draw that frame:

```javascript
// Sorting step example
{ phase: 'divide' | 'combine' | 'done',
  description: 'HTML string',
  array: [...],
  highlights: { [index]: 'compare' | 'sorted' | ... },
  activeRange: { lo, hi },
  ...algorithm-specific fields }
```

### Animations

- `Animator.load(steps, renderFn)` registers steps and the render function.
- `Animator.play()` advances one step per `delay` ms, where `delay` is controlled by the speed slider (80 ms – 1800 ms).
- A `ResizeObserver` keeps the canvas pixel dimensions in sync with CSS layout.
- All drawing uses the native **Canvas 2D API**, no external libraries.

---

## Time Complexity Derivations

| Algorithm | Recurrence / Cost | Final Complexity | Why |
|-----------|-------------------|------------------|-----|
| Merge Sort | `T(n) = 2T(n/2) + n` | **Θ(n log n)** | Each recursion level does `O(n)` merge work across `log₂n` levels. |
| Quick Sort | `T(n) = T(k) + T(n-k-1) + n` | **Avg Θ(n log n), Worst Θ(n²)** | Balanced partitions behave like merge sort; highly unbalanced partitions degrade to quadratic time. |
| Matrix Multiply (D&C) | `T(n) = 8T(n/2) + n²` | **Θ(n³)** | There are 8 subproblems of size `n/2`; Master Theorem gives exponent `log₂8 = 3`. |
| Strassen's | `T(n) = 7T(n/2) + n²` | **Θ(n^log₂7 ≈ n^2.807)** | Reducing 8 recursive multiplications to 7 lowers the exponent. |
| Min & Max | `3n/2` comparisons | **Θ(n)** | Pairwise comparison reduces total comparisons to `⌈3n/2⌉ − 2`. |
| Largest Subarray Sum | `T(n) = 2T(n/2) + n` | **Θ(n log n)** | The crossing-sum step is linear at each level; Master Theorem case 2 applies. |
| Closest Pair | `T(n) = 2T(n/2) + O(n)` | **Θ(n log n)** | The strip scan stays linear because each point checks only a constant number of neighbors. |
| Convex Hull | `Sort + T(n) = 2T(n/2) + O(n)` | **Θ(n log n)** | The initial sort dominates; hull merging is linear per level. |

---

## Demo Videos

| Algorithm | Video Demo |
|-----------|-----------|
| Merge Sort | [Watch Video](https://github.com/NITHISHKUMAR0283/Algo_visualization/raw/main/screenshots/mergesort.mp4) |
| Quick Sort | [Watch Video](https://github.com/NITHISHKUMAR0283/Algo_visualization/raw/main/screenshots/qucik_sort.mp4) |
| Closest Pair of Points | [Watch Video](https://github.com/NITHISHKUMAR0283/Algo_visualization/raw/main/screenshots/closestpair.mp4) |
| Convex Hull | [Watch Video](https://github.com/NITHISHKUMAR0283/Algo_visualization/raw/main/screenshots/convexhull.mp4) |

---

## Features

- **Step-by-step mode** – Click ⏭ Step to advance one frame at a time.
- **Speed control** – Slider from 1× (slow) to 10× (fast).
- **Random input** – Generate a fresh random input for any algorithm.
- **Custom input** – Type your own values into the input field and click Apply.
- **Responsive layout** – Info panel hides on narrow screens; sidebar hides on mobile.
- **Dark theme** – Dracula-inspired palette optimised for readability.

---

## Browser Compatibility

| Browser | Status |
|---------|--------|
| Chrome 90+ |  Full support |
| Firefox 88+ |  Full support |
| Edge 90+ |  Full support |
| Safari 14+ |  Full support |

---
