<script>
import { onMount, createEventDispatcher } from 'svelte'
import { store } from '$lib/store/store.js'
import { goto } from '$app/navigation';
import { page } from '$app/stores';
import tippy from 'tippy.js';

let el;
let content;

let menu;

onMount(() => {
    menu = tippy(el, {
        content: content,
        theme: 'light-border',
        placement: 'right',
        arrow: true,
        duration: 1,
        offset: [0, 26]
    });
})

export let space;

$: spacePath = $store?.spacePaths[space?.alias]?.pathname

$: initial = space?.alias?.charAt(0)?.toUpperCase()

function goToSpace() {
    let url = `/${space?.alias}`
    if(spacePath != undefined) {
        url = spacePath
    }
    goto(url, {noscroll: true})
}

let hovered = false;

$: active = $page.params?.space === space?.alias

</script>

<div class="" bind:this={content}>
    {space?.name}
</div>

<div class="i-c grd">
    <div class="item grd-c"
    bind:this={el}
    on:mouseover={() => hovered = true}
    on:mouseleave={() => hovered = false}
    on:click={goToSpace}>
        <div class="initial grd-c">
            <b>{initial}</b>
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
    background-color: var(--switcher-item);
    border-radius: 50%;
    width: 42px;
    height: 42px;
    display: grid;
    cursor: pointer;
    transition: 0.1s;
}

.initial {
    opacity: 0.8;
    font-size: 0.9rem;
}

.item:hover {
    border-radius: 15px;
    background-color: var(--primary);
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

</style>
