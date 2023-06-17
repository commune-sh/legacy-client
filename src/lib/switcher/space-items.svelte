<script>
import SpaceItem from './space-item.svelte'
export let spaces;

let container;
</script>

<div class="switcher-items" bind:this={container}>
    {#if spaces?.length > 0}
        {#each spaces as space}
            <SpaceItem space={space} container={container}/>
        {/each}
    {/if}
</div>

<style>
.switcher-items {
    overflow-y: auto;
    overflow-x: hidden;
}
::-webkit-scrollbar {
    width: 0px;
}
::-webkit-scrollbar-thumb {
    background: var(--scrollbar-thumb);
}
::-webkit-scrollbar-track {
    background: var(--scrollbar-track);
}
</style>
