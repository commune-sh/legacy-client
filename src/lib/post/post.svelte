<script>
import Event from '$lib/event/event.svelte'
import Header from '$lib/header/post-header.svelte'
import { onMount } from 'svelte';
import { store } from '$lib/store/store.js'
import { APIRequest } from '$lib/utils/request.js'
import { nestEvents } from '$lib/utils/events.js'
import { PUBLIC_BASE_URL } from '$env/static/public';
import { page } from '$app/stores';
import SkeletonBoardEvents from '$lib/skeleton/skeleton-board-events.svelte'
import SkeletonSpan from '$lib/skeleton/skeleton-span.svelte'
import Composer from '$lib/composer/composer.svelte'

$: authenticated = $store?.authenticated && 
    $store?.credentials != null
    $store?.credentials?.access_token?.length > 0

$: space_room_id = state?.room_id
$: joined = $store?.spaces.find(x => x?.room_id === space_room_id) != null 


export let post;


$: state = $store?.states[$page?.params?.space]

$: isSpace = $page?.params?.space !== undefined && $page?.params?.space !== null && $page?.params?.space !== '' 
$: isRoom = $page?.params?.room !== undefined && $page?.params?.room !== null && $page?.params?.room !== '' 
$: roomID = isRoom ? state?.children?.find(r => r?.alias ===
    $page?.params?.room)?.room_id : isSpace ? state?.room_id : null

let ready = false;

function loadEvents() {
    APIRequest({
      url: `${PUBLIC_BASE_URL}/event/${post.event_id}/replies`,
      method: 'GET',
    })
    .then(resp => {
        if(resp) {
            //
            data = resp
                console.log(data.replies)
            lastPost = $page.params.post
            ready = true
        }
        if(!resp) {
            down = true
        }
    })

}

let data = null;
let down = false;

$: replies = data?.replies

let lastPost = null;

onMount(() => {
    if(post?.event_id) {
        loadEvents()
    }
})

$: if(lastPost != null && $page.params.post != lastPost) {
    ready = false
    loadEvents()
}

let placeholder = 'Leave a reply.'

function replySaved(e) {
    if(data == null) {
        data = {}
        data.replies = [e.detail]
    } else {
        //data.replies = []
        if(!data?.replies) {
            data.replies = []
        }
        data.replies = [e.detail, ...data.replies];
    }
}

let replying = false;
let replyingTo = null;

let replyToEventAfterLogin = false;

$: if(authenticated && replyToEventAfterLogin)  {
    replyToPost()
    replyToEventAfterLogin = false
}

function replyToEvent(e) {
    if(!authenticated) {
        replyToEventAfterLogin = true
        store.startAuthenticating()
        return
    }
    replying = true
    replyingTo = e.detail
}

let replyToPostAfterLogin = false;

$: if(authenticated && replyToPostAfterLogin)  {
    replyToPost()
    replyToPostAfterLogin = false
}

function replyToPost() {
    if(!authenticated) {
        console.log('not authenticated')
        replyToPostAfterLogin = true
        store.startAuthenticating()
        return
    }
    replying = true
    replyingTo = post
    console.log("ready, authenticated, joined, replying)", ready, authenticated, joined, replying)
}

function cancelReply() {
    replying = false
    replyingTo = null;
}


$: if(replies) {
}

</script>

<section class="content" class:rep={replying}>
    <Header />

    <section class="events">

        <Event isPost={true} event={post} on:replyTo={replyToEvent}/>

        <div class="sep">
        </div>

        <div class="norep pa3 fl">
            <div class="grd-c">
                {#if ready}
                    {#if post.reply_count > 0}
                        {post.reply_count} {post.reply_count == 1 ? 'reply' : 'replies'}
                    {:else}
                    No replies yet
                    {/if}
                {:else}
                    <SkeletonSpan width={`150px`}/>
                {/if}
            </div>
            <div class="fl-o">
            </div>
            <div class="">
                <button on:click={replyToPost}>Reply</button>
            </div>
        </div>

        {#if ready}
            {#if replies}
                {#each replies as reply}
                    <Event isReply={true} 
                        event={reply} 
                        on:replyTo={replyToEvent} />
                {/each}
            {/if}


        {:else}
            <SkeletonBoardEvents />
        {/if}

    </section>

    {#if ready && authenticated && joined && replying}
        <Composer 
            roomID={roomID}
            reply={true} 
            threadEvent={post.event_id}
            replyTo={replyingTo}
            on:saved={replySaved} 
            on:kill={cancelReply}
            placeholder={placeholder} />
    {/if}



</section>


<style>
.content {
    display: grid;
    grid-template-columns: auto;
    grid-template-rows: 48px auto;
    overflow-y: hidden;
    background-color: var(--bg);
}

.rep {
    grid-template-rows: 48px 1fr auto;
}

.events {
    overflow-y: scroll;
}

.norep {
    border-bottom: 1px solid var(--border-1);
}

@media screen and (max-width: 1280px) {
    .content {
        position: fixed;
        top: 0;
        right: 0;
        bottom: 0;
        left: 304px;
    }
}
@media screen and (max-width: 768px) {
    .content {
        position: static;
    }
}
</style>

