<script>
import { PUBLIC_APP_NAME } from '$env/static/public';
import { onMount, createEventDispatcher } from 'svelte'
import { store } from '$lib/store/store.js'
import { compass } from '$lib/assets/icons.js'
import { goto } from '$app/navigation';
import { page } from '$app/stores';
import tippy from 'tippy.js';

let el;
let content;

let menu;

onMount(() => {
    menu = tippy(el, {
        content: content,
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
    let url = `/discover`
    goto(url, {noscroll: true})
}

let hovered = false;

$: active = $page?.route?.id === `/(app)/discover`

$: if(active) {
    document.title = `Discover Spaces - ${PUBLIC_APP_NAME}`
}


</script>

<div class="" bind:this={content}>
    Discover Spaces
</div>

<div class="i-c grd">
    <div class="item grd-c" 
    class:active={active}
    on:mouseover={() => hovered = true}
    on:mouseleave={() => hovered = false}
    on:click={goToSpace}
    bind:this={el}>
        <div class="create ico grd-c">
            {@html compass}
        </div>
    </div>
</div>

<style>

.i-c {
    margin-bottom: 0.5rem;
    position: relative;
}

.item{
    background-color: var(--switcher-item);
    border-radius: 50%;
    width: 36px;
    height: 36px;
    display: grid;
    cursor: pointer;
}
.item:hover {
    background-color: var(--primary);
}

.active {
    background-color: var(--primary);
}




.th {
    opacity: 1;
}

.ac {
    opacity: 1;
}

.create {
    height: 22px;
    width: 22px;
}
</style>
