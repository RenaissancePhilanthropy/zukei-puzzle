<script lang="ts">
    import PuzzleGrid from '$lib/components/PuzzleGrid.svelte';
    import { PUZZLE_CONFIG } from '$lib/constants/puzzleConfig';
    import type { ShapeType } from '$lib/shapes';

    let puzzleGridRef: PuzzleGrid;
    let generatedShapeType: ShapeType | null = null;
</script>

<div class="page-container">
    <div class="instructions" style="margin-bottom: 10px;">
        <strong>Instructions:</strong> A Zukei puzzle is a Japanese logic puzzle in which a grid is presented with a number of points shown at different intersections. Each grid is presented along with the name of a geometric figure. The goal of the puzzle is to determine which points on the grid are the vertices of the named geometric figure. Identify and connect the vertices that form the given shape, then check your solution using the button below.
    </div>

    <div class="puzzle-grid-container" style="border: 1px solid #ccc; padding: 10px; max-width: 500px; margin: 0 auto;">
        <PuzzleGrid rows={PUZZLE_CONFIG.defaultGridSize.rows} columns={PUZZLE_CONFIG.defaultGridSize.columns} bind:generatedShapeType={generatedShapeType} bind:this={puzzleGridRef}></PuzzleGrid>
    </div>

    {#if generatedShapeType}
        <div class="generated-shape-info" aria-live="polite" style="margin-top: 10px; font-size: 0.9rem; color: #555;">
            Generated Shape: {generatedShapeType}
        </div>
    {/if}

    <div class="button-container" style="margin-top: 20px; display: flex; gap: 1rem; justify-content: center;">
        <button on:click={() => puzzleGridRef?.check()}
            style="padding: 0.5rem 1rem; font-size: 1rem;">
            Check Puzzle
        </button>

        <button on:click={() => puzzleGridRef?.showWhatHint()}
            style="padding: 0.5rem 1rem; font-size: 1rem; background-color: #17a2b8; color: white; border: none; border-radius: 4px; cursor: pointer;">
            Get Hint
        </button>

        <button on:click={() => puzzleGridRef?.clear()}
            style="padding: 0.5rem 1rem; font-size: 1rem; background-color: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;">
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
</style>