<script>
import { onMount, createEventDispatcher } from 'svelte'
import { isInViewport } from '$lib/utils/utils.js'
import { store } from '$lib/store/store.js'
import { goto } from '$app/navigation';
import { page } from '$app/stores';
import tippy from 'tippy.js';

export let container;
export let scrolling;

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
        offset: [0, 26],
        theme: 'inline',
    });
})

$: if(scrolling && menu) {
    menu.hide()
    hovered = false
}

export let space;

$: spacePath = $store?.spacePaths[space?.alias]?.pathname

$: initials = space?.initials?.toUpperCase()

function goToSpace() {
    menu.hide()
    let url = `/${space?.alias}`
    if(spacePath != undefined) {
        url = spacePath
    }
    goto(url, {noscroll: true})
}

let hovered = false;

$: active = $page.params?.space === space?.alias

$: if(active && el) {
    isInViewport(el)
    .then(e => {
        if(!e) {
            el.scrollIntoView()
        }
    });
}

$: size = initials?.length > 2 ? '0.75rem' : initials?.length > 1 ? '0.85rem' : '1rem'

</script>

<div class="" bind:this={content}>
    {space?.name}
</div>

<div class="i-c grd">
    <div class="item grd-c"
    draggable="true"
    class:active={active}
    bind:this={el}
    on:mouseover={() => hovered = true}
    on:mouseleave={() => hovered = false}
    on:click={goToSpace}>
        <div class="initial grd-c" style="font-size:{size};">
            <b>{initials}</b>
        </div>
    </div>
    <div class="tick" class:ac={active}></div>
</div>

<style>

.i-c {
    margin-bottom: 0.75rem;
    position: relative;
}

.item{
    background-color: var(--switcher-item);
    border-radius: 50%;
    width: 36px;
    height: 36px;
    display: grid;
    cursor: pointer;
    border: 2px solid transparent;
}

.initial {
    opacity: 0.8;
    font-size: var(--size);
}

.item:hover {
    border: 2px solid var(--primary);
}

.active {
    border: 2px solid var(--primary);
    background-color: var(--primary);
    color: white;
}


.tick {
    opacity: 0;
    position: absolute;
    top: 10px;
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
    opacity: 0;
}

</style>
