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

    <button on:click={() => {
                if(puzzleGridRef?.check()) {
                    alert('Puzzle is correct!');
                } else {
                    alert('Puzzle is incorrect. Try again.');
                }
            } 
        }
        style="margin-top: 20px; padding: 0.5rem 1rem; font-size: 1rem;">
        Check Puzzle 
    </button>
</div>

<style> 
.page-container {
    padding: 1rem;
    max-width: 800px;
    margin: 0 auto;
}
</style>