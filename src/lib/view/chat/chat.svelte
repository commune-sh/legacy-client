<script>
import { PUBLIC_API_URL, PUBLIC_API_URL_WS } from '$env/static/public';
import { APIRequest, loadPosts } from '$lib/utils/request.js'
import { onMount, afterUpdate, createEventDispatcher } from 'svelte'
import { page } from '$app/stores';
import { goto } from '$app/navigation';
import { store } from '$lib/store/store.js'
import Message from '$lib/event/message/message.svelte'
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
    scrollable.scrollTop = scrollable.scrollHeight;
}


afterUpdate(() =>{
    updateScroll()
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

let socket;

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
                event = event.reverse()
                messages = [...messages, ...event]
            } else if (event && typeof event === 'object') {
                messages = [...messages, event]
            }
            updateScroll()
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

let scrollable;

</script>




<section class="space-container">

    <div class="inner-area" >

        <Header />

        <div class="inner-content" bind:this={scrollable}>

            {roomID}

            {#if messages}
                {#each messages as message}
                    <div class="pa3">
                    {JSON.stringify(message?.content)}
                    </div>
                {/each}
            {/if}

        </div>

        <div class="">
            <input/>
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
    grid-template-rows: 48px auto 48px;
    overflow: hidden;
}

.inner-content {
    overflow-y: auto;
    overflow-x: hidden;
    display: grid;
    grid-template-rows: repeat(auto-fill, auto);
}

.splh {
    grid-template-rows: auto 1fr;
}

.sph {
}

.post {
    grid-template-columns: 50% 50%;
}

.events {
    place-self: stretch;
    width: 100%;
    justify-self: center;
    align-self: start;
}

.ina {
    border-right: 1px solid var(--border-1);
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


