<script>
import { PUBLIC_API_URL, PUBLIC_API_URL_WS } from '$env/static/public';
import { APIRequest, loadPosts } from '$lib/utils/request.js'
import { onMount, afterUpdate, createEventDispatcher, tick } from 'svelte'
import { page } from '$app/stores';
import { goto } from '$app/navigation';
import { store } from '$lib/store/store.js'
import Event from '$lib/board/event/event.svelte'
import Header from '$lib/header/header.svelte'
import Post from '$lib/post/post.svelte'
import SkeletonBoardEvents from '$lib/skeleton/skeleton-board-events.svelte'

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


const dispatch = createEventDispatcher()


let ready = false;


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

async function loadMessages() {
    messages = null
    if(socket) {
        socket.close()
    }
    let endpoint = PUBLIC_API_URL

    let url = `${endpoint}/room/${roomID}/messages`

    let opt = {
      url: url,
      method: 'GET',
    }
    const resp = await loadPosts(opt)
    console.log(resp)
    if(resp?.events) {
        messages = resp?.events.reverse()
        updateScroll()
        ready = true;
        _page = $page
        syncMessages()
        setTimeout(() => {
            reloadTrigger = true
        }, 1000)
    }
}

let sp;

let fetching = false;
async function fetchMore() {
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
        socket.send(last);
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
                let ind = messages.findIndex(m => m?.event_id === event?.event_id)
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

            socket.send(last);
        }
    }, 30000);
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

</script>




<section class="space-container">

    <div class="inner-area" >

        <Header />

        <div class="inner-content" 
            on:scroll={trackScroll}
            bind:this={zone}>

            <div class="ob" bind:this={ob}></div>

            {#if !ready}
                <SkeletonBoardEvents />
            {:else}

                {#if messages}
                    {#each messages as message, i}
                        {#if message?.type === 'm.room.message'}
                            <Event 
                                isChat={true}
                                index={i}
                                messages={messages}
                                event={message} 
                                sender={null} />
                        {:else}
                            <div class="pa3">
                                {JSON.stringify(message.type)}
                            </div>
                        {/if}
                    {/each}
                {/if}
            {/if}

        </div>

        <div class="chat-composer">
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
    grid-template-rows: 48px auto 68px;
    overflow: hidden;
}

.inner-content {
    overflow-y: auto;
    overflow-x: hidden;
    display: grid;
    grid-template-rows: repeat(auto-fill, auto);
}

.chat-composer {
    border-top: 1px solid var(--border-1);
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

</style>


