<script>
import { PUBLIC_API_URL, PUBLIC_API_URL_WS } from '$env/static/public';
import { redactEvent, loadPosts } from '$lib/utils/request.js'
import { onMount, afterUpdate, createEventDispatcher, tick } from 'svelte'
import { page } from '$app/stores';
import { joinSpace, joinRoom } from '$lib/utils/request.js'
import { goto } from '$app/navigation';
import { store } from '$lib/store/store.js'
import Event from '$lib/board/event/event.svelte'
import Header from '$lib/header/header.svelte'
import Post from '$lib/post/post.svelte'
import SkeletonChatEvents from '$lib/skeleton/skeleton-chat-events.svelte'
import { v4 as uuidv4 } from 'uuid';

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
})

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

$: if(reloadTrigger && ($page.params?.room != _page?.params?.room)) {
    loadMessages()
}

$: if(reloadTrigger && ($page.params?.topic != _page?.params?.topic)) {
    loadMessages()
}

async function loadMessages() {
    ready = false;
    messages = null
    if(socket) {
        socket.close()
    }
    let endpoint = PUBLIC_API_URL

    let url = `${endpoint}/room/${roomID}/messages`

    if($page.params.topic) {
        url = url + `?topic=${$page.params.topic}`
    }

    let opt = {
      url: url,
      method: 'GET',
    }
    const resp = await loadPosts(opt)
    console.log(resp)
    if(resp?.events) {
        messages = resp?.events.reverse()
        updateScroll()
    }

    ready = true;
    _page = $page
    syncMessages()
    setTimeout(() => {
        reloadTrigger = true
    }, 1000)
}

let sp;

let fetching = false;
async function fetchMore() {
    if(messages?.length < 50) {
        return
    }

    let endpoint = PUBLIC_API_URL

    let url = `${endpoint}/room/${roomID}/messages?last=${first}`

    let opt = {
      url: url,
      method: 'GET',
    }
    fetching = true;
    const resp = await loadPosts(opt)
    console.log(resp)
    if(resp?.events?.length > 0) {
        sp = zone.scrollHeight - zone.scrollTop
        messages = [...resp?.events.reverse(), ...messages]
        maintainScroll()
    }
}

async function maintainScroll() {
    await tick();
    zone.scrollTop = zone.scrollHeight - sp;
    fetching = false;
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
                    if(ind == -1) {
                        messages = [...messages, e]
                    }
                })
            } else if (event && typeof event === 'object') {
                if(event?.sender?.id == $store?.credentials?.matrix_user_id) {
                    return
                }
                let ind = messages.findIndex(m => m?.origin_server_ts === event?.event_id)
                console.log("got new event from socket", event)
                if(ind == -1) {
                    messages = [...messages, event]
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

$: if(ob && ready) {
    setTimeout(() => {
        setupObserver()
    }, 1000)
}

let scrollHeight;
function setupObserver() {
    scrollHeight = zone?.scrollHeight;
    let options = {
        root: zone,
        rootMargin: `${scrollHeight/2}px`,
    };

    let callback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                fetchMore()
            }
        });
    };

    let observer = new IntersectionObserver(callback, options);
    observer.observe(ob);
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
        const resp = await joinSpace($page.params.space);
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
    let message = e.detail
    console.log("building new message evet", message)
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
        room_id: roomID,
        unsent: true,
        session: uuidv4(),
    }
    messages = [...messages, event]

    await tick()
    updateScroll()
}

async function saved(e) {
    let event = e.detail.event
    let session = e.detail.session
    const index = messages.findIndex(i => i.session === session);
    if(index !== -1) {
        messages[index] = event
        messages = messages
        console.log("event saved", event)
    }
    last =  event.origin_server_ts
    console.log("last is", last)
}

async function redactPost(e) {
    const event = e.detail
    const index = messages.findIndex(i => i.event_id === event.event_id);
    if(index !== -1) {
        messages.splice(index, 1);
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

</script>




<section class="space-container">

    <div class="inner-area" >

        <Header />

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

                {#if messages}
                    {#each messages as message, i}
                        {#if message?.type === 'm.room.message'}
                            <Event 
                                isChat={true}
                                index={i}
                                on:reacted={reacted}
                                on:redact={redactPost}
                                messages={messages}
                                event={message} 
                                on:saved={saved}
                                sender={null} />
                        {/if}
                    {/each}
                {/if}


                </div>
            {/if}

        </div>

        <div class="com grd">
        {#if ready}
            {#if Composer && joinedRoom}
                <div class="chat-composer">
                    <Composer 
                        topic={$page.params.topic}
                        on:typing={isTyping}
                        on:new-message={newMessage}
                        roomID={roomID} 
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


</section>



<style>

.space-container {
    display: grid;
    grid-template-columns: auto;
    grid-template-columns: auto;
    overflow: hidden;
}

.inner-area {
    display: grid;
    grid-template-columns: auto;
    grid-template-rows: 48px 1fr auto;
    overflow: hidden;
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


