<script>
import { tick, onMount, onDestroy, createEventDispatcher } from 'svelte'
import { store } from '$lib/store/store.js'
import Item from './item.svelte'

export let roomID;
export let uploading;

$: attachments = $store.editorStates[roomID]?.attachments

</script>

<div class="attachments fl fl-wr">
{#each attachments as attachment, index (attachment)}
        <Item 
            item={attachment} 
            roomID={roomID} 
            uploading={uploading} 
            index={index} />
{/each}
</div>

<style>
.attachments {
    padding-top: 1rem;
    padding-left: 1rem;
}
</style>
