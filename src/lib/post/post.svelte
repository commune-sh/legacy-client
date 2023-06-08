<script>
import Event from '$lib/event/event.svelte'
import Header from '$lib/header/post-header.svelte'
import { onMount } from 'svelte';
import { store } from '$lib/store/store.js'
import { APIRequest } from '$lib/utils/request.js'
import { nestEvents } from '$lib/utils/events.js'
import { PUBLIC_API_URL } from '$env/static/public';
import { page } from '$app/stores';
import SkeletonBoardEvents from '$lib/skeleton/skeleton-board-events.svelte'
import SkeletonSpan from '$lib/skeleton/skeleton-span.svelte'

$: authenticated = $store?.authenticated && 
    $store?.credentials != null
    $store?.credentials?.access_token?.length > 0

let Composer;
$: if(authenticated) {
    import('$lib/composer/composer.svelte').then(m => {
        Composer = m.default
    })
}

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
      url: `${PUBLIC_API_URL}/event/${post.event_id}/replies`,
      method: 'GET',
    })
    .then(resp => {
        if(resp) {
            data = resp
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
    replying = false
    loadEvents()
}

let isLastReply = false;

$: if(isReply) {
    isLastReply = true
}

$: if(!isReply && isLastReply) {
    ready = false
    loadEvents()
}

let placeholder = 'Leave a reply.'

function insertReply(children, newReply) {
  for (const reply of children) {
    let in_reply_to = newReply?.content['m.relates_to']?.event_id
    if (reply.event_id === in_reply_to) {
      if (!reply.children) {
        reply.children = [];
      }
            console.log("found parent reply", reply)
      reply.children.push(newReply);
      return;
    }
    if (reply.children) {
      insertReply(reply.children, newReply);
    }
  }
}

function replySaved(e) {

    let reply = e.detail

    reply.just_posted = true


    if(data?.replies?.length > 0) {
        let in_reply_to = reply?.content['m.relates_to']?.event_id
        if(in_reply_to == post.event_id) {
            data.replies = [...data.replies, reply];
            post.reply_count += 1
            return
        }

        insertReply(data.replies, reply)
        post.reply_count += 1
        data = data
        return
    }

    if(data == null) {
        data = {}
        data.replies = [reply]
    } else {
        //data.replies = []
        if(!data?.replies) {
            data.replies = []
        }
        data.replies = [reply, ...data.replies];
        post.reply_count += 1
    }
}

let reply_count = post.reply_count || 0

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


/*
$: if(ready && authenticated && joined && roomID && post) {
    let stateKey = roomID + post?.event_id
    let es = store.getEditorState(stateKey)
    if(es != undefined) {
        console.log(es)
        replyingTo = es.replyingTo
        replying = true
    }
}
*/

$: isReply = $page.params.reply !== undefined && $page.params.reply !== null && $page.params.reply !== ''

</script>

<section class="content" class:rep={replying}>
    <Header />

    <section class="events">

        <Event isPost={true} event={post} on:replyTo={replyToEvent}/>

        <div class="sep">
        </div>


        <div class="norep pa3 fl">
            <div class="rco grd-c">
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
                        sender={post.sender.id}
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

.rco {
    font-size: small;
    font-weight: bold;
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

