<script>
import { PUBLIC_API_URL, PUBLIC_APP_NAME } from '$env/static/public';
import { APIRequest, loadPosts, redactEvent } from '$lib/utils/request.js'
import { browser } from '$app/environment'
import { createStateEvent } from '$lib/utils/request.js'
import { onMount, tick, createEventDispatcher } from 'svelte'
import { page } from '$app/stores';
import { goto } from '$app/navigation';
import { store } from '$lib/store/store.js'
import Event from '$lib/board/event/event.svelte'
import Header from '$lib/header/header.svelte'
import Post from '$lib/post/post.svelte'
import SkeletonBoardEvents from '$lib/skeleton/skeleton-board-events.svelte'
import Embed from '$lib/embed/embed.svelte'


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
$: stateReady = $store.stateReady



$: roomID = isRoom ? state?.children?.find(r => r?.alias ===
    $page?.params?.room)?.room_id : isSpace ? state?.room_id : 'index'


$: pinned = isRoom ? state?.children?.find(r => r?.alias ===
    $page?.params?.room)?.pinned_events : isSpace ? state?.space?.pinned_events : null

$: pinnedEvents = pinned ? JSON.parse(pinned) : null

const dispatch = createEventDispatcher()


export let showBoardView = false;

let ready = false;

let reloading = false;


$: isSpace = $page?.params?.space !== undefined 
$: isRoom = $page?.params?.room !== undefined 
$: isPost = $page?.params?.post !== undefined

$: isGeneral = isSpace && !isRoom && !isPost

$: isTopic = $page?.params?.topic !== undefined

$: topic = $page?.params?.topic


$: if(loaded && roomID) {
    let es = store.getEditorState(roomID)
    if(es != undefined) {
        //editing = true
    }
}

let loaded = false;


//$: events = $store?.events?.[roomID]
$: events = $store.events[rid]?.board
//$: sorted = events?.sort((a, b) => b.origin_server_ts - a.origin_server_ts);


// Store $page locally
let _page = null;
let reloadTrigger;
// Reload logic

$: if(reloadTrigger && ($page.url?.pathname != _page?.url?.pathname) &&
    $page.url.pathname == '/' && $page.url.search == '') {
    loadEvents()
}

$: if(reloadTrigger && ($page.url?.pathname != _page?.url?.pathname) &&
    $page.url.pathname == '/all') {
    loadEvents()
}

$: if(reloadTrigger && ($page.params?.domain != _page?.params?.domain)) {
    loadEvents()
}

$: if(reloadTrigger && ($page.params?.space != _page?.params?.space)) {
    loadEvents()
}

$: if(reloadTrigger && ($page.params?.room != _page?.params?.room)) {
    loadEvents()
}

$: if(reloadTrigger && ($page.params?.topic != _page?.params?.topic)) {
    loadEvents()
}


$: if(reloadTrigger && 
    ($page.url.search != _page.url.search )){
    loadEvents()
}


$: rid = isAll ? 'all' : isIndex ? 'index' : roomID
$: existing = $store.events[rid]?.board?.length > 0

$: if(existing) {
    loaded = true
}

async function loadEvents(init) {

    reloading = true
    editing = false

    if(init) {
    }


    let endpoint = PUBLIC_API_URL

    if(isDomain && $store.federated?.active && $store.federated.endpoint) {
        endpoint = $store.federated?.endpoint
    }


    let url = `${endpoint}/events/`

    let space = $page.params.space
    let isSpace = space && space !== 'undefined' && space?.length > 0
    if(isSpace) {
        url = `${endpoint}/${space}/events`
    }

    let room = $page.params.room
    let isRoom = room && room !== 'undefined' && room?.length > 0
    if(isRoom) {
        url = `${endpoint}/${space}/${room}/events`
    }

    let opt = {
      url: url,
      method: 'GET',
    }

    if(isTopic) {
        opt.url = url + `?topic=${topic}`
    }

    if(authenticated && !isSpace && !isRoom && !$store.federated.active) {
        opt.url = `${PUBLIC_API_URL}/feed`
    }

    let filter = $page.url.searchParams.get('filter')
    if(filter) {
        opt.url = `${opt.url}?filter=${filter}`
    }

    if($page?.url.pathname == '/all') {
        opt.url = `${PUBLIC_API_URL}/events`
    }

    const resp = await loadPosts(opt)
    if(resp) {
        data = resp

        reloading = false
        loaded = true
        _page = $page
        setTimeout(() => {
            reloadTrigger = true
        }, 1000)

        if(!$store.events[rid]) {
            $store.events[rid] = {chat: [], board: []}
        }

        if(resp?.events?.length > 0) {
            $store.events[rid].board = resp.events
            store.addBoardEvents(rid, resp.events)
        }
    }

    if(!resp) {
        down = true
    }

}

$: isIndex = $page.url?.pathname === '/'
$: isAll = $page.url?.pathname === '/all'


let down = false;

let data = null;

$: exists = state != undefined && state?.space != undefined && 
    data?.events?.exists != false

$: if(data) {
    //ready = true
    setTimeout(() => ready = true, 1)
    dispatch('ready', true)
}



let scrollHeight;
let scrollable
let obs;
let ob;


$: if(browser && obs) {
    setupObserver()
}
$: if(ob && loaded && ready) {
    setupObserverRev()
}

$: isDomain = $page.params.domain !== undefined && 
    $page.params.domain !== 'undefined' && 
    $page.params.domain?.length > 0

let domainPinged =false

$: if(isDomain && $store.federated.endpoint && !loaded) {
    if(!domainPinged) {
        domainPinged = true
        loadEvents()
    }
}
$: if(!isDomain && domainPinged) {
    loadEvents()
}

let loadEditor = false;
onMount(() => {
    dispatch('mounted')
    if(isDomain) {
        return
    }
    setTimeout(() => {
        loadEditor = true
    }, 100)
    //loadEvents(true)
    return
    if(!data.error && !data.down) {
        scrollHeight = scrollable?.scrollHeight;
        handleScroll();
    }
})

let init = false;

$: if($store.verifiedSession && !init) {
    init = true
    initLoad()
}

function initLoad(){
    if(isDomain) {
        return
    }

    if(existing) {
        ready = true
        reloading = false
        _page = $page
        setTimeout(() => {
            reloadTrigger = true
        }, 1000)
        return
    } else {
        loadEvents(true)
    }
}

function setupObserver() {
    handleScroll();
}

function setupObserverRev() {
    handleScrollRev();
}

function handleScroll() {
    scrollHeight = scrollable?.scrollHeight;
    let options = {
        root: scrollable,
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
    observer.observe(obs);
}

function handleScrollRev() {
    scrollHeight = scrollable?.scrollHeight;
    let options = {
        root: scrollable,
        rootMargin: `${scrollHeight/2}px`,
    };

    let callback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && startedFetching) {
                //fetchMore()
                let lastEventInStore = $store.events[roomID].board?.[0]?.event_id
                let x = data?.events[0]?.event_id
                if(lastEventInStore != x) {
                    console.log("repopulating events")
                }
            }
        });
    };

    let observer = new IntersectionObserver(callback, options);
    observer.observe(ob);
}

let startedFetching = false;

let fetchMore = () => {
    if(events?.length <30) {
        return
    }
    const last = events?.[events?.length - 1]?.origin_server_ts


    let endpoint = PUBLIC_API_URL

    if(isDomain && $store.federated?.active && $store.federated.endpoint) {
        endpoint = $store.federated?.endpoint
    }


    let url = `${endpoint}/events?last=${last}`
    if(isSpace) {
        url = `${endpoint}/${$page.params.space}/events?last=${last}`
    }

    if(isSpace && isRoom) {
        url = `${endpoint}/${$page.params.space}/${$page.params.room}/events?last=${last}`
    }

    if(isTopic) {
        url = url + `?topic=${topic}`
    }

    if(authenticated && !isSpace && !isRoom && !isDomain) {
        url = `${PUBLIC_API_URL}/feed?last=${last}`
    }

    let filter = $page.url.searchParams.get('filter')
    if(filter) {
        url = `${url}&filter=${filter}`
    }

    if($page?.url.pathname == '/all') {
        url = `${endpoint}/events?last=${last}`
    }


    APIRequest({
        url: url,
      method: 'GET',
    }).then((res) => {
        if(res && res?.events?.length > 0) {
            for (const event of res?.events) {
              const exists = $store.events[rid].board.some(e => e.event_id === event.event_id);

              if (!exists) {
                store.addBoardEvent(rid, event)
              }
            }
            startedFetching = true;

                /*
            const url = new URL(window.location.href);
            url.searchParams.set('last', last);
            history.pushState(null, '', url.toString());
                */
        }
    });
}


$: if(reloadTrigger && $store.reloadFeed) {
    console.log("reloading because of login or logout")
    setTimeout(() => {
        loadEvents()
    }, 200)
    $store.reloadFeed = false 
    $store.accountCreated = false
}

let container;

$: menuToggled = $store?.menuToggled

onMount(() => {
    let mq = window.matchMedia("(min-width: 768px)");
    mq.addEventListener("change", (e) => {
        if(e?.matches == true && menuToggled) {
            store.toggleMenu()
            container.style.width = `auto`
        }
        if(e?.matches == true && container) {
            container.style.width = `auto`
        }
    });
})

function toggleMenu() {
    store.toggleMenu()
}

let editing = false;


function newPost(e) {
    editing = true
}

function stopEditing() {
    editing = false
    store.deleteEditorState(roomID)
}

function postSaved(e) {
    stopEditing()

    store.unshiftBoardEvent(roomID, e.detail)

    let url = `/${e.detail?.room_alias}/post/${e.detail?.slug}`
    if(isTopic) {
        url = `/${e.detail?.room_alias}/topic/${e.detail?.content?.topic}/post/${e.detail?.slug}`
    }

    if($page.url?.search?.includes('view=board')) {
        url = `/${e.detail?.room_alias}/post/${e.detail?.slug}?view=board`
    }

    goto(url, {
        noscroll: true,
    })
}

$: isReply = $page.params.reply !== undefined && $page.params.reply !== null && $page.params.reply !== ''


$: holder = isTopic ? 'topic' : isRoom ? 'board' : isSpace ? 'space' : null


function updateReactions(e) {
    let index = $store.events[roomID].board.findIndex((event) => event.event_id == e.detail.event_id)
    if(index > -1) {
        console.log("updating reactions", e.detail)
        $store.events[roomID].board[index].reactions = e.detail.reactions
    }
}

function updateReplyCount(e) {
    const event_id = e.detail.event_id
    const reply_count = e.detail.reply_count
    let index = $store.events[roomID].board.findIndex((event) => event.event_id == event_id)
    if(index > -1) {
        console.log("updating reply count", e.detail)
        $store.events[roomID].board[index].reply_count = reply_count
    }
}

$: isProfile = state?.space?.is_profile


$: noEvents = events?.length == 0 || events == null

$: selectedPost = isReply ? null : events?.find(e => e?.slug == $page.params.post)

function postEdited(e) {
    let index = $store.events[roomID].board.findIndex((event) => event.event_id == e.detail.event_id)
    if(index > -1) {
        console.log("updating edited content")
        $store.events[roomID].board[index].content.title = e.detail.content.title
        $store.events[roomID].board[index].content.body = e.detail.content.body
    }
}

$: roomExists = isRoom && state?.children?.find((child) => child.alias ==
    $page.params.room) != undefined


async function redactPost(e) {
    const event = e.detail
    const index = $store.events[rid].board.findIndex(i => i.event_id === event.event_id);
    if(index !== -1) {
        $store.events[rid].board.splice(index, 1);
    }
    if(isPost && event.slug == $page.params.post) {
        let url = `/${$page.params.space}`
        if(isRoom) {
            url = `/${$page.params.space}/${$page.params.room}`
        }

        if(!isSpace) {
            url = `/`
        }

        goto(url, {
            noscroll: true,
        })
    }

    let redaction = {
        room_id: event.room_id,
        event_id: event.event_id,
        reason: "redacted",
    }
    const res = await redactEvent(redaction);
    console.log(res)
}

async function pinPost(e) {
    const event = e.detail
    const index = $store.events[roomID].board.findIndex(i => i.event_id === event.event_id);
    if(index !== -1) {
        let ps = $store.events[roomID].board[index].pinned
        $store.events[roomID].board[index].pinned = !ps


        let pinned = state?.space?.pinned_events
        if(isRoom) {
            pinned = state?.children.find(i => i.room_id == roomID)?.pinned_events
        }

        let pinned_events = JSON.parse(pinned)

        if(!pinned_events) {
            pinned_events = []
        }
        let ind = pinned_events.findIndex(i => i === event.event_id);

        if(ind !== -1) {
            pinned_events.splice(ind, 1);
        } else {
            pinned_events.push(event.event_id)
        }
        store.updateSpacePinnedEvents($page.params.space, JSON.stringify(pinned_events))


        const res = await createStateEvent({
            room_id: e.detail.room_id,
            event_type: 'm.room.pinned_events',
            content: {
                pinned: pinned_events,
            }
        })
        console.log(res)
    }
}

let post;

function discover() {
    $store.discoverSpacesOpen = true
}

function updatePostReactions(e) {
    if(e.detail.slug == $page.params.post) {
        post?.updateReactions(e.detail.reactions)
    }
}


let referenced_event = null;
function referenceEvent(e) {
    console.log("referencing event", e.detail)
    referenced_event = e.detail
    editing = true
}

</script>




<section class="space-container"
    bind:this={container}
    class:post={isPost}>

    <div class="inner-area" 
        class:ina={isPost}>

        <Header on:toggle-view
            isBoard={true}
            editing={editing} 
            on:newPost={newPost} />

        <div class="inner-content" 
            class:splh={editing}
            bind:this={scrollable}>

            {#if (exists || !isSpace) && events?.length >= 30 && !reloading}
                <div class="ob" bind:this={ob}></div>
            {/if}



            {#if !loaded || reloading || (!stateReady && isSpace)}

                <SkeletonBoardEvents reply={false}/>

            {:else if (stateReady || !isSpace)}

                {#if authenticated && editing && loadEditor}
                    <Composer 
                        roomID={roomID}
                        room_alias={$page.params.space}
                        reference={referenced_event}
                        on:kill-reference={() => referenced_event = null}
                        topic={topic}
                        on:saved={postSaved} 
                        isChat={false}
                        on:kill={stopEditing}/>
                {/if}


                {#if events?.length > 0}
                    <section class="events">
                        {#each events as event (event.event_id)}
                            {#if event.pinned}
                                <Event event={event} 
                                    on:reference={referenceEvent}
                                    on:update-reactions={updatePostReactions}
                                    on:redact={redactPost}
                                    on:pin={pinPost}
                                    sender={null} />
                            {/if}
                        {/each}
                        {#each events as event (event.event_id)}
                            {#if !event.pinned}
                                <Event event={event} 
                                    on:reference={referenceEvent}
                                    on:update-reactions={updatePostReactions}
                                    on:redact={redactPost}
                                    on:pin={pinPost}
                                    sender={null} />
                            {/if}
                        {/each}
                    </section>
                {/if}

                {#if exists && !isProfile && noEvents && (roomExists || isGeneral)}
                    <div class="grd">
                        <div class="grd-c">
                            This {holder} does not have any posts yet.
                        </div>
                    </div>
                {/if}


                {#if exists && !isProfile && isRoom && !isTopic && noEvents && !roomExists}
                    <div class="grd">
                        <div class="grd-c">
                            This board does not exist.
                        </div>
                    </div>
                {/if}


                {#if isProfile && noEvents}
                    <section class="grd">
                        <section class="grd-c">
                            {$page.params.space} has not posted yet.
                        </section>
                    </section>
                {/if}


                {#if isSpace && !exists}
                    <section class="grd">
                        <section class="grd-c">
                            This space does not exist.
                        </section>
                    </section>
                {/if}

                {#if authenticated && noEvents && !isSpace}
                    <section class="grd">
                        <section class="nothing grd-c fl-co">
                            <div class="mb4">
                                You're not following any spaces yet.
                            </div>
                            <div class="mb4 grd-c">
                                <button class="pa2" on:click={discover}>Discover Spaces</button>
                            </div>
                        </section>
                    </section>
                {/if}



            {/if}


            {#if (exists || !isSpace) && events?.length >= 30 && !reloading}
                <div class="obs" bind:this={obs}></div>
            {/if}

        </div>


    </div>

    {#if isPost}
        <Post on:update-reactions={updateReactions} 
        bind:this={post}
        post={selectedPost}
        on:edited={postEdited}
        on:redact={redactPost}
        on:reference={referenceEvent}
        on:reply-saved={updateReplyCount} />
    {/if}

</section>


<Embed />

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
    grid-template-rows: 48px auto;
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
    }
    .post {
        grid-template-columns: auto;
    }
    .ina {
        display: none;
    }
}

</style>


