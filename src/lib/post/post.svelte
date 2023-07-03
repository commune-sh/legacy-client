<svelte:options accessors={true} />

<script>
import Event from '$lib/event/event.svelte'
import Header from '$lib/header/post-header.svelte'
import { savePost, redactReaction } from '$lib/utils/request.js'
import { onMount, createEventDispatcher } from 'svelte';
import { store } from '$lib/store/store.js'
import { redactEvent, loadPostWithReplies } from '$lib/utils/request.js'
import { deleteEvent } from '$lib/utils/events.js'
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


export let post;
export let embed = false;


$: state = $store?.states[$page?.params?.space]

$: isSpace = $page?.params?.space !== undefined && $page?.params?.space !== null && $page?.params?.space !== '' 

$: isRoom = $page?.params?.room !== undefined && $page?.params?.room !== null && $page?.params?.room !== '' 

$: roomID = post?.room_id

let ready = false;

$: r = $page.params.reply ? $page.params.reply : $page.params.post

let route = null;

//$: routeChanged = route !== $page.route && route !== null
$: routeChanged = route !== $page.route

//$: if((routeChanged || post == null) && r) {
$: if((routeChanged && !post) && r && !isDomain) {
    console.log(post?.event_id)
    post = null
    if(data?.replies) {
        data.replies = null
    }
    ready = false
    fetchPost()
} else if(routeChanged && post && r && !isDomain) {
    if(data?.replies) {
        data.replies = null
    }
    if(isDomain) {
        post = null
        ready = false
    }
    ready = false
    fetchPost()
}

let domainPinged =false

$: if(isDomain && $store.federated.endpoint && !ready) {
    if(!domainPinged) {
        ready = false
        fetchPost()
    }
}

$: if(isDomain && $store.federated.endpoint && routeChanged && domainPinged) {
    if(data?.replies) {
        data.replies = null
    }
    post = null
    ready = false
    fetchPost()
}

$: isDomain = $page.params.domain !== undefined && 
    $page.params.domain !== 'undefined' && 
    $page.params.domain?.length > 0

async function fetchPost() {

    let endpoint = PUBLIC_API_URL

    if($store.federated?.active && $store.federated.endpoint) {
        endpoint = $store.federated?.endpoint
    }

    let url = `${endpoint}/event/${r}?replies=true`

    let opt = {
      url: url,
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
        domainPinged = true
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
function countTotalEvents(events) {
  let count = 0;

  for (let i = 0; i < events.length; i++) {
    count++; // Increment count for the current event

    if (events[i].children) {
      count += countTotalEvents(events[i].children); // Recursively count events in children
    }
  }

  return count;
}

function replySaved(e) {

    let reply = e.detail

    reply.just_posted = true



    if(data?.replies?.length > 0) {
        let in_reply_to = reply?.content['m.relates_to']?.event_id
        if(in_reply_to == post.event_id) {
            data.replies = [...data.replies, reply];
            post.reply_count = countTotalEvents(data.replies)

            dispatch('reply-saved', {
                event_id: post.event_id, 
                reply_count: post.reply_count
            })
            return
        }

        insertReply(data.replies, reply)
        post.reply_count = countTotalEvents(data.replies)
        data = data
        dispatch('reply-saved', {
            event_id: post.event_id, 
            reply_count: post.reply_count
        })
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
        post.reply_count = countTotalEvents(data.replies)
        dispatch('reply-saved', {
            event_id: post.event_id, 
            reply_count: post.reply_count
        })
    }

}

let reply_count = post?.reply_count || 0

export let replying = false;
export let replyingTo = null;

let replyToEventAfterLogin = false;

$: if(authenticated && replyToEventAfterLogin)  {
    replyToPost()
    replyToEventAfterLogin = false
}

function replyToEvent(e) {
    if(!authenticated) {
        replyToEventAfterLogin = true
        store.startAuthenticating("login")
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
        store.startAuthenticating("login")
        return
    }
    replying = true
    replyingTo = post
    if(composer) {
        composer?.focusBodyInput()
    }
}

let composer;

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

async function redactReply(e) {
    console.log("redacting reply", e.detail)
    const del = confirm('Are you sure you want to delete this reply?');
    if (del) {
        let event = e.detail
        deleteEvent(data.replies, event.event_id)
        post.reply_count = countTotalEvents(data.replies)
        data.replies = data.replies

        let redaction = {
            room_id: event.room_id,
            event_id: event.event_id,
            reason: "redacted",
            is_reply: true,
        }
        const res = await redactEvent(redaction);
        console.log(res)
    }
    dispatch('reply-saved', {
        event_id: post.event_id, 
        reply_count: post.reply_count
    })
}

function edited(e) {
    dispatch('edited', e.detail)
    if(replyingTo) {
        if(replyingTo.event_id == e.detail.event_id) {
            replyingTo = e.detail
        }
    }
}

$: sender_id = $store.credentials?.matrix_user_id
$: isPostAuthor = sender_id === post?.sender?.id

async function pinReply(e) {
    console.log("pinning reply", e.detail)
    let event = data.replies.find(r => r.event_id == e.detail.event_id)
    if(!event?.reactions) {
        event.reactions = []
    }
    let index = event?.reactions?.findIndex(r => r.key == "pinned")
    if(index == -1) {
        data.replies = data.replies.map(r => {
            if(r.event_id == e.detail.event_id) {
                r.reactions = [...r.reactions, {
                    key: "pinned",
                }]
            }
            return r
        })

        let post = {
            room_id: event.room_id,
            type: "m.reaction",
            content: {
                "m.relates_to": {
                    "rel_type": "m.annotation",
                    "event_id": event.event_id,
                    "key": "pinned",
                }
            },
        }

        const res = await savePost(post);
        console.log(res)


    } else {
        data.replies = data.replies.map(r => {
            if(r.event_id == e.detail.event_id) {
                r.reactions = r?.reactions?.filter(r => r.key != "pinned")
            }
            return r
        })
        let redaction = {
            room_id: event.room_id,
            event_id: event.event_id,
            key: "pinned",
        }
        const res = await redactReaction(redaction);
        console.log(res)

    }
    data.replies = data.replies
}


$: joined = $store?.rooms.find(x => x === roomID) !== undefined

export function updateReactions(e) {
    post.reactions = e
    post = post
}

</script>

<section class="content" class:def={!embed} class:rep={replying}>
    <Header embed={embed}/>

    <section class="events" class:ovf={!embed}>

        {#if post}
            <Event 
                on:update-reactions 
                on:edited={edited}
                isPost={true} 
                isPostAuthor={isPostAuthor}
                on:redact
                event={post} 
                on:replyTo={replyToEvent}/>
        {:else}
            <SkeletonBoardEvent image={false}/>
        {/if}

        <div class="sep">
        </div>


        <div class="norep ph3 pv2 fl">
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

            {#if post && authenticated && joined}
                <div class="">
                    <button class="sbut" on:click={replyToPost}>Reply</button>
                </div>
            {/if}
        </div>

        {#if ready}
            {#if replies}
                {#each replies as reply}
                    <Event isReply={true} 
                        sender={post?.sender?.id}
                        on:set-reply-thread={setReplyThread}
                        on:redact={redactReply}
                        on:pin={pinReply}
                        event={reply} 
                        isPostAuthor={isPostAuthor}
                        on:replyTo={replyToEvent} />
                {/each}
            {/if}


        {:else}
            <SkeletonBoardEvents num={5} reply={true}/>
        {/if}

    </section>

    {#if ready && authenticated && joined && replying}
        <Composer 
            bind:this={composer}
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

.ovf {
    overflow-y: scroll;
}

.norep {
    border-bottom: 1px solid var(--ev-bb);
}

.rco {
    font-size: small;
    font-weight: 500;
}

@media screen and (max-width: 1280px) {
    .def {
        position: fixed;
        top: 0;
        right: 0;
        bottom: 0;
        left: 298px;
    }
}
@media screen and (max-width: 768px) {
    .def {
        position:static;
    }
    .norep {
        padding-top: 0.5rem;
        padding-bottom: 0.5rem;
    }
}
</style>

