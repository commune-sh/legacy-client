<script>
import '/static/css/main.css'
import '/static/css/body-overflow-y.css'
import Event from '$lib/board/event/event.svelte'
import Header from '$lib/header/post-header.svelte'
import { onMount, createEventDispatcher } from 'svelte';
import { browser } from '$app/environment';
import { store } from '$lib/store/store.js'
import { redactEvent, loadPostWithReplies } from '$lib/utils/request.js'
import { deleteEvent } from '$lib/utils/events.js'
import { PUBLIC_MEDIA_URL, PUBLIC_API_URL, PUBLIC_META_TITLE, PUBLIC_FAVICON,
    PUBLIC_META_IMAGE } from '$env/static/public';
import { page } from '$app/stores';
import Switcher from '$lib/switcher/switcher.svelte'
import SkeletonBoardEvents from '$lib/skeleton/skeleton-board-events.svelte'
import SkeletonBoardEvent from '$lib/skeleton/skeleton-board-event.svelte'
import SkeletonSpan from '$lib/skeleton/skeleton-span.svelte'
import Post from '$lib/post/post.svelte'

import Authentication from '$lib/auth/authentication.svelte'
import Sync from '$lib/sync/sync.svelte'
import Health from '$lib/sync/health.svelte'
import Down from '$lib/errors/down.svelte'

export let data;


$: if(data) {
    console.log(data)
    console.log(data)
    console.log(data)
}


$: slug = $page.params?.post

onMount(() => {
    //fetchPost()
})

$: down = $store.down || data?.error

let ready = false

let event;
let replies;

async function fetchPost() {

    let endpoint = PUBLIC_API_URL

    let url = `${endpoint}/event/${slug}?replies=true`

    let opt = {
      url: url,
      method: 'GET',
    }

    const resp = await loadPostWithReplies(opt)

    if(resp?.event) {
        event = resp.event
    }

    if(resp?.replies) {
        replies = resp.replies
    }
    ready = true

    if(!resp) {
    }

}

$: authenticated = $store?.authenticated && 
    $store?.credentials != null
    $store?.credentials?.access_token?.length > 0

let EmojiPicker;
$: if(authenticated) {
    import('$lib/emoji/emoji-picker.svelte').then(m => {
        EmojiPicker = m.default
    })
}

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

{#if authenticated && EmojiPicker}
    <EmojiPicker />
{/if}



{#if !down}
<div class="container">
    <div class="switcher">
        <Switcher />
    </div>
    <div class="content">
        <div class="inner">
                <Post embed={true} post={data}/>
        </div>
    </div>
</div>

<Authentication />
<Sync />
<Health />
{/if}

{#if down}
    <Down />
{/if}

<style>

.container {
    display: grid;
    height: 100%;
}

.switcher {
    width: 58px;
    position: fixed;
    left: 0;
    top:0;
    bottom: 0;
    overflow: hidden;
}

.content {
    display: grid;
    margin-left: 58px;
    height: 100%;
}

.inner {
    display: grid;
    max-width: 720px;
    width: 100%;
    justify-self: center;
    align-self: start;
    border-right: 1px solid var(--border-1);
    border-left: 1px solid var(--border-1);
    height: 100%;
}

@media (max-width: 785px) {
    .switcher {
         display: none;
    }
    .content {
        margin: 0;
    }
}
@media (max-width: 720px) {
    .content {
        border-right: none;
        border-left: none;
    }
}

</style>


