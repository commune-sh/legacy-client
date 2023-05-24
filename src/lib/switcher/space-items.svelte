<script>
import SpaceItem from './space-item.svelte'
export let spaces;
</script>

<div class="switcher-items">
    <div class="sep"></div>
{#each spaces as space}
    <SpaceItem space={space} />
{/each}
</div>

<style>
.switcher-items {
}
.sep {
    margin-bottom: 0.5rem;
}
</style>
