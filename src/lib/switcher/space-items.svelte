<script>
import SpaceItem from './space-item.svelte'
export let spaces;

let container;
let scrolling = false;

function scroll() {
    scrolling = true;
    setTimeout(() => {
        scrolling = false;
    }, 200)
}

</script>

<div class="switcher-items" 
    on:scroll={scroll}
    bind:this={container}>
    {#if spaces?.length > 0}
        {#each spaces as space}
            <SpaceItem scrolling={scrolling} space={space} container={container}/>
        {/each}
    {/if}
</div>

<style>
.switcher-items {
    overflow-y: auto;
    overflow-x: hidden;
}
::-webkit-scrollbar {
    width: 2px;
}
::-webkit-scrollbar-thumb {
    background: transparent;
    transition: 0.1s;
}
::-webkit-scrollbar-track {
    background: transparent;
    transition: 0.1s;
}

.switcher-items:hover::-webkit-scrollbar-thumb {
    background: var(--scrollbar-thumb);
}
.switcher-items:hover::-webkit-scrollbar-track {
    background: var(--scrollbar-track);
}
</style>
