<script>
import { PUBLIC_MEDIA_URL } from '$env/static/public';
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

function log() {
    console.log(space)
}


$: avatar = space?.avatar ? `${PUBLIC_MEDIA_URL}/${space?.avatar}` :
null

</script>

<div class="" bind:this={content}>
    {space?.name}
</div>

<div class="i-c grd">
    <div class="item grd-c"
    draggable="true"
    class:active={active}
    bind:this={el}
    on:contextmenu={log}
    on:mouseover={() => hovered = true}
    on:mouseleave={() => hovered = false}
    on:click={goToSpace}
    style="background-image: url({avatar})">
        {#if !avatar}
        <div class="initial grd-c" style="font-size:{size};">
            <b>{initials}</b>
        </div>
        {/if}
    </div>
    <div class="tick" class:th={hovered} class:ac={active}></div>
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
    background-size: cover;
    background-position: center center;
    background-repeat: no-repeat;
}

.initial {
    opacity: 0.8;
    font-size: var(--size);
}

.item:hover {
}

.active {
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
    opacity: 1;
}

</style>
