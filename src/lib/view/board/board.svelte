<script>
import { PUBLIC_API_URL, PUBLIC_APP_NAME } from '$env/static/public';
import { APIRequest } from '$lib/utils/request.js'
import { onMount, tick, createEventDispatcher } from 'svelte'
import { page } from '$app/stores';
import { goto } from '$app/navigation';
import { store } from '$lib/store/store.js'
import Event from '$lib/event/event.svelte'
import Header from '$lib/header/header.svelte'
import Post from '$lib/post/post.svelte'
import Composer from '$lib/composer/composer.svelte'
import SkeletonBoardEvents from '$lib/skeleton/skeleton-board-events.svelte'

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

let lastPageType = null;

$: isIndex = $page?.url?.pathname === '/'
$: isSpace = $page?.params?.space !== undefined && $page?.params?.space !== null && $page?.params?.space !== '' 
$: isRoom = $page?.params?.room !== undefined && $page?.params?.room !== null &&
    $page?.params?.room !== '' 
$: isPost = $page?.params?.post !== undefined && $page?.params?.post !== null &&
    $page?.params?.post !== ''

$: if($page?.url?.pathname != lastPath) {
    //reloading = true
    if($page?.params?.room != lastRoom || $page?.params?.space != lastSpace) {
        if(loaded) {
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

function loadEvents(init) {

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

    if(token && !isSpace && !isRoom) {
        opt.url = `${PUBLIC_API_URL}/feed`
        opt.token = token
    }

    APIRequest(opt)
    .then(resp => {
        if(resp) {
            data = resp
            if($page?.url?.pathname != lastPath) {
                lastPath = $page?.url?.pathname
            }
            lastSpace = $page?.params?.space
            lastRoom = $page?.params?.room
            loaded = true
            reloading = false
        }

        if(!resp) {
            down = true
        }
    })
}

let down = false;

let data = null;

$: exists = data?.exists == null
    false

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
    let events = data?.events;
    const last = events?.[events?.length - 1]?.origin_server_ts

    let url = `${PUBLIC_API_URL}/events?last=${last}`
    if(isSpace) {
        url = `${PUBLIC_API_URL}/${$page.params.space}/events?last=${last}`
    }

    if(isSpace && isRoom) {
        url = `${PUBLIC_API_URL}/${$page.params.space}/${$page.params.room}/events?last=${last}`
    }

    APIRequest({
        url: url,
      method: 'GET',
    }).then((res) => {
        if(res && res?.events?.length > 0) {
            data.events = [...data.events, ...res.events];
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
    data.events = [e.detail, ...data.events];
    let url = `/${e.detail?.room_alias}/post/${e.detail?.slug}`
    goto(url, {
        noscroll: true,
    })
}


$: selectedPost = data?.events?.find(e => e.slug == $page.params.post)


</script>




<section class="space-container"
    bind:this={container}
    class:post={isPost}>

    <div class="inner-area" class:ina={isPost}>

        <Header 
            editing={editing} 
            on:newPost={newPost} />

        <div class="inner-content" 
            bind:this={scrollable}>


            {#if reloading}

                <SkeletonBoardEvents />

            {:else}
                {#if editing}
                    <Composer 
                        roomID={roomID}
                        on:saved={postSaved} 
                        on:kill={stopEditing}/>
                {/if}

                {#if data?.events}
                    <section class="events">
                        {#each data?.events as event}
                            <Event event={event} />
                        {/each}
                    </section>
                {/if}

                {#if exists && data?.events == null}
                    <div class="grd">
                        <div class="grd-c">
                            This space does not have any posts yet.
                        </div>
                    </div>
                {/if}

                {#if !exists}
                    <section class="grd">
                        <section class="grd-c">
                            This space does not exist.
                        </section>
                    </section>
                {/if}


            {/if}


            {#if exists && data?.events !== null && !reloading}
                <div class="obs" bind:this={obs}></div>
            {/if}

        </div>


    </div>

    {#if isPost && selectedPost}
        <Post post={selectedPost} />
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



@media screen and (max-width: 768px) {
    .post {
        grid-template-columns: auto;
    }
    .ina {
        display: none;
    }
}

</style>


