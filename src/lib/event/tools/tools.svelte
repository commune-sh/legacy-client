<script>
import { react, reply } from '$lib/assets/icons.js'
import Menu from './menu.svelte'
import { createEventDispatcher } from 'svelte'

const dispatch = createEventDispatcher();

export let active;
export let event;

function kill() {
    dispatch('kill')
}

function replyToEvent() {
    dispatch('reply')
}

function reactToEvent() {
    dispatch('react')
}

</script>

<div class="event-tools">
    <div class="icon grd-c c-ico" 
        on:click|stopPropagation={reactToEvent}>
        {@html react}
    </div>
    <div class="icon grd-c c-ico" 
        on:click|stopPropagation={replyToEvent}>
        {@html reply}
    </div>
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
    grid-template-columns: auto auto auto auto;
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
