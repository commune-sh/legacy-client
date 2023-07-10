<script>
import '/static/css/main.css'
import Event from '$lib/board/event/event.svelte'
import Header from '$lib/header/post-header.svelte'
import { onMount, createEventDispatcher } from 'svelte';
import { store } from '$lib/store/store.js'
import { redactEvent, loadPostWithReplies } from '$lib/utils/request.js'
import { deleteEvent } from '$lib/utils/events.js'
import { PUBLIC_API_URL } from '$env/static/public';
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

document.documentElement.style.overflowY = 'auto';
document.documentElement.style.overflowX = 'hidden';
document.body.style.overflowY = 'auto';
document.body.style.overflowX = 'hidden';

$: slug = $page.params?.post

onMount(() => {
    //fetchPost()
})

$: down = $store.down

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

</script>

{#if authenticated && EmojiPicker}
    <EmojiPicker />
{/if}



<div class="container">
    <div class="switcher">
        <Switcher />
    </div>
    <div class="content">
        <div class="inner">
            <Post embed={true}/>
        </div>
    </div>
</div>

<Authentication />
<Sync />
<Health />

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


