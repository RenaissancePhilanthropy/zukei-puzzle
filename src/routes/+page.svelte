<script lang="ts">
    import PuzzleGrid from '$lib/components/PuzzleGrid.svelte';
    import { PUZZLE_CONFIG } from '$lib/constants/puzzleConfig';
    import type { ShapeType } from '$lib/shapes';

    let puzzleGridRef: PuzzleGrid;
    let generatedShapeType: ShapeType | null = null;
</script>

<div class="page-container">
    <h1>Puzzle Grid Demo</h1>
    <p>This page demonstrates the PuzzleGrid component.</p>
    <PuzzleGrid rows={PUZZLE_CONFIG.defaultGridSize.rows} columns={PUZZLE_CONFIG.defaultGridSize.columns} bind:generatedShapeType={generatedShapeType} bind:this={puzzleGridRef}></PuzzleGrid>

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