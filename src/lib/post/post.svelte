<script>
import Event from '$lib/event/event.svelte'
import Header from '$lib/header/post-header.svelte'
import { onMount, createEventDispatcher } from 'svelte';
import { store } from '$lib/store/store.js'
import { APIRequest, loadPostWithReplies } from '$lib/utils/request.js'
import { nestEvents } from '$lib/utils/events.js'
import { PUBLIC_API_URL } from '$env/static/public';
import { page } from '$app/stores';
import SkeletonBoardEvents from '$lib/skeleton/skeleton-board-events.svelte'
import SkeletonBoardEvent from '$lib/skeleton/skeleton-board-event.svelte'
import SkeletonSpan from '$lib/skeleton/skeleton-span.svelte'

const dispatch = createEventDispatcher();

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
$: joined = $store?.rooms.find(x => x === roomID) != null 


export let post;


$: state = $store?.states[$page?.params?.space]

$: isSpace = $page?.params?.space !== undefined && $page?.params?.space !== null && $page?.params?.space !== '' 

$: isRoom = $page?.params?.room !== undefined && $page?.params?.room !== null && $page?.params?.room !== '' 

$: roomID = post?.room_id

let ready = false;

$: r = $page.params.reply ? $page.params.reply : $page.params.post

let route = null;

$: if($page.route != route && r) {
    post = null
    ready = false
    fetchPost()
}

async function fetchPost() {
    let opt = {
      url: `${PUBLIC_API_URL}/event/${r}?replies=true`,
      method: 'GET',
    }

    const resp = await loadPostWithReplies(opt)
    console.log(resp)

    if(resp) {
        post = resp.event
        data = resp
        if(resp?.replies) {
            let r = isReply ? $page.params.reply : $page.params.post
            store.addEventReplies(r, resp.replies)
        }
        route = $page.route
        ready = true
    }
    if(!resp) {
        down = true
    }

}

let data = null;
let down = false;

$: replies = data?.replies

//$: replies = $store?.replies?.[$page.params.post]
//$: replies = isReply ? $store?.replies?.[$page.params.reply] : $store?.replies?.[$page.params.post]



let placeholder = 'Leave a reply.'

function insertReply(children, newReply) {
  for (const reply of children) {
    let in_reply_to = newReply?.content['m.relates_to']?.event_id
    if (reply.event_id === in_reply_to) {
      if (!reply.children) {
        reply.children = [];
      }
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
    dispatch('reply-saved', post.event_id)


    if(data?.replies?.length > 0) {
        let in_reply_to = reply?.content['m.relates_to']?.event_id
        if(in_reply_to == post.event_id) {
            data.replies = [...data.replies, reply];
            console.log("added", data.replies)
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

let reply_count = post?.reply_count || 0

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

function setReplyThread(e) {
    console.log("setting reply thread", e.detail)
    let event = e.detail
    //post = e.detail
    let children = event.children
    delete event.children
    post = event
    data.replies = children
    data.replies = data.replies
}

</script>

<section class="content" class:rep={replying}>
    <Header />

    <section class="events">

        {#if post}
            <Event on:update-reactions isPost={true} event={post} on:replyTo={replyToEvent}/>
        {:else}
            <SkeletonBoardEvent image={false}/>
        {/if}

        <div class="sep">
        </div>


        <div class="norep pa3 fl">
            <div class="rco grd-c">
                {#if !ready}
                    <SkeletonSpan />
                {:else if post}
                    {#if post.reply_count > 0}
                        {post.reply_count} {post.reply_count == 1 ? 'reply' : 'replies'}
                    {:else}
                    No replies yet
                    {/if}
                {/if}
            </div>
            <div class="fl-o">
            </div>

            {#if post}
            <div class="">
                <button on:click={replyToPost}>Reply</button>
            </div>
            {/if}
        </div>

        {#if ready}
            {#if replies}
                {#each replies as reply}
                    <Event isReply={true} 
                        sender={post?.sender?.id}
                        on:set-reply-thread={setReplyThread}
                        event={reply} 
                        on:replyTo={replyToEvent} />
                {/each}
            {/if}


        {:else}
            <SkeletonBoardEvents num={5} reply={true}/>
        {/if}

    </section>

    {#if ready && authenticated && joined && replying}
        <Composer 
            roomID={roomID}
            reply={true} 
            threadEvent={post?.event_id}
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
    .norep {
        border-top: 1px solid var(--border-1);
        padding-top: 0.5rem;
        padding-bottom: 0.5rem;
    }
}
</style>

