<script>
import { tick, onMount, onDestroy, createEventDispatcher } from 'svelte'
import { store } from '$lib/store/store.js'
import ImageItem from './image-item.svelte'
import VideoItem from './video-item.svelte'

export let roomID;
export let uploading;

$: attachments = $store.editorStates[roomID]?.attachments

$: isImage = (attachment) => {
    return attachment.type.startsWith('image')
}

$: isVideo = (attachment) => {
    return attachment.type.startsWith('video')
}

</script>

<div class="attachments fl fl-wr">
{#each attachments as attachment, index (attachment)}
    {#if isImage(attachment)}
        <ImageItem 
            item={attachment} 
            roomID={roomID} 
            uploading={uploading} 
            index={index} />
    {:else if isVideo(attachment)}
        <VideoItem 
            item={attachment} 
            roomID={roomID} 
            uploading={uploading} 
            index={index} />
    {/if}
{/each}
</div>

<style>
.attachments {
    padding-top: 1rem;
    padding-left: 1rem;
}
</style>
