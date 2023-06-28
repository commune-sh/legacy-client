<script>
import { onMount, createEventDispatcher } from 'svelte'
import { close } from '$lib/assets/icons.js'
import { store } from '$lib/store/store.js'
import { discoverSpaces } from '$lib/utils/request.js'
import SkeletonBoardEvents from '$lib/skeleton/skeleton-board-events.svelte'
import SpaceItem from './space-item.svelte'

const dispatch = createEventDispatcher()

let kill =() => {
    $store.discoverSpacesOpen = false;
}

$: active = $store.discoverSpacesOpen

let loaded = false;

$: if(active) {
    getSpaces()
}

let spaces;

async function getSpaces() {
    const res = await discoverSpaces()
    console.log(res)
    if(res?.spaces) {
        spaces = res.spaces
        loaded = true
    }
}

</script>

{#if active}
<div class="mask grd" 
    on:click|self|stopPropagation={kill}>
    <div class="modal grd-c" >
        <div class="space-items">
            <div class="header grd fl">
                <div class="title grd-c ml3 fl-o">
                    Discover Spaces
                </div>
                    <div class="c-ico grd-c ph3" on:click={kill}>
                        {@html close}
                </div>
            </div>

            {#if !loaded}
                <div class="sk ">
                    <SkeletonBoardEvents />
                    <SkeletonBoardEvents />
                </div>
            {/if}

            {#if loaded && spaces}
                <div class="items">
                    {#each spaces as space}
                            <SpaceItem space={space} on:kill={kill}/>
                    {/each}
                </div>
            {/if}

        </div>


    </div>
</div>
{/if}


<style>
.modal {
    height: 650px;
    width: 670px;
    overflow: hidden;
}
.space-items {
    display: grid;
    grid-template-rows: 48px auto;
    display: grid;
    width: 100%;
    overflow: hidden;
}
.items {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-auto-rows: auto;
    overflow-y: auto;
    overflow-x: hidden;
}

.sk {
    display: grid;
    grid-template-columns: auto auto;
}

::-webkit-scrollbar {
    width: 4px;
}
::-webkit-scrollbar-thumb {
    background: transparent;
    transition: 0.1s;
}
::-webkit-scrollbar-track {
    background: transparent;
    transition: 0.1s;
}

.items:hover::-webkit-scrollbar-thumb {
    background: var(--scrollbar-thumb);
}
.items:hover::-webkit-scrollbar-track {
}

@media (max-width: 700px) {
    .modal {
        width: 100%;
        height: 100%;
    }
    .items {
        grid-template-columns: 1fr;
        grid-auto-rows: auto;
    }
}
</style>


