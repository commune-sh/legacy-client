<script>
import { store } from '$lib/store/store.js'
import UserSpace from './user-space.svelte'
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

$: authenticated = $store?.authenticated && 
    $store?.credentials != null
    $store?.credentials?.access_token?.length > 0

</script>

<div class="switcher-items" 
    on:scroll={scroll}
    bind:this={container}>

    {#if authenticated}

        <UserSpace />
    {/if}

    {#if spaces?.length > 0}
        {#each spaces as space}
            <SpaceItem scrolling={scrolling} space={space} container={container}/>
        {/each}
    {/if}
    <div class="tf"></div>
</div>

<style>
.switcher-items {
    padding-top: 0.75rem;
    padding-bottom: 0.75rem;
    overflow-y: auto;
    overflow-x: hidden;
    height: calc(100% - 0.75rem);
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
}
</style>
