<script lang="ts">
    import PuzzleGrid from '$lib/components/PuzzleGrid.svelte';
    import { PUZZLE_CONFIG } from '$lib/constants/puzzleConfig';
    import type { ShapeType } from '$lib/shapes';

    let puzzleGridRef: PuzzleGrid;
    let generatedShapeType = $state<ShapeType | null>(null);
</script>

<div class="page-container">
    <div class="instructions" style="margin-bottom: 10px;">
        <strong>Instructions:</strong> A Zukei puzzle is a Japanese logic puzzle in which a grid is presented with a number of points shown at different intersections. Each grid is presented along with the name of a geometric figure. The goal of the puzzle is to determine which points on the grid are the vertices of the named geometric figure. Identify and connect the vertices that form the given shape, then check your solution using the button below.
    </div>

    {#if generatedShapeType}
        <div class="generated-shape-info" aria-live="polite" style="margin-top: 10px; font-size: 1.1rem; color: #555;">
            Try to find a <span class="text-black">{generatedShapeType}</span>
        </div>
    {/if}

    <div class="puzzle-grid-container" style="border: 1px solid #ccc; padding: 10px; max-width: 500px; margin: 0 auto;">
        <PuzzleGrid rows={PUZZLE_CONFIG.defaultGridSize.rows} columns={PUZZLE_CONFIG.defaultGridSize.columns} bind:generatedShapeType={generatedShapeType} bind:this={puzzleGridRef}></PuzzleGrid>
    </div>

    <div class="button-container" style="margin-top: 20px; display: flex; gap: 1rem; justify-content: center;">
        <button onclick={() => puzzleGridRef?.check()}
            class="check-button"
            style="padding: 0.5rem 1.5rem; font-size: 1rem; background-color: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 600; transition: background-color 0.2s ease;">
            Check Puzzle
        </button>

        <button onclick={() => puzzleGridRef?.showWhatHint()}
            style="padding: 0.5rem 1rem; font-size: 1rem; background-color: #17a2b8; color: white; border: none; border-radius: 4px; cursor: pointer; transition: background-color 0.2s ease;">
            Get Hint
        </button>

        <button onclick={() => puzzleGridRef?.clear()}
            style="padding: 0.5rem 1rem; font-size: 1rem; background-color: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer; transition: background-color 0.2s ease;">
            Clear
        </button>
    </div>
</div>

<style>
.page-container {
    padding: 1rem;
    max-width: 800px;
    margin: 0 auto;
}

.check-button:hover {
    background-color: #218838 !important;
}

.check-button:active {
    background-color: #1e7e34 !important;
    transform: scale(0.98);
}
</style>