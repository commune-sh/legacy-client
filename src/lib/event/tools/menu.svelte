<script>
import { onMount, createEventDispatcher } from 'svelte'
import { store } from '$lib/store/store.js'
import { more, code, trash } from '$lib/assets/icons.js'
import ViewSource from './source.svelte'
import tippy from 'tippy.js';
import { page } from '$app/stores';

$: state = $store?.states[$page?.params?.space]
$: sender_id = $store.credentials?.matrix_user_id
$: isOwner = state?.owner === sender_id

const dispatch = createEventDispatcher();

export let event;
export let isAuthor;

let el;
let content;

let menu;

let active = false;


function viewSource() {
    /*
    store.showModal(ViewSource, {
        event: event
    })
    */
    console.log(event)
}
function redactEvent() {
    dispatch('redact', event.event_id)
}


</script>


<div class="menu fl-co" bind:this={content}>
    <div class="m-item fl" on:click|stopPropagation={viewSource}>
        <div class="grd-c mr2 fl-o">
            View source
        </div>
        <div class="mic grd-c ico-s" >
            {@html code}
        </div>
    </div>
    {#if isOwner || isAuthor}
    <div class="m-item fl" on:click|stopPropagation={redactEvent}>
        <div class="grd-c mr2 fl-o">
            Delete
        </div>
        <div class="mic grd-c ico-s" >
            {@html trash}
        </div>
    </div>
    {/if}
</div>

<style>
.menu {
    width: 160px;
    z-index: 901;
    padding: 0.25rem;
    position: relative;
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
</style>
