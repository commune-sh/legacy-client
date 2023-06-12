<script>
import { PUBLIC_API_URL, PUBLIC_APP_NAME } from '$env/static/public';
import { APIRequest, loadPosts } from '$lib/utils/request.js'
import { onMount, tick, createEventDispatcher } from 'svelte'
import { page } from '$app/stores';
import { goto } from '$app/navigation';
import { store } from '$lib/store/store.js'
import Event from '$lib/event/event.svelte'
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

$: roomID = isRoom ? state?.children?.find(r => r?.alias ===
    $page?.params?.room)?.room_id : isSpace ? state?.room_id : null

$: selectedRoomType = isRoom ? state?.children?.find(r => r?.alias ===
    $page?.params?.room)?.type : isSpace ? state?.space?.type : null

$: isChat = selectedRoomType === 'chat'
$: isBoard = selectedRoomType === 'board'


const dispatch = createEventDispatcher()


let ready = false;

let reloading = false;

let lastPath = null;
let lastSpace = null;
let lastRoom = null;
let lastTopic = null;

let lastPageType = null;

$: isSpace = $page?.params?.space !== undefined 
$: isRoom = $page?.params?.room !== undefined 
$: isPost = $page?.params?.post !== undefined

$: isTopic = $page?.params?.topic !== undefined

$: topic = $page?.params?.topic

$: if($page?.url?.pathname != lastPath) {

    if($page?.params?.room != lastRoom || 
        $page?.params?.topic != lastTopic ||
        $page?.params?.space != lastSpace) {


        if(loaded) {

            /*
            if(!events) {
                editing = false
                reloading = true
            }
            */
                editing = false
                reloading = true

            loadEvents()
        }
    }
}

$: if(loaded && roomID) {
    let es = store.getEditorState(roomID)
    if(es != undefined) {
        editing = true
    }
}

let loaded = false;


//$: events = $store?.events?.[roomID]
$: events = data?.events
//$: sorted = events?.sort((a, b) => b.origin_server_ts - a.origin_server_ts);


async function loadEvents() {

    const token = localStorage.getItem('access_token')

    let url = `${PUBLIC_API_URL}/events/`

    let space = $page.params.space
    let isSpace = space && space !== 'undefined' && space?.length > 0
    if(isSpace) {
        url = `${PUBLIC_API_URL}/${space}/events`
    }

    let room = $page.params.room
    let isRoom = room && room !== 'undefined' && room?.length > 0
    if(isRoom) {
        url = `${PUBLIC_API_URL}/${space}/${room}/events`
    }

    let opt = {
      url: url,
      method: 'GET',
    }

    if(isTopic) {
        opt.url = url + `?topic=${topic}`
    }

    if(token && !isSpace && !isRoom) {
        opt.url = `${PUBLIC_API_URL}/feed`
    }

    const resp = await loadPosts(opt)
    if(resp) {
        data = resp

        if($page?.url?.pathname != lastPath) {
            lastPath = $page?.url?.pathname
        }

        lastSpace = $page?.params?.space
        lastRoom = $page?.params?.room
        lastTopic = $page?.params?.topic
        loaded = true
        reloading = false
    }

    if(!resp) {
        down = true
    }

}

let down = false;

let data = null;

$: exists = state != undefined && state?.space != undefined

$: if(data) {
    //ready = true
    setTimeout(() => ready = true, 1)
    dispatch('ready', true)
}

function toggleTheme() {
    const theme = localStorage.getItem('theme')
    if(theme === 'light') {
        localStorage.removeItem('theme')
        document.documentElement.setAttribute('class', 'dark')
    } else {
        localStorage.setItem('theme', 'light')
        document.documentElement.setAttribute('class', 'light')
    }
}


function link(space) {
        return `/${$page.params.space}/p/${space}`
}


let scrollHeight;
let scrollable
let obs;


$: if(obs && loaded && ready) {
    setupObserver()
}

onMount(() => {
    loadEvents(true)
    return
    if(!data.error && !data.down) {
        scrollHeight = scrollable?.scrollHeight;
        handleScroll();
    }
})

function setupObserver() {
    handleScroll();
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


let fetchMore = () => {
    if(events?.length <30) {
        return
    }
    const last = events?.[events?.length - 1]?.origin_server_ts

    let url = `${PUBLIC_API_URL}/events?last=${last}`
    if(isSpace) {
        url = `${PUBLIC_API_URL}/${$page.params.space}/events?last=${last}`
    }

    if(isSpace && isRoom) {
        url = `${PUBLIC_API_URL}/${$page.params.space}/${$page.params.room}/events?last=${last}`
    }

    if(isTopic) {
        url = url + `?topic=${topic}`
    }

    if(authenticated && !isSpace && !isRoom) {
        url = `${PUBLIC_API_URL}/feed?last=${last}`
    }

    APIRequest({
        url: url,
      method: 'GET',
    }).then((res) => {
        if(res && res?.events?.length > 0) {
            data.events = [...data.events, ...res.events];
            store.addToRoomEvents(roomID, res.events)
        }
    });
}

$: if($store.refreshingFeed) {
    store.stopRefreshingFeed()
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
        if(e?.matches == true) {
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

    if(!data.events) {
        data.events = []
    }

    data.events = [e.detail, ...data.events]
    store.addNewPostToRoom(roomID, e.detail)

    let url = `/${e.detail?.room_alias}/post/${e.detail?.slug}`
    if(isTopic) {
        url = `/${e.detail?.room_alias}/topic/${e.detail?.content?.topic}/post/${e.detail?.slug}`
    }

    goto(url, {
        noscroll: true,
    })
}

$: isReply = $page.params.reply !== undefined && $page.params.reply !== null && $page.params.reply !== ''


$: holder = isTopic ? 'topic' : 'space'


function updateReactions(e) {
    let index = data.events.findIndex((event) => event.event_id == e.detail.event_id)
    if(index > -1) {
        data.events[index].content.reactions = e.detail.reactions
    }
}

function updateReplyCount(e) {
    let index = data.events.findIndex((event) => event.event_id == e.detail)
    if(index > -1) {
        let count = data.events[index].reply_count
        data.events[index].content.reactions = count + 1
    }
}

$: isProfile = state?.space?.is_profile
</script>




<section class="space-container"
    bind:this={container}
    class:post={isPost}>

    <div class="inner-area" 
        class:ina={isPost}>

        <Header 
            editing={editing} 
            on:newPost={newPost} />

        <div class="inner-content" 
            class:splh={editing}
            bind:this={scrollable}>


            {#if !loaded || reloading}

                <SkeletonBoardEvents reply={false}/>

            {:else}
                {#if authenticated && editing}
                    <Composer 
                        roomID={roomID}
                        topic={topic}
                        on:saved={postSaved} 
                        on:kill={stopEditing}/>
                {/if}

                {#if events}
                    <section class="events">
                        {#each events as event (event.event_id)}
                            <Event 
                                event={event} sender={null} />
                        {/each}
                    </section>
                {/if}

                {#if exists && !isProfile && events?.length == 0}
                    <div class="grd">
                        <div class="grd-c">
                            This {holder} does not have any posts yet.
                        </div>
                    </div>
                {/if}

                {#if isProfile && events?.length == 0}
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


            {/if}


            {#if (exists || !isSpace) && events !== null && !reloading}
                <div class="obs" bind:this={obs}></div>
            {/if}

        </div>


    </div>

    {#if isPost}
        <Post on:update-reactions={updateReactions} 
        on:reply-saved={updateReplyCount} />
    {/if}

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


