<script lang="ts">
    import PuzzleGrid from '$lib/components/PuzzleGrid.svelte';
</script>

<div class="page-container">
    <h1>Puzzle Grid Demo</h1>
    <p>This page demonstrates the PuzzleGrid component.</p>
    <PuzzleGrid rows={4} columns={4}></PuzzleGrid>
</div>

<style> 
.page-container {
    padding: 1rem;
    max-width: 800px;
    margin: 0 auto;
}
</style>