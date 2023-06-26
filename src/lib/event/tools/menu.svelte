<script>
import { onMount, createEventDispatcher } from 'svelte'
import { store } from '$lib/store/store.js'
import { more, code, trash, pin } from '$lib/assets/icons.js'
import ViewSource from './source.svelte'
import tippy from 'tippy.js';
import { page } from '$app/stores';

$: state = $store?.states[$page?.params?.space]
$: sender_id = $store.credentials?.matrix_user_id
$: isOwner = state?.owner === sender_id

$: authenticated = $store?.authenticated && 
    $store?.credentials != null
    $store?.credentials?.access_token?.length > 0

$: isSpace = $page?.params?.space !== undefined && $page?.params?.space !== null && $page?.params?.space !== ''

const dispatch = createEventDispatcher();

export let event;
export let isAuthor;
export let isReply;
export let nested;

let el;
let content;

let menu;

let active = false;

onMount(() => {
    menu = tippy(el, {
        content: content,
        allowHTML: true,
        trigger: 'click',
        interactive: true,
        theme: 'light-border',
        placement: 'bottom-end',
        arrow: false,
        duration: 1,
        zIndex: 99999,
        onShown(i) {
            active = true
            dispatch('active', true)
        },
        onHide(i) {
            active = false
            dispatch('kill', true)
        },
        onClickOutside(i) {
            active = false
            dispatch('kill', true)
        },
    });
})



function viewSource() {
    menu.hide()
    console.log(event)
}

function redactEvent() {
    menu.hide()
    dispatch('redact', event)
}

function pinEvent() {
    menu.hide()
    dispatch('pin', event)
}



</script>


<div class="menu fl-co" bind:this={content}>
    {#if authenticated && isOwner && !nested && isSpace}
    <div class="m-item fl " on:click|stopPropagation={pinEvent}>
        <div class="grd-c mr2 fl-o">
            {event?.pinned ? 'Unpin' : 'Pin'} Post
        </div>
        <div class="mic grd-c ico-s" >
            {@html pin}
        </div>
    </div>
    {/if}
    <div class="m-item fl" on:click|stopPropagation={viewSource}>
        <div class="grd-c mr2 fl-o">
            View source
        </div>
        <div class="mic grd-c ico-s" >
            {@html code}
        </div>
    </div>
    {#if authenticated && (isOwner || isAuthor)}
    <div class="m-item fl pr" on:click|stopPropagation={redactEvent}>
        <div class="grd-c mr2 fl-o">
            Delete
        </div>
        <div class="mic grd-c ico-s" >
            {@html trash}
        </div>
    </div>
    {/if}
</div>

<div class="more grd-c c-ico" 
    class:ac={active}
    on:click|stopPropagation bind:this={el}>
    {@html more}
</div>

<style>
.menu {
    width: 160px;
    z-index: 901;
    padding: 0.25rem;
}
.more {
    width: 18px;
    height: 18px;
    border-radius: 4px;
    padding: 0.25rem;
}

.more:hover {
    background-color: var(--shade-2);
}

.ac {
    background-color: var(--shade-2);
}


.m-item{
    cursor: pointer;
    border-radius: 4px;
    font-size: 0.8rem;
    font-weight: bold;
    padding: 0.25rem;
}
.m-item:hover{
    background-color: var(--context-menu-hover);
}
.mic {
    width: 18px;
    height: 18px;
}
.pr {
    color: red;
}
.pr .ico-s {
    fill: red;
}
</style>
