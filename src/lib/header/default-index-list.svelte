<script>
import { PUBLIC_BASE_URL } from '$env/static/public';
import { goto } from '$app/navigation';
import { store } from '$lib/store/store.js'
import { page } from '$app/stores';
import { onMount, createEventDispatcher } from 'svelte'
import { down, check, discuss, at, earth } from '$lib/assets/icons.js'
import tippy from 'tippy.js';

$: authenticated = $store?.authenticated && 
    $store?.credentials != null
    $store?.credentials?.access_token?.length > 0



let el;
let content;
let menu;
let active = false;

let copied = false;

$: if(!active) {
    setTimeout(() => {
        copied = false
    }, 100)
}

onMount(() => {
    menu = tippy(el, {
        content: content,
        allowHTML: true,
        trigger: 'click',
        interactive: true,
        theme: 'notifications',
        placement: 'bottom-start',
        arrow: false,
        duration: 1,
        zIndex: 99999,
        onShown(i) {
            active = true
        },
        onHide(i) {
            active = false
        },
        onClickOutside(i) {
            active = false
        },
    });
})

$: isAll = $page?.url?.pathname == `/all`

$: indexText = isAll ? `All posts` : authenticated ? `Your feed` : `What's new`

function sortAll() {
    menu.hide()
    let query = new URLSearchParams($page.url.searchParams.toString());
    query.set('filter', '');
    goto(`/`);
}

function sortSpaces() {
    menu.hide()
    let query = new URLSearchParams($page.url.searchParams.toString());
    query.set('filter', 'spaces');
    goto(`?${query.toString()}`);
}

function sortSocial() {
    menu.hide()
    let query = new URLSearchParams($page.url.searchParams.toString());
    query.set('filter', 'social');
    goto(`?${query.toString()}`);
}

$: all = $page.url.search == ''
$: spaces = $page.url.search == '?filter=spaces'
$: social = $page.url.search == '?filter=social'

</script>

<div class="board-list ml2"
    class:ac={active}
    on:click|stopPropagation bind:this={el}>
    <div class="ico-s sml grd-c mh1">
        {#if all}
            {@html earth}
        {:else if spaces}
            {@html discuss}
        {:else if social}
            {@html at}
        {/if}
    </div>
    <div class="name grd-c ml1 pv1">
        {indexText} {spaces ? `: Spaces` : social ? `: Social` : ``}
    </div>
    <div class="ico-s grd-c mh1">
        {@html down}
    </div>
</div>

<div class="menu" bind:this={content}>
    <div class="content pa1 fl-co">

        <div class="item pa2" on:click={sortAll}>
            <div class="ico-s grd-c mr2">
                {@html earth}
            </div>
            <div class="name">
                All posts
            </div>
            {#if all}
                <div class="ico-s grd-c">
                    {@html check}
                </div>
            {/if}
        </div>

        <div class="item pa2" on:click={sortSpaces}>
            <div class="ico-s grd-c mr2">
                {@html discuss}
            </div>
            <div class="name">
                Spaces
            </div>
            {#if spaces}
                <div class="ico-s grd-c">
                    {@html check}
                </div>
            {/if}
        </div>

        <div class="item pa2" on:click={sortSocial}>
            <div class="ico-s grd-c mr2">
                {@html at}
            </div>
            <div class="name">
                Social
            </div>
            {#if social}
                <div class="ico-s grd-c">
                    {@html check}
                </div>
            {/if}
        </div>


    </div>
</div>

<style>
.board-list {
    display: grid;
    grid-template-columns: auto 1fr auto;
    border-radius: 5px;
    background: var(--shade-3);
    cursor: pointer;
    overflow: hidden;
}

.name {
    font-size: small;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: normal;
}

.menu {
    width: 200px;
    z-index: 901;
    border-radius: 9px;
    background-color: var(--context-menu-bg);
    display: grid;
    overflow: hidden;
}

.item {
    display: grid;
    grid-template-columns: auto 1fr auto;
    border-radius: 5px;
    cursor: pointer;
}

.content {
    overflow-y: auto;
    max-height: 400px;
}

.in {
    overflow: hidden;
}

.item:hover {
    background: var(--shade-4);
}
.board-list:hover {
    background: var(--shade-4);
}


.ac {
    background: var(--shade-4);
}

.ico-s {
    height: 16px;
    width: 16px;
}

.img {
    background: var(--shade-4);
    background-size: cover;
    background-position: center;
    border-radius: 50%;
    height: 16px;
    width: 16px;
}

.di {
    height: 16px;
    width: 16px;
}




::-webkit-scrollbar {
    width: 3px;
}
::-webkit-scrollbar-thumb {
    background: var(--scrollbar-thumb);
    transition: 0.1s;
}
::-webkit-scrollbar-track {
    background: transparent;
    transition: 0.1s;
}
.init {
    font-size: 10px;
    font-weight: 500;
}
.sml {
    width: 14px;
    height: 14px;
}
</style>
