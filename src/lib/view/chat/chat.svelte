<script>
import { PUBLIC_API_URL, PUBLIC_API_URL_WS } from '$env/static/public';
import { redactEvent, loadPosts, getRoomMembers } from '$lib/utils/request.js'
import { onMount, onDestroy, afterUpdate, createEventDispatcher, tick } from 'svelte'
import { page } from '$app/stores';
import { joinSpace, joinRoom } from '$lib/utils/request.js'
import { goto } from '$app/navigation';
import { store } from '$lib/store/store.js'
import { down } from '$lib/assets/icons.js'
import EventProcessor from '$lib/chat/event/processor.svelte'
import Header from '$lib/header/header.svelte'
import VirtualList from '$lib/components/virtual-list/virtual-list.svelte'
import Memberships from '$lib/chat/event/membership/memberships.svelte'
import Topic from '$lib/chat/event/topic/topic.svelte'
import SkeletonChatEvents from '$lib/skeleton/skeleton-chat-events.svelte'
import Thread from '$lib/thread/thread.svelte'
import Members from '$lib/chat/members/members.svelte'

$: session = $store.verifiedSession

$: authenticated = $store?.authenticated && 
    $store?.credentials != null
    $store?.credentials?.access_token?.length > 0

let Composer;
$: if(authenticated) {
    import('$lib/composer/composer.svelte').then(m => {
        Composer = m.default
    })
}


$: state = $store?.states[$page?.params?.space]

$: isSpace = $page?.params?.space !== undefined && $page?.params?.space !== null && $page?.params?.space !== '' 
$: isRoom = $page?.params?.room !== undefined && $page?.params?.room !== null && $page?.params?.room !== '' 
$: isTopic = $page?.params?.topic !== undefined && $page?.params?.topic !== null && $page?.params?.topic !== ''

$: roomID = isRoom ? state?.children?.find(r => r?.alias ===
    $page?.params?.room)?.room_id : isSpace ? state?.room_id : null

$: space_room_id = state?.room_id
$: isSpaceRoom = roomID === space_room_id

$: joinedSpace = authenticated && 
    $store.rooms?.find(x => x === space_room_id) != null 

$: joinedRoom = authenticated && 
    $store?.rooms.find(x => x === roomID) != null 

const dispatch = createEventDispatcher()


export let loaded = false;
export let showChatView = false;

$: if(loaded) {
    forceScroll()
}

let ready = false;

let login = () => {
    store.startAuthenticating("login")
}

let signup = () => {
    store.startAuthenticating("signup")
}

let wrap;

onMount(() => {
    wrap.scrollTop = wrap.scrollHeight;

    if(showChatView) {
        loadMessages()
    } else {
        setTimeout(() => {
            loadMessages()
        }, 2000)
    }
    fetchMembers()
})

onDestroy(() => {
    if(socket) {
        socket.close()
    }
})

async function fetchMembers() {
    const res = await getRoomMembers(roomID)
    console.log(res)
    if(res?.members) {
        $store.roomMembers[roomID] = res.members
    }
}

export function forceScroll() {
    updateScroll()
}
export function scrollToBottom() {
    if(atBottom) {
        updateScroll()
    }
}

function updateScroll() {
    if(zone) {
        zone.scrollTop = zone.scrollHeight;
    }
}


afterUpdate(() =>{
    //updateScroll()
})

let _page = null;
let reloadTrigger;


function process(m) {
    if(!m) return []
    let processedEvents = [];
    let currentMembershipEvents = [];

    for (const event of m) {
    if (event.type === 'm.room.member') {
        if(!event?.sender?.display_name) {
            event.sender.display_name = event.sender.user_id
        }
        if (!currentMembershipEvents) {
        // If there is no ongoing aggregation, start a new one
            currentMembershipEvents = [event];
        } else {
        // If there is an ongoing aggregation, continue adding to it
            currentMembershipEvents.push(event);
        }
    } else {
        // If the current event is not a membership event, add the aggregated membership events
        if (currentMembershipEvents.length > 0) {
            processedEvents.push({
                type: 'm.room.members',
                events: currentMembershipEvents,
            });
            currentMembershipEvents = []; // Clear the temporary array for the next group of events
        }

    // Add the non-membership event to the processedEvents array
        processedEvents.push(event);
        }
    }

  // If there are any remaining membership events at the end, add them as an aggregated group
    if (currentMembershipEvents.length > 0) {
        processedEvents.push({
            type: 'm.room.members',
            events: currentMembershipEvents,
        });
    }
    return processedEvents
}


$: topicEvents = $store.events[roomID]?.chat.filter(e => e.content?.topic != null && e.content?.topic == $page.params.topic)
$: nonTopicEvents = $store.events[roomID]?.chat.filter(e => !e.content?.topic)

$: filtered = isTopic ? topicEvents : nonTopicEvents

$: processed = process(filtered)

$: if(reloadTrigger && ($page.params?.room != _page?.params?.room)) {
    loadMessages()
}

$: if(reloadTrigger && ($page.params?.topic != _page?.params?.topic)) {
    loadMessages()
}

$: if(reloadTrigger && ($page.url?.searchParams.get('context') != 
    _page?.url?.searchParams.get('context'))) {

    let old = _page?.url?.searchParams.get('context')
    let new_ = $page.url?.searchParams.get('context')

    if(!lockContext) {
        setTimeout(() => {
            loadMessages()
        }, 10)
    } else {
        lockContext = false
        _page = $page
    }
}

$: isDomain = $page.params.domain !== undefined && 
    $page.params.domain !== 'undefined' && 
    $page.params.domain?.length > 0

$: is_context = $page.url?.searchParams?.get('context') !== null &&
    $page.url?.searchParams?.get('context') !== undefined &&
    $page.url?.searchParams?.get('context') !== ''
$: context_event_id = $page.url?.searchParams?.get('context')

let skeleton;

$: if(skeleton) {
    skeleton.scrollTop = skeleton.scrollHeight;
}

async function loadMessages() {
    ready = false;
    last_reached = false;

    let existing = $store.events[roomID]?.chat?.length > 0
    if(existing) {
        if(!is_context) {
            requestAnimationFrame(() => {
                updateScroll()
            })
        }

        _page = $page
        if(!is_context) {
            syncMessages()
        }
        setTimeout(() => {
            reloadTrigger = true
        }, 1000)
        ready = true
        return
    }



    if(socket) {
        socket.close()
    }
    let endpoint = PUBLIC_API_URL

    if(isDomain && $store.federated?.active && $store.federated.endpoint) {
        endpoint = $store.federated?.endpoint
    }

    let url = `${endpoint}/room/${roomID}/messages`

    if($page.params.topic) {
        url = url + `?topic=${$page.params.topic}`
    }

    if(is_context && context_event_id) {
        if($page.params.topic) {
            url = url + `&context=${context_event_id}`
        } else {
            url = url + `?context=${context_event_id}`
        }
    }

    let opt = {
      url: url,
      method: 'GET',
    }
    const resp = await loadPosts(opt)
    if(resp?.events) {
        if(!$store.events[roomID]) {
            $store.events[roomID] = {chat: [], board: []}
        }
        $store.events[roomID].chat = resp.events.reverse()
        if(!is_context) {
            requestAnimationFrame(animate)
            forceScroll()
            if(composer) {
                composer.focusBodyInput()
            }
        }
    }
    ready = true


    _page = $page
    if(!is_context) {
        syncMessages()
    }
    setTimeout(() => {
        reloadTrigger = true
    }, 1000)
}

$: if(ready && !is_context) {
    requestAnimationFrame(animate);
}

let st;
function animate(ts) {
    if (!st) {
      st = ts;
    }
    const et = ts - st;
    if (et < 1000) { 
      updateScroll();
      requestAnimationFrame(animate);
    }
}

function mounted() {
  requestAnimationFrame(animate);
}

let sp;

let fetching = false;

let last_reached = false;

async function fetchMore() {
    //fetching = true;

    let endpoint = PUBLIC_API_URL

    let url = `${endpoint}/room/${roomID}/messages?last=${first}`

    if(isTopic) {
        url = url + `&topic=${$page.params.topic}`
    }

    let opt = {
      url: url,
      method: 'GET',
    }
    const resp = await loadPosts(opt)
    if(resp?.events?.length > 0) {
        fetching = false;
        sp = zone.scrollHeight - zone.scrollTop

        store.unshiftChatEvents(roomID, resp?.events.reverse())

        maintainScroll()
    } else {
        fetching = false;
        last_reached = true;
    }
}

async function maintainScroll() {
    await tick();
    zone.scrollTop = zone.scrollHeight - sp;
    fetching = false;
}

let loading_new = false;

let no_more = false;

$: if(is_context) {
    no_more = false
}

$: if(no_more) {
    syncMessages()
}

async function fetchForward() {
    loading_new = true;
    let endpoint = PUBLIC_API_URL

    let url = `${endpoint}/room/${roomID}/messages?after=${last}&order=ASC`

    if(isTopic) {
        url = url + `&topic=${$page.params.topic}`
    }

    let opt = {
      url: url,
      method: 'GET',
    }

    const resp = await loadPosts(opt)
    if(resp?.events?.length > 0) {

        store.addChatEvents(roomID, resp?.events)

        loading_new = false;
    } else {
        no_more = true
        loading_new = false;
    }

}

let socket;


$: first = $store.events[roomID]?.chat?.length > 0 ?
    $store.events[roomID]?.chat[0]?.origin_server_ts : null
$: last = $store.events[roomID]?.chat?.length > 0 ?
    $store.events[roomID]?.chat[$store.events[roomID].chat.length - 1]?.origin_server_ts : null

let typing = []

function syncMessages() {
    dispatch('sync', true)
}

async function isTyping() {
    if (socket?.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({
            type: 'typing',
            value: $store?.credentials?.matrix_user_id
        }));
    }
}

let zone;

let ob;
let rob;

$: if(ob && ready) {
    setTimeout(() => {
        setupObserver()
    }, 3000)
}

$: if(is_context && rob && ready) {
    setTimeout(() => {
        setupReverseObserver()
    }, 3000)
}

let scrollHeight;
function setupObserver() {
    scrollHeight = zone?.scrollHeight;

    let sc = scrollHeight / 2

    if(is_context) {
        sc = 200
    }

    let options = {
        root: zone,
        rootMargin: `${sc}px`,
    };

    let callback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if(!last_reached) {
                    fetchMore()
                }
            }
        });
    };

    let observer = new IntersectionObserver(callback, options);
    if(ob) {
        observer.observe(ob);
    }
}

let revob;
function setupReverseObserver() {
    let options = {
        root: zone,
        rootMargin: `200px`,
    };

    let callback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if(!no_more) {
                    fetchForward()
                }
            }
        });
    };

    revob = new IntersectionObserver(callback, options);
    if(rob) {
        revob.observe(rob);
    }
}


let atBottom = false;

function trackScroll(e) {
    if(fetching) {
        e.preventDefault()
    }
    atBottom = zone?.scrollTop + zone?.clientHeight >= zone?.scrollHeight - 100;
}

let busy = false;

async function join() {
    if(!authenticated) {
        store.startAuthenticating("login")
        return
    }
    busy = true
    if(!joinedSpace) {
        const resp = await joinSpace(state?.room_id);
        if(resp && resp.space) {
            console.log(resp)
            store.addSpace(resp.space)
            store.addRoom(resp.space.room_id)
            store.updateRoomJoinStatus($page.params.space, roomID)
        }
        if(resp && resp?.error) {
            console.log(resp)
            $store.alert = {
                active: true,
                message: resp.error
            }
        }
    } 

    if(!isSpaceRoom) {
        const resp = await joinRoom(roomID);
        if(resp && resp?.joined && resp.room_id) {
            console.log(resp)
            store.addRoom(resp.room_id)
            store.updateRoomJoinStatus($page.params.space, roomID)
        }
        if(resp && resp?.error) {
            console.log(resp)
            $store.alert = {
                active: true,
                message: resp.error
            }
        }
    }
    busy = false
}

$: buttonText = busy ? "Joining..." : "Join to start chatting"

async function newMessage(e) {
    if(replying) {
        replying = false
        replyToEvent = null
    }

    let message = e.detail
    let event = {
        content: message.content,
        type: 'm.room.message',
        sender: {
            id: $store.credentials.matrix_user_id,
            display_name: $store.credentials.display_name,
            avatar_url: $store.credentials.avatar_url,
            username: $store.credentials.username,
        },
        origin_server_ts: new Date().getTime(),
        event_id: `local-${Date.now()}`,
        slug: `slug-${Date.now()}`,
        room_id: roomID,
        unsent: true,
        transaction_id: `co${Date.now()}`,
    }
    store.addChatEvent(roomID, event)

    await tick()
    updateScroll()
    requestAnimationFrame(animate);
}

async function saved(e) {
    let event = e.detail.event
    event.transaction_id = e.detail.transaction_id
    let transaction_id = e.detail.transaction_id
    const index = $store.events[roomID]?.chat.findIndex(i => i.transaction_id === transaction_id);
    if(index !== -1) {
        $store.events[roomID].chat[index] = event
    }
    //last =  event.origin_server_ts
}

async function redactPost(e) {
    const event = e.detail
    const index = $store.events[roomID].chat.findIndex(i => i.event_id === event.event_id);
    if(index !== -1) {
        $store.events[roomID].chat[index].content = {
            redacted: true,
        }
    }

    let redaction = {
        room_id: event.room_id,
        event_id: event.event_id,
        reason: "redacted",
    }
    const res = await redactEvent(redaction);
    console.log(res)
}

async function reacted(e) {
        updateScroll()
}

let replying = false;
let replyToEvent;

function reply(e) {
    let event = e.detail
    replying = true
    replyToEvent = event
    setTimeout(() => {
        zone.scrollTop = zone.scrollHeight;
    }, 10)
}
function cancelReply() {
    replying = false
    replyToEvent = null
}

$: queryExists = $page.url.search.length > 0
$: threadQuery = $page.url.searchParams.get('thread')

$: isThread = threadQuery && threadQuery.length > 0 && !showUsers

let container;

$: showUsers = $store.showRoomUsers


$: hasScrolled = zone?.scrollHeight > zone?.clientHeight || zone?.scrollTop > 0

$: addBorder = showUsers && !hasScrolled

function focusReplyEvent(e) {
    let event_id = e.detail

    let index = $store.events[roomID].chat.findIndex(i => i.event_id === event_id);
    if(index !== -1) {
        let el = document.getElementById(`event-${event_id}`)
        if(el) {
            el.scrollIntoView({behavior: "smooth", block: "center", inline: "nearest"})
        }
    } else {
        let slug = event_id.slice(-11)
        let url = `/`
        if($page.params?.space) {
            url = `/${$page.params?.space}`
        }
        if($page.params?.room) {
            url = `/${$page.params?.space}/${$page.params?.room}`
        }
        if($page.params.topic) {
            url = url + `/topic/${$page.params?.topic}`
        }
        if($page.url.search.includes('?view=chat')) {
            url = `${url}?view=chat&context=${slug}`
        } else {
            url = `${url}?context=${slug}`
        }
        goto(url)
    }
}

function goDown() {
    zone.scrollTop = zone.scrollHeight;
}

let jumping = false;

let composer;

async function jumpToLatest() {

    if(no_more) {
        goDown()
        return
    }
    jumping = true

    if(revob) {
        revob.disconnect()
    }


    let endpoint = PUBLIC_API_URL

    if(isDomain && $store.federated?.active && $store.federated.endpoint) {
        endpoint = $store.federated?.endpoint
    }

    let url = `${endpoint}/room/${roomID}/messages`

    if($page.params.topic) {
        url = url + `?topic=${$page.params.topic}`
    }

    let opt = {
      url: url,
      method: 'GET',
    }
    const resp = await loadPosts(opt)
    if(resp?.events) {
        jumping = false
        no_more = true
        requestAnimationFrame(animate);

        $store.events[roomID].chat = resp.events.reverse()

        composer.focusBodyInput()

        purgeContext()
    }
}

let lockContext = false

function purgeContext() {
    lockContext = true
    let url = `/`
    if($page.params?.space) {
        url = `/${$page.params?.space}`
    }
    if($page.params?.room) {
        url = `/${$page.params?.space}/${$page.params?.room}`
    }

    if($page.params?.topic) {
        url = `/${$page.params?.space}/${$page.params?.room}/topic/${$page.params?.topic}`
    }

    if($page.url.search.includes('?view=chat')) {
        url = `${url}?view=chat`
    }

    goto(url)
    setTimeout(() => {
        composer.focusBodyInput()
    }, 10)
}

function attached() {
    updateScroll()
    composer.focusBodyInput()
}

function attachmentDeleted() {
    composer.focusBodyInput()
}

export async function focusComposer() {
    await tick()
    setTimeout(() => {
        if(composer) {
            composer.focusBodyInput()
        }
    }, 10)
}

$: scrolled = zone ? zone?.scrollHeight > zone?.clientHeight : false

</script>




<section class="space-container"
    bind:this={container}
    class:thread={isThread}>

    <div class="inner-area" 
        class:ina={isThread}>

        <Header 
            on:toggle-view/>

        <div class="inner" class:users={showUsers}>

            <div class="inner-wrap" class:inw={ready} bind:this={wrap}>

                {#if !ready}
                    <div class="mask-s" bind:this={skeleton}>
                        <SkeletonChatEvents />
                    </div>
                {/if}


                <div class="inner-content fl-co" 
                    class:adbo={addBorder}
                    class:pbr={ready}
                    on:scroll={trackScroll}
                    bind:this={zone}>


                    <div class="ob" bind:this={ob}></div>


                        <div class="messages fl-co fl-o">
                            <div class="emp fl-o"></div>

                        {#if fetching}
                            <SkeletonChatEvents embed={true} />
                        {/if}

                        {#if processed}
                            {#each processed as message, i}
                                    <EventProcessor
                                        on:mounted={mounted}
                                        index={i}
                                        on:replyTo={reply}
                                        on:reacted={reacted}
                                        on:redact={redactPost}
                                        messages={processed}
                                        on:focus-reply={focusReplyEvent}
                                        event={message} 
                                        on:saved={saved} />
                            {/each}
                        {/if}


                        {#if loading_new}
                            <SkeletonChatEvents embed={true} />
                        {/if}


                        </div>



                    {#if is_context}
                    <div class="rob" bind:this={rob}></div>
                    {/if}



                </div>

                    {#if reloadTrigger && !atBottom && !is_context && scrolled}
                        <div class="c-ico go-down" on:click={goDown}>
                            {@html down}
                        </div>
                    {/if}

                    {#if ready && !no_more && is_context}
                        <div class="jump fl" on:click={jumpToLatest}>

                            <div class="grd-c fl-o">
                                <div class="grd-c">
                                You're viewing older messages
                                </div>
                            </div>


                            <div class="grd-c fl">
                                <div class="grd-c">
                                    Jump to latest
                                </div>
                                {#if jumping}
                                    <div class="sloader ml2 mr1">
                                    </div>
                                {:else}
                                    <div class="ml1 ico-s grd-c">
                                        {@html down}
                                    </div>
                                {/if}
                            </div>


                        </div>
                    {/if}

            </div>

            {#if showUsers}
                <Members room_id={roomID}/>
            {/if}

        </div>

        <div class="com grd">
            {#if Composer && authenticated && joinedRoom}
                <div class="chat-composer">
                    <Composer 
                        on:attached={attached}
                        on:deleted={attachmentDeleted}
                        bind:this={composer}
                        topic={$page.params.topic}
                        on:typing={isTyping}
                        reply={replying}
                        replyTo={replyToEvent}
                        on:new-message={newMessage}
                        roomID={roomID} 
                        room_alias={$page.params.space}
                        on:kill={cancelReply}
                        isChat={true} />
                </div>
            {:else if authenticated && !joinedRoom}
                    <div class="grd">
                        <div class="grd-c rel">
                            <button class="but ph4" 
                                disabled={busy}
                                on:click={join}>
                                {buttonText}
                            </button>
                            {#if busy}
                                <div class="spinner">
                                    <div class="sloader"></div>
                                </div>
                            {/if}
                        </div>
                    </div>
            {:else if session && !authenticated}
                <div class="grd">
                    <div class="comm">
                            <span class="sp" on:click={login}>Login</span> or <span
                                class="sp" on:click={signup}>Sign up</span> to chat
                    </div>
                </div>
            {/if}


        </div>

    </div>

    {#if isThread}
        <Thread />
    {/if}




</section>



<style>

.space-container {
    display: grid;
    grid-template-columns: auto;
    grid-template-columns: auto;
    overflow: hidden;
}

.thread {
    grid-template-columns: 1fr 500px;
}

.inner-area {
    display: grid;
    grid-template-columns: auto;
    grid-template-rows: 48px 1fr auto;
    overflow: hidden;
}

.ina {
    border-right: 1px solid var(--border-1);
}

.inner {
    display: grid;
    overflow-y: auto;
    overflow-x: hidden;
}

.inner-wrap {
    display: grid;
    position: relative;
    overflow:hidden;
}

.inw {
    overflow-y: auto;
    overflow-x: hidden;
}

.users {
    grid-template-columns: 1fr 250px;
}


.inner-content {
    overflow-y: auto;
    overflow-x: hidden;
    position:relative;
}

.mask-s {
    background: var(--bg);
    position:absolute;
    top:0;
    left:0;
    right:0;
    bottom:0;
    z-index: 2000;
    overflow-y: auto;
    scrollbar-width: none; 
    -ms-overflow-style: none; 
}

.mask-s::-webkit-scrollbar {
    display: none; 
}

.go-down {
    opacity: 1;
    position: absolute;
    padding: 0.5rem;
    cursor: pointer;
    border-radius: 50%;
    background: var(--primary);
    fill: var(--text-1);
    z-index: 1000;
    bottom: 1rem;
    right: 1rem;
}

.jump {
    opacity: 1;
    position: absolute;
    padding: 0.3rem 0.75rem;
    cursor: pointer;
    border-radius: 7px 7px 0 0;
    background: var(--shade-4);
    fill: var(--text-1);
    z-index: 1000;
    bottom: 0;
    right: 0;
    left: 0;
    font-size: 12px;
    font-weight: 500;
    color: vat(--text-1);
    letter-spacing: 1px;
    min-height: 20px;
}

.jump:hover {
    background: var(--shade-3);
}

.pbr {
    padding-bottom: 1rem;
}

.chat-composer {
}

.com {
    border-top: 1px solid var(--border-1);
    min-height: 55px;
}
.comm {
    align-self: center;
    justify-self: center;
    color: var(--text-light);
    margin-left: 1rem;
}

@media screen and (max-width: 1280px) {
    .post {
        grid-template-columns: auto;
    }
    .thread {
        grid-template-columns: 1fr;
    }

}


@media screen and (max-width: 768px) {
    .inner-area {
        position: static;
    }
    .post {
        grid-template-columns: auto;
    }
    .ina {
        display: none;
    }
}

.spinner {
    position: absolute;
    top: 3px;
    right: 5px;
}
.but {
    width: 100%;
    height: 30px;
}
.sp {
    font-weight: 500;
    color: var(--primary);
    cursor: pointer;
}

.sp:hover {
    text-decoration: underline;
}

.adbo {
    border-right: 1px solid var(--border-1);
}
.sloader {
    border-top: 2px solid var(--text-1);
    border-right: 2px solid var(--text-1);
    border-bottom: 2px solid var(--text-1);
    height: 8px;
    width: 8px;
}
</style>


