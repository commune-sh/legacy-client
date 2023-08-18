<script>
import { PUBLIC_APP_NAME } from '$env/static/public';
import { onMount, createEventDispatcher } from 'svelte'
import { store } from '$lib/store/store.js'
import { settings } from '$lib/assets/icons.js'
import { goto } from '$app/navigation';
import { page } from '$app/stores';
import tippy from 'tippy.js';

let el;
let content;

let menu;

onMount(() => {
    menu = tippy(el, {
        content: `Settings`,
        placement: 'right',
        arrow: true,
        duration: 1,
        offset: [0, 26],
        theme: 'inline',
    });
})

export let space;

$: spacePath = $store?.spacePaths[space?.alias]?.pathname

$: initial = space?.alias?.charAt(0)?.toUpperCase()

function goToSpace() {
    let url = `/settings`
    return
    goto(url, {noscroll: true})
}

let hovered = false;

$: active = $page?.route?.id === `/(app)/settings`

$: if(active) {
    document.title = `Settings - ${PUBLIC_APP_NAME}`
}

</script>

<div class="i-c grd">
    <div class="item grd-c" 
    on:mouseover={() => hovered = true}
    on:mouseleave={() => hovered = false}
    on:click={goToSpace}
    bind:this={el}>
        <div class="create ico grd-c" class:ac={active}>
            {@html settings}
        </div>
    </div>
    <div class="tick" class:th={hovered} class:ac={active}></div>
</div>

<style>

.i-c {
    margin-bottom: 0.5rem;
    position: relative;
}

.item{
    border-radius: 50%;
    width: 36px;
    height: 36px;
    display: grid;
    cursor: pointer;
    transition: 0.1s;
}


.tick {
    opacity: 0;
    transition: 0.1s;
    position: absolute;
    top: 12px;
    left: 0px;
    height: 15px;
    width: 4px;
    border-radius: 0 5px 5px 0;
    background-color: var(--switcher-pill);
}
.th {
    opacity: 1;
}

.ac {
    opacity: 1;
}

.create {
    height: 20px;
    width: 20px;
    fill: var(--action-icon);
}
</style>
