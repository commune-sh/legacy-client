<script>
import { reply, external, edit, trash, more } from '$lib/assets/icons.js'
import React from './react.svelte'
import { createEventDispatcher } from 'svelte'
import { goto } from '$app/navigation';
import { store } from '$lib/store/store.js'
import { page } from '$app/stores';

$: state = $store?.states[$page?.params?.space]
$: sender_id = $store.credentials?.matrix_user_id
$: isOwner = state?.owner === sender_id

const dispatch = createEventDispatcher();

export let active;
export let event;

export let isReply;
export let isAuthor;

function kill() {
    dispatch('kill')
}

function replyToEvent() {
    dispatch('reply')
}

function editEvent() {
    dispatch('edit')
}

function redactEvent() {
    dispatch('redact', event)
}


function goToEvent() {
    let url = `/${event.room_alias}/post/${$page.params.post}/reply/${event?.slug}`

    if($page.params?.domain) {
        url = `/${$page.params.domain}${url}`
    }

    goto(url, {
        noscroll: true,
    })
}

let killPopup = (e) => {
    popup.kill()
    console.log("dispatching", e.detail)
    dispatch('kill', e.detail)
}

let popup;

let menuActive = false;

let killed = () => {
    menuActive = false
    //dispatch('kill')
    console.log("killin")
}
</script>

<div class="event-tools">

    <React inline={false} 
        isReply={isReply} 
        event={event} 
        on:react
        on:active />

    <div class="icon grd-c c-ico" 
        on:click|stopPropagation={replyToEvent}>
        {@html reply}
    </div>

    {#if isReply}
        <div class="icon grd-c c-ico" 
            on:click|stopPropagation={goToEvent}>
            {@html external}
        </div>
    {/if}

    {#if isAuthor}
        <div class="icon grd-c c-ico" 
            on:click|stopPropagation={editEvent}>
            {@html edit}
        </div>
    {/if}

    {#if isAuthor || isOwner}
        <div class="icon grd-c c-ico" 
            on:click|stopPropagation={redactEvent}>
            {@html trash}
        </div>
    {/if}


</div>

{#if active}
    <div class="tools-mask" on:click={kill}></div>
{/if}

<style>
.event-tools {
    display: grid;
    grid-auto-flow: column;
    grid-column-gap: 0.25rem;
    border: 1px solid var(--border-1);
    z-index: 900;
    border-radius: 9px;
    padding: 0.25rem;
    background-color: var(--bg);
}

.tools-mask {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    height: 100%;
    z-index: 899;
    width: 100vw;
    cursor: auto;
}
.icon {
    width: 18px;
    height: 18px;
    border-radius: 4px;
    padding: 0.25rem;
}
.icon:hover {
    background-color: var(--shade-2);
}

</style>
