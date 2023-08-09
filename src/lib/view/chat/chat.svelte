<script>
import { PUBLIC_API_URL, PUBLIC_API_URL_WS } from '$env/static/public';
import { redactEvent, loadPosts, getRoomMembers } from '$lib/utils/request.js'
import { onMount, afterUpdate, createEventDispatcher, tick } from 'svelte'
import { page } from '$app/stores';
import { joinSpace, joinRoom } from '$lib/utils/request.js'
import { goto } from '$app/navigation';
import { store } from '$lib/store/store.js'
import Event from '$lib/board/event/event.svelte'
import Header from '$lib/header/header.svelte'
import Memberships from '$lib/chat/event/membership/memberships.svelte'
import Topic from '$lib/chat/event/topic/topic.svelte'
import SkeletonChatEvents from '$lib/skeleton/skeleton-chat-events.svelte'
import Thread from '$lib/thread/thread.svelte'
import Members from '$lib/chat/members/members.svelte'

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

$: roomID = isRoom ? state?.children?.find(r => r?.alias ===
    $page?.params?.room)?.room_id : isSpace ? state?.room_id : null

$: space_room_id = state?.room_id
$: isSpaceRoom = roomID === space_room_id

$: joinedSpace = authenticated && 
    $store.rooms?.find(x => x === space_room_id) != null 

$: joinedRoom = authenticated && 
    $store?.rooms.find(x => x === roomID) != null 

const dispatch = createEventDispatcher()


let ready = false;

let login = () => {
    store.startAuthenticating("login")
}

let signup = () => {
    store.startAuthenticating("signup")
}

onMount(() => {
    loadMessages()
    fetchMembers()
})

async function fetchMembers() {
    const res = await getRoomMembers(roomID)
    console.log(res)
    if(res?.members) {
        $store.roomMembers[roomID] = res.members
    }
}

function updateScroll() {
    if(zone) {
        setTimeout(() => {
            zone.scrollTop = zone.scrollHeight;
        }, 40)
    }
}


afterUpdate(() =>{
    //updateScroll()
})

let _page = null;
let reloadTrigger;

let messages;

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

$: processed = process(messages)

$: if(reloadTrigger && ($page.params?.room != _page?.params?.room)) {
    loadMessages()
}

$: if(reloadTrigger && ($page.params?.topic != _page?.params?.topic)) {
    loadMessages()
}

$: isDomain = $page.params.domain !== undefined && 
    $page.params.domain !== 'undefined' && 
    $page.params.domain?.length > 0

$: is_context = $page.url?.searchParams?.get('context') !== null &&
    $page.url?.searchParams?.get('context') !== undefined &&
    $page.url?.searchParams?.get('context') !== ''
$: context_event_id = $page.url?.searchParams?.get('context')

async function loadMessages() {
    ready = false;
    messages = null
    if(socket) {
        socket.close()
    }
    let endpoint = PUBLIC_API_URL

    if(isDomain && $store.federated?.active && $store.federated.endpoint) {
        endpoint = $store.federated?.endpoint
    }

    let url = `${endpoint}/room/${roomID}/messages`
    if(is_context && context_event_id) {
        url = url + `?context=${context_event_id}`
    }

    if($page.params.topic) {
        url = url + `?topic=${$page.params.topic}`
        if(is_context && context_event_id) {
            url = url + `&context=${context_event_id}`
        }
    }

    let opt = {
      url: url,
      method: 'GET',
    }
    const resp = await loadPosts(opt)
    if(resp?.events) {
        messages = resp?.events.reverse()
        if(!is_context) {
            updateScroll()
        }
    }

    ready = true;
    _page = $page
    if(!is_context) {
        syncMessages()
    }
    setTimeout(() => {
        reloadTrigger = true
    }, 1000)
}

let sp;

let fetching = false;

let last_reached = false;

async function fetchMore() {
    //fetching = true;
    if(messages?.length < 50) {
        return
    }

    let endpoint = PUBLIC_API_URL

    let url = `${endpoint}/room/${roomID}/messages?last=${first}`

    let opt = {
      url: url,
      method: 'GET',
    }
    const resp = await loadPosts(opt)
    if(resp?.events?.length > 0) {
        fetching = false;
        sp = zone.scrollHeight - zone.scrollTop
        messages = [...resp?.events.reverse(), ...messages]
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

$: if(no_more) {
    syncMessages()
}

async function fetchForward() {
    loading_new = true;
    let endpoint = PUBLIC_API_URL

    let url = `${endpoint}/room/${roomID}/messages?after=${last}&order=ASC`

    let opt = {
      url: url,
      method: 'GET',
    }

    const resp = await loadPosts(opt)
    if(resp?.events?.length > 0) {
        messages = [...messages, ...resp?.events]
        loading_new = false;
    } else {
        no_more = true
        loading_new = false;
    }

}

let socket;

$: first = messages?.length > 0 ? messages[0]?.origin_server_ts : null

$: last = messages?.length > 0 ? messages[messages.length - 1]?.origin_server_ts : null

function syncMessages() {
    let reconnectDelay = 1000; // Initial reconnect delay in milliseconds
    let maxReconnectDelay = 60000; // Maximum reconnect delay in milliseconds
    let reconnectTimer; // Timer for the reconnect delay

    function scheduleReconnect() {
        if (reconnectTimer) {
            clearTimeout(reconnectTimer);
        }
        reconnectTimer = setTimeout(function () {
            console.log("Reconnecting to WebSocket server...");
            syncMessages();
        }, reconnectDelay);

        reconnectDelay = Math.min(reconnectDelay * 2, maxReconnectDelay);
    }

    let url = `${PUBLIC_API_URL_WS}/room/${roomID}/sync`

    /*
    if(last) {
        url = `${url}?after=${last}`
    }
    */

    socket = new WebSocket(url);

    console.log("syncing messages")

    socket.onopen = function () {
        console.log("Connected to sync messages server");
        socket.send(JSON.stringify({
            type: 'sync',
            last: last,
        }))
        reconnectDelay = 1000; 
    };

    socket.onmessage = function (e) {
        if(e?.data && e?.data != 'ping') {
            let event = JSON.parse(e.data)

            if (event && Array.isArray(event)) {
                let events = event.reverse()
                events?.forEach(e => {
                    let ind = messages.findIndex(m => m?.event_id === e?.event_id)

                    let is_thread = e?.content?.['m.relates_to']?.['rel_type'] == 'm.thread'

                    if(ind == -1 && !is_thread) {
                        messages = [...messages, e]
                    }
                })
            } else if (event && typeof event === 'object') {
                if(event.type == 'm.room.redaction') {
                    $store.redactedEvent = event
                    let ind = messages.findIndex(m => m?.event_id ===
                        event?.content?.redacts)
                    if(ind != -1) {
                        messages[ind].content = {
                            redacted: true,
                        }
                        messages = messages
                    }
                }

                if(event.type == 'm.room.member' || 
                event.type == 'm.room.name' || 
                event.type == 'space.board.post' || 
                event.type == 'm.room.topic') {
                    messages = [...messages, event]
                    messages = messages
                }

                if(event.type == 'm.reaction') {
                    addNewReaction(event)
                }


                let ind = messages.findIndex(m => m?.transaction_id ===
                    event?.transaction_id)

                let is_thread = event?.content?.['m.relates_to']?.['rel_type'] == 'm.thread'

                if(ind == -1 && !is_thread) {
                    messages = [...messages, event]
                }

                let isMR = event?.content?.['m.relates_to']?.rel_type == 'm.thread'

                if(ind == -1 && isMR) {
                    let event_id = event?.content?.['m.relates_to']?.event_id
                    const slug = event_id.substr(-11)

                    let pi = $store.thread_events.findIndex(m => m?.transaction_id === event.transaction_id)
                    if(pi == -1) {
                        store.addThreadEvent(slug, event)
                    }

                    let index = messages.findIndex(m => m?.event_id === event_id)
                    if(index != -1) {
                        if(!messages[index].thread_reply_count) {
                            messages[index].thread_reply_count = 0
                        }
                        messages[index].thread_reply_count += 1
                        event.content = JSON.stringify(event?.content)
                        messages[index].last_thread_reply = event
                        //messages = messages
                    }
                }
            }
            if(atBottom) {
                updateScroll()
            }
        }
    };

    socket.onclose = function (event) {
        console.log("WebSocket connection closed:", event.reason);
        scheduleReconnect();
    };

    socket.onerror = function (error) {
        console.log("WebSocket error:", error);
        scheduleReconnect();
    };

    setInterval(() => {
        if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({
                type: 'sync',
                last: last,
            }))
        }
    }, 30000);
}

function addNewReaction(e) {
    let txn_id = e?.transaction_id
    let mev = e?.content?.['m.relates_to']?.event_id
    let key = e?.content?.['m.relates_to']?.key
    let url = e?.content?.['m.relates_to']?.url
    let ind = messages.findIndex(m => m?.event_id === mev)
    if(ind != -1) {
        let event = messages[ind]
        let sender = e?.sender?.id

        if(event?.reactions) {
            // check if reaction key exists
            let i = event?.reactions?.findIndex(r => r.key === key);
            console.log("does emoji exist?", i)
            // add sender if it does
            if (i !== -1) {
                // check if sender exists 
                let j = event?.reactions[i].senders.findIndex(s => s?.transaction_id === txn_id);
                if(j === -1) {
                    // if it doesn't, add sender
                    event?.reactions[i].senders.push({
                        sender: sender,
                        event_id: e.event_id
                    });
                }

                // if there are no senders, remove reaction
                if(event?.reactions[i].senders.length === 0) {
                    event?.reactions.splice(i, 1);
                }
            // if not, add new reaction with sender
            } else {
                let newReaction = {
                    key: key,
                    senders: [{
                        sender: sender,
                        event_id: e.event_id
                    }]
                };
                if(url) newReaction.url = url

                event.reactions.push(newReaction);
            }
        } else {
            let newReaction = {
                key: key,
                senders: [{
                    sender: sender,
                    event_id: e.event_id
                }]
            };
            if(url) newReaction.url = url

            event.reactions = [newReaction];
        } 
        event.reactions = event.reactions
        messages = messages
    }
}

async function isTyping() {
    /*
    if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({
            type: 'typing',
            value: $store?.credentials?.matrix_user_id
        }));
    }
    */
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
    observer.observe(ob);
}

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

    let observer = new IntersectionObserver(callback, options);
    observer.observe(rob);
}

let atBottom;

function trackScroll(e) {
    if(fetching) {
        e.preventDefault()
    }
    atBottom = zone.scrollTop + zone.clientHeight >= zone.scrollHeight - 100;
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
    messages = [...messages, event]

    await tick()
    updateScroll()
}

async function saved(e) {
    let event = e.detail.event
    event.transaction_id = e.detail.transaction_id
    let transaction_id = e.detail.transaction_id
    const index = messages.findIndex(i => i.transaction_id === transaction_id);
    if(index !== -1) {
        messages[index] = event
        messages = messages
    }
    last =  event.origin_server_ts
}

async function redactPost(e) {
    const event = e.detail
    const index = messages.findIndex(i => i.event_id === event.event_id);
    if(index !== -1) {
        messages[index].content = {
            redacted: true,
        }
        messages = messages
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
    if(atBottom) {
        updateScroll()
    }
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

</script>




<section class="space-container"
    bind:this={container}
    class:thread={isThread}>

    <div class="inner-area" 
        class:ina={isThread}>

        <Header 
            on:toggle-view/>

        <div class="inner" class:users={showUsers}>

            <div class="inner-content fl-co" 
                class:pbr={ready}
                on:scroll={trackScroll}
                bind:this={zone}>

                <div class="ob" bind:this={ob}></div>

                {#if !ready}
                    <SkeletonChatEvents />
                {:else}

                    <div class="messages fl-co fl-o">
                        <div class="emp fl-o"></div>

                    {#if fetching}
                        <SkeletonChatEvents embed={true} />
                    {/if}

                    {#if processed}
                        {#each processed as message, i}
                            {#if message?.type === 'm.room.message'}
                                <Event 
                                    isChat={true}
                                    index={i}
                                    on:replyTo={reply}
                                    on:reacted={reacted}
                                    on:redact={redactPost}
                                    messages={processed}
                                    event={message} 
                                    on:saved={saved}
                                    sender={null} />
                            {/if}
                            {#if message?.type === 'm.room.members'}
                                    <Memberships
                                    memberships={message}/>
                            {/if}
                            {#if message?.type === 'm.room.topic'}
                                <Topic event={message}/>
                            {/if}
                            {#if message?.type === 'space.board.post'}
                                <Event 
                                    isChat={true}
                                    isBoardPostInChat={true}
                                    on:replyTo={reply}
                                    on:reacted={reacted}
                                    on:redact={redactPost}
                                    messages={processed}
                                    event={message} 
                                    on:saved={saved}
                                    sender={null} />
                            {/if}
                        {/each}
                    {/if}

                    {#if loading_new}
                        <SkeletonChatEvents embed={true} />
                    {/if}


                    </div>
                {/if}


                {#if is_context}
                <div class="rob" bind:this={rob}></div>
                {/if}

            </div>

            {#if showUsers}
                <Members room_id={roomID}/>
            {/if}

        </div>

        <div class="com grd">
        {#if ready}
            {#if Composer && joinedRoom}
                <div class="chat-composer">
                    <Composer 
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
            {:else if !authenticated}
                <div class="grd">
                    <div class="comm">
                            <span class="sp" on:click={login}>Login</span> or <span
                                class="sp" on:click={signup}>Sign up</span> to chat
                    </div>
                </div>
            {/if}
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

.users {
    grid-template-columns: 1fr 250px;
}


.inner-content {
    overflow-y: auto;
    overflow-x: hidden;
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

</style>


