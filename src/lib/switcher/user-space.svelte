<script>
import { onMount, createEventDispatcher } from 'svelte'
import { store } from '$lib/store/store.js'
import { user } from '$lib/assets/icons.js'
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


function goToUserSpace() {
    let url = `/@${username}`
    goto(url, {noscroll: true})
    menu.hide()
}

let hovered = false;

$: active = $page?.params?.space === `@${username}`

$: username = $store?.credentials?.username

</script>

<div class="" bind:this={content}>
    <b>@{username}'s space</b>
</div>

<div class="i-c grd">
    <div class="item grd-c" 
    class:active={active}
    on:mouseover={() => hovered = true}
    on:mouseleave={() => hovered = false}
    on:click={goToUserSpace}
    bind:this={el}>
        <div class="create ico grd-c">
            {@html user}
        </div>
    </div>
    <div class="tick" class:th={hovered} class:ac={active}></div>
</div>

<style>

.i-c {
    position: relative;
    margin-bottom: 0.75rem;
}

.item{
    background-color: var(--switcher-item);
    border-radius: 50%;
    width: 36px;
    height: 36px;
    border: 2px solid transparent;
    display: grid;
    cursor: pointer;
}
.item:hover {
    border: 2px solid var(--primary);
}

.active {
    border: 2px solid var(--primary);
}


.tick {
    opacity: 0;
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
    height: 22px;
    width: 22px;
}
</style>
