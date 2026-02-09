<script lang="ts">
  import type { HintData } from "$lib/hints/types";
  import type { GridPoint, Line } from "$lib/types";
  import { HINT_THEME } from "$lib/constants/hintTheme";
  import HintVisualization from "./HintVisualization.svelte";
  import { onMount } from "svelte";

  type Props = {
    hintData: HintData;
    getPointCoordinates: (point: GridPoint) => { x: number; y: number } | null;
    onClose: () => void;
    onNewPuzzle?: () => void;
    userLines?: Line[];
    gridDimensions?: { width: number; height: number };
  };

  let { hintData, getPointCoordinates, onClose, onNewPuzzle, userLines = [], gridDimensions }: Props = $props();

  let modalElement: HTMLDivElement;

  // For "what" hints (examples), use a virtual coordinate system
  // For "why" hints (user's shape), use the actual grid coordinates
  const isExampleHint = $derived(hintData.type === 'what' && hintData.lineHighlights.length > 0);

  // Check if this is a success hint (title starts with "Correct!")
  const isSuccessHint = $derived(hintData.title.startsWith('Correct!'));

  // Virtual coordinate mapping for example shapes (scales grid points to pixel coordinates)
  function getVirtualCoordinates(point: GridPoint): { x: number; y: number } | null {
    const cellSize = 40; // pixels per grid unit
    return {
      x: point.column * cellSize,
      y: point.row * cellSize
    };
  }

  // Choose coordinate function based on hint type
  const coordinateFunction = $derived(isExampleHint ? getVirtualCoordinates : getPointCoordinates);

  // Calculate viewBox based on all points in the visualization
  const viewBox = $derived.by(() => {
    if (gridDimensions) {
      return `0 0 ${gridDimensions.width} ${gridDimensions.height}`;
    }

    // Calculate bounds from all points
    const allPoints: GridPoint[] = [];

    // Add points from line highlights
    hintData.lineHighlights.forEach(line => {
      allPoints.push(line.from, line.to);
    });

    // Add points from point highlights
    hintData.pointHighlights?.forEach(p => {
      allPoints.push(p.point);
    });

    // Add points from user lines
    userLines.forEach(line => {
      allPoints.push(line.from, line.to);
    });

    if (allPoints.length === 0) {
      return "0 0 400 400";
    }

    // Get coordinates for all points using the appropriate coordinate function
    const coords = allPoints
      .map(p => coordinateFunction(p))
      .filter(c => c !== null);

    if (coords.length === 0) {
      return "0 0 400 400";
    }

    // Find bounds
    const xs = coords.map(c => c.x);
    const ys = coords.map(c => c.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    // Add padding
    const padding = 50;
    const width = maxX - minX + padding * 2;
    const height = maxY - minY + padding * 2;
    const x = minX - padding;
    const y = minY - padding;

    return `${x} ${y} ${width} ${height}`;
  });

  // Handle escape key to close modal
  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      onClose();
    }
  }

  // Handle backdrop click
  function handleBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }

  // Focus trap - focus the modal when it mounts
  onMount(() => {
    modalElement?.focus();
  });
</script>

<svelte:window onkeydown={handleKeyDown} />

<div
  class="modal-backdrop"
  onclick={handleBackdropClick}
  role="presentation"
>
  <div
    bind:this={modalElement}
    class="modal-content"
    role="dialog"
    aria-labelledby="hint-title"
    aria-describedby="hint-message"
    tabindex="-1"
  >
    <!-- Header -->
    <div class="modal-header">
      <h2 id="hint-title" class="modal-title">{hintData.title}</h2>
      <button
        class="close-button"
        onclick={onClose}
        aria-label="Close hint modal"
      >
        ×
      </button>
    </div>

    <!-- Visualization Section -->
    <div class="modal-visualization">
      {#if hintData.imageUrl}
        <img src={hintData.imageUrl} alt={hintData.title} class="hint-image" />
      {:else}
        <HintVisualization
          lineHighlights={hintData.lineHighlights}
          pointHighlights={hintData.pointHighlights}
          angleHighlights={hintData.angleHighlights}
          getPointCoordinates={coordinateFunction}
          userLines={isExampleHint ? [] : userLines}
          viewBox={viewBox}
        />
      {/if}
    </div>

    <!-- Message Section -->
    <div class="modal-body">

      <p id="hint-message" class="hint-message">{hintData.message}</p>

      {#if hintData.detailedExplanation}
        <div class="hint-type-badge" class:why={hintData.type === 'why'} class:what={hintData.type === 'what'}>
          {hintData.type === 'why' ? 'WHY THIS IS WRONG' : 'WHAT TO LOOK FOR'}
        </div>

        <p class="hint-explanation">{hintData.detailedExplanation}</p>
      {/if}
    </div>

    <!-- Footer -->
    <div class="modal-footer">
      {#if isSuccessHint && onNewPuzzle}
        <button class="new-puzzle-button" onclick={onNewPuzzle}>New Puzzle</button>
      {/if}
      <button class="close-button-large" onclick={onClose}>Close</button>
    </div>
  </div>
</div>

<style>
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    animation: fadeIn 0.2s ease-out;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .modal-content {
    background: #ffffff;
    border-radius: 8px;
    max-width: 600px;
    max-height: 80vh;
    width: 90%;
    display: flex;
    flex-direction: column;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    animation: slideIn 0.2s ease-out;
    overflow: hidden;
  }

  @keyframes slideIn {
    from {
      transform: translateY(-20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 1px solid #dee2e6;
  }

  .modal-title {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 600;
    color: #212529;
  }

  .close-button {
    background: none;
    border: none;
    font-size: 2rem;
    line-height: 1;
    cursor: pointer;
    color: #6c757d;
    padding: 0;
    width: 2rem;
    height: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    transition: all 0.2s;
  }

  .close-button:hover {
    background: #f8f9fa;
    color: #212529;
  }

  .modal-visualization {
    width: 100%;
    height: 300px;
    background: #f8f9fa;
    border-bottom: 1px solid #dee2e6;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .hint-image {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }

  .modal-body {
    padding: 1.5rem;
    overflow-y: auto;
    flex: 1;
  }

  .hint-type-badge {
    display: inline-block;
    padding: 0.375rem 0.75rem;
    font-size: 0.75rem;
    font-weight: 700;
    border-radius: 4px;
    margin-bottom: 1rem;
    letter-spacing: 0.5px;
  }

  .hint-type-badge.why {
    background: #dc3545;
    color: white;
  }

  .hint-type-badge.what {
    background: #17a2b8;
    color: white;
  }

  .hint-message {
    font-size: 1.125rem;
    line-height: 1.6;
    color: #212529;
    margin: 0 0 1rem 0;
  }

  .hint-explanation {
    font-size: 0.9375rem;
    line-height: 1.6;
    color: #6c757d;
    margin: 0;
    font-style: italic;
  }

  .modal-footer {
    padding: 1rem 1.5rem;
    border-top: 1px solid #dee2e6;
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
  }

  .close-button-large {
    padding: 0.625rem 1.5rem;
    font-size: 1rem;
    font-weight: 600;
    background: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background 0.2s;
  }

  .close-button-large:hover {
    background: #0056b3;
  }

  .close-button-large:active {
    background: #004085;
  }

  .new-puzzle-button {
    padding: 0.625rem 1.5rem;
    font-size: 1rem;
    font-weight: 600;
    background: #28a745;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background 0.2s;
  }

  .new-puzzle-button:hover {
    background: #218838;
  }

  .new-puzzle-button:active {
    background: #1e7e34;
  }
</style>
