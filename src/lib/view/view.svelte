<script>
import { PUBLIC_API_URL_WS } from '$env/static/public';
import { APIRequest } from '$lib/utils/request.js'
import { onMount, tick, createEventDispatcher } from 'svelte'
import { page } from '$app/stores';
import { store } from '$lib/store/store.js'
import Board from './board/board.svelte'
import Chat from './chat/chat.svelte'
import SkeletonBoardEvents from '$lib/skeleton/skeleton-board-events.svelte'
import Header from '$lib/header/header.svelte'
import NotFound from '$lib/errors/not-found.svelte'

$: isSpace = $page?.params?.space !== undefined && $page?.params?.space !== null && $page?.params?.space !== '' 
$: isRoom = $page?.params?.room !== undefined && $page?.params?.room !== null && $page?.params?.room !== '' 
$: isTopic = $page?.params?.topic !== undefined && $page?.params?.topic !== null && $page?.params?.topic !== ''

$: state = $store?.states[$page?.params?.space]

$: roomID = isRoom ? state?.children?.find(r => r?.alias ===
    $page?.params?.room)?.room_id : isSpace ? state?.room_id : null

$: defaultView = isRoom ? state?.children?.find(r => r?.alias ===
    $page?.params?.room)?.type : isSpace ? state?.space?.type : null

$: isChat = defaultView === 'chat'
$: isBoard = defaultView === 'board'

$: isProfile = defaultView === 'profile'



$: ready = $store.stateReady

$: query = $page.url.search
$: queries = $page.url.searchParams

$: queryExists = $page.url.search.length > 0
$: viewQuery = $page.url.searchParams.get('view')

$: chatView = viewQuery === 'chat'
$: boardView = viewQuery === 'board'

$: showBoardView = (!viewQuery && isBoard) || boardView
$: showChatView = (!viewQuery && isChat) || chatView


$: space_exists = $store?.states[$page?.params?.space]?.exists != false

$: isRoom = $page.params?.room !== undefined && $page.params?.room !== null && $page.params?.room !== ''

$: room_exists = isRoom &&
    $store?.states[$page?.params?.space]?.children?.find(r => r?.alias ===
        $page?.params?.room) != null

function mounted() {
    if(showChatView) {
        console.log("LOAD board events")
    } else if(showBoardView) {
        console.log("chat board events")
    }
}

let socket;
let typing = []

$: firstChatEvent = $store.events[roomID]?.chat?.length > 0 ?
    $store.events[roomID]?.chat[0]?.origin_server_ts : null
$: lastChatEvent = $store.events[roomID]?.chat?.length > 0 ?
    $store.events[roomID]?.chat[$store.events[roomID].chat.length - 1]?.origin_server_ts : null

function syncMessages() {
    let reconnectDelay = 1000;
    let maxReconnectDelay = 60000; 
    let reconnectTimer; 

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

    socket = new WebSocket(url);

    console.log("syncing messages")

    socket.onopen = function () {
        socket.send(JSON.stringify({
            type: 'sync',
            last: lastChatEvent,
        }))
        reconnectDelay = 1000; 
    };

    socket.onmessage = function (e) {
        if(e?.data && e?.data != 'ping') {
            let event = JSON.parse(e.data)

            if(event?.type == 'typing') {
                typing = [...typing, event?.value]
            }

            if (event && Array.isArray(event)) {
                let events = event.reverse()
                events?.forEach(e => {
                    let ind = $store.events[roomID].chat.findIndex(m => m?.event_id === e?.event_id)

                    let is_thread = e?.content?.['m.relates_to']?.['rel_type'] == 'm.thread'
                    let is_topic = isTopic && e?.content?.topic?.length > 0

                    if(ind == -1 && !is_thread && is_topic) {
                        //messages = [...messages, e]
                        store.addChatEvents(roomID, [e])
                    }
                })
            } else if (event && typeof event === 'object') {
                if(event.type == 'm.room.redaction') {
                    $store.redactedEvent = event
                    let ind = $store.events[roomID].chat.findIndex(m => m?.event_id === event?.content?.redacts)
                    if(ind != -1) {
                        $store.events[roomID].chat[ind].content = {
                            redacted: true,
                        }
                        //messages = messages
                    }
                }

                if(event.type == 'm.room.member' || 
                event.type == 'm.room.name' || 
                event.type == 'space.board.post' || 
                event.type == 'm.room.topic') {
                    //messages = [...messages, event]
                    //messages = messages
                    store.addChatEvents(roomID, [event])
                }

                if(event.type == 'm.reaction') {
                    addNewReaction(event)
                }


                let ind = $store.events[roomID].chat.findIndex(m => m?.transaction_id ===
                    event?.transaction_id)

                let is_thread = event?.content?.['m.relates_to']?.['rel_type'] == 'm.thread'
                let is_edit = event?.content?.['m.new_content']?.body

                let is_topic = isTopic && event?.content?.topic?.length > 0

                if(ind == -1 && !is_thread && !is_edit) {
                    //messages = [...messages, event]
                    store.addChatEvents(roomID, [event])
                }

                let isMR = event?.content?.['m.relates_to']?.rel_type == 'm.thread'

                if(ind == -1 && isMR) {
                    let event_id = event?.content?.['m.relates_to']?.event_id
                    const slug = event_id.substr(-11)

                    let pi = $store.thread_events.findIndex(m => m?.transaction_id === event.transaction_id)
                    if(pi == -1) {
                        store.addThreadEvent(slug, event)
                    }

                    let index = $store.events[roomID].chat.findIndex(m => m?.event_id === event_id)
                    if(index != -1) {
                        if(!$store.events[roomID].chat[index].thread_reply_count) {
                            $store.events[roomID].chat[index].thread_reply_count = 0
                        }
                        $store.events[roomID].chat[index].thread_reply_count += 1
                        event.content = JSON.stringify(event?.content)
                        $store.events[roomID].chat[index].last_thread_reply = event
                        //messages = messages
                    }
                }
            }
            chat.scrollToBottom()
            //if(atBottom) {
                //updateScroll()
            //}
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
                last: lastChatEvent,
            }))
        }
    }, 30000);
}

function addNewReaction(e) {
    let txn_id = e?.transaction_id
    let mev = e?.content?.['m.relates_to']?.event_id
    let key = e?.content?.['m.relates_to']?.key
    let url = e?.content?.['m.relates_to']?.url
    let ind = $store.events[roomID]?.chat.findIndex(m => m?.event_id === mev)
    if(ind != -1) {
        let event = $store.events[roomID]?.chat[ind]
        let sender = e?.sender?.id

        if(event?.reactions) {
            // check if reaction key exists
            let i = event?.reactions?.findIndex(r => r.key === key);
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
        //messages = messages
    }
}


let chat;
let board;

$: if(showChatView && chat) {
    chat.scrollToBottom()
    chat.focusComposer()
}

let chatLoaded = false;
let boardLoaded = false;

$: if(!chatLoaded && showChatView && chat) {
    chatLoaded = true
}

let loaded = false;

onMount(() => {
    setTimeout(() => {
        loaded = true
    }, 2000)
})

</script>

{#if isSpace}
    {#if ready && space_exists}

        {#if isRoom && !room_exists}

            <NotFound />

        {:else if isProfile}
            <Board on:mounted={mounted} on:ready />
        {:else}

            <div class="container" class:hide={showBoardView}>
                <Chat bind:this={chat} 
                    loaded={chatLoaded}
                    showChatView={showChatView}
                    on:sync={syncMessages} 
                    on:mounted={mounted} />
            </div>

            <div class="container" class:hide={showChatView}>
                <Board bind:this={board} 
                    showBoardView={showBoardView}
                    on:mounted={mounted} 
                    on:ready />
            </div>

        {/if}
    {:else if ready && !space_exists}

        <NotFound />

    {:else}
        <div class="grd">
            <div class="loader grd-c"></div>
        </div>
    {/if}
{:else}
    <Board on:mounted={mounted} />
{/if}



<style>

.container {
    display: grid;
    grid-template-columns: auto;
    grid-template-columns: auto;
    overflow: hidden;
}
.hide {
    display: none;
}

</style>

