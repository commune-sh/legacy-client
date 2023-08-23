<script>
import '/static/css/main.css'
import '/static/css/body-overflow-y.css'
import Event from '$lib/board/event/event.svelte'
import { onMount } from 'svelte';
import { store } from '$lib/store/store.js'
import { PUBLIC_MEDIA_URL, PUBLIC_META_TITLE, PUBLIC_FAVICON,
    PUBLIC_META_IMAGE } from '$env/static/public';
import { page } from '$app/stores';
import Down from '$lib/errors/down.svelte'

export let data;



onMount(() => {
})

$: down = $store.down || data?.error




$: isPost = $page?.params?.post !== undefined 

$: fb = data?.event?.content?.body ? `${data?.event?.content?.body.slice(0, 1000)}...` : ''

$: pb = data?.event?.content?.body?.length > 50 ?
    `${data?.event?.content?.body.slice(0, 50)}...` :  
    data?.event?.content?.body 

$: pt = data?.event?.content?.title ? data?.event?.content?.title :
    pb ? pb : ''

$: ct = data?.event?.type == 'm.room.message' ?
    `${sender}: "${pt}"` : pt

$: postTitle = pt ? `${ct} - ${PUBLIC_META_TITLE}` : PUBLIC_META_TITLE

$: title = isPost ? postTitle : PUBLIC_META_TITLE

$: sender = data?.event?.sender?.display_name ?
data?.event?.sender?.display_name : data?.event?.sender?.username

$: avatar = data?.event?.sender?.avatar_url ? data?.event?.sender?.avatar_url : ''

$: hasImage = data?.event?.content?.attachments?.length > 0 &&
    data?.event?.content?.attachments[0]?.type?.startsWith('image')

$: imageKey = hasImage ? data?.event?.content?.attachments[0]?.key : avatar ?
    avatar : ''

$: imageSRC = imageKey ? `${PUBLIC_MEDIA_URL}/${imageKey}` : ''

</script>

<svelte:head>
    <title>{title}</title>
    {#if isPost && imageSRC}
        <meta property="og:image" content={imageSRC} />
    {:else}
        <meta property="og:image" content={PUBLIC_META_IMAGE || PUBLIC_FAVICON} />
    {/if}
    {#if isPost && sender}
        <meta name="author" content={sender} />
    {/if}
    {#if isPost && data?.event}
        <meta name="description" content={fb}>
    {/if}
</svelte:head>




{#if !down}

<div class="container">
    <Event 
    isPost={true}
    embed={true}
    event={data?.event}  />
</div>

{/if}

{#if down}
    <Down />
{/if}

<style>

.container {
    display: grid;
    height: 100%;
}

</style>


