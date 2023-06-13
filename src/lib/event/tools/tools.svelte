<script>
import { reply, external, edit } from '$lib/assets/icons.js'
import Menu from './menu.svelte'
import React from './react.svelte'
import { createEventDispatcher } from 'svelte'
import { goto } from '$app/navigation';
import { store } from '$lib/store/store.js'
import { page } from '$app/stores';

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


function goToEvent() {
    let url = `/${event.room_alias}/post/${$page.params.post}/reply/${event?.slug}`

    goto(url, {
        noscroll: true,
    })
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

    <Menu 
        on:active 
        on:kill 
        event={event} />
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
    width: 20px;
    height: 20px;
    border-radius: 4px;
    padding: 0.25rem;
}
.icon:hover {
    background-color: var(--shade-2);
}

</style>
