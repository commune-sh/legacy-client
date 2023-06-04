<script>
import Event from '$lib/event/event.svelte'
import Header from '$lib/header/post-header.svelte'
import { onMount } from 'svelte';
import { store } from '$lib/store/store.js'
import { APIRequest } from '$lib/utils/request.js'
import { PUBLIC_BASE_URL } from '$env/static/public';
import { page } from '$app/stores';
import SkeletonBoardEvents from '$lib/skeleton/skeleton-board-events.svelte'
import Composer from '$lib/composer/composer.svelte'

export let post;


$: state = $store?.states[$page?.params?.space]

$: isSpace = $page?.params?.space !== undefined && $page?.params?.space !== null && $page?.params?.space !== '' 
$: isRoom = $page?.params?.room !== undefined && $page?.params?.room !== null && $page?.params?.room !== '' 
$: roomID = isRoom ? state?.children?.find(r => r?.alias ===
    $page?.params?.room)?.room_id : isSpace ? state?.room_id : null

let ready = false;

function loadEvents() {
    APIRequest({
      url: `${PUBLIC_BASE_URL}/event/${post.event_id}/replies`,
      method: 'GET',
    })
    .then(resp => {
        if(resp) {
            //
            data = resp
            lastPost = $page.params.post
            ready = true
        }
        if(!resp) {
            down = true
        }
    })

}

let data = null;
let down = false;

$: replies = data?.replies

let lastPost = null;

onMount(() => {
    if(post?.event_id) {
        loadEvents()
    }
})

$: if(lastPost != null && $page.params.post != lastPost) {
    ready = false
    loadEvents()
}

let placeholder = 'Leave a reply.'

function replySaved(e) {
    if(data == null) {
        data = {}
        data.replies = []
    }
    data.replies = [e.detail, ...data.replies];
}

</script>

<section class="content">
    <Header />

    <section class="events">

        <Event isPost={true} event={post} />

        <div class="sep">
        </div>

        {#if ready}
        <div class="com">
                <Composer 
                    roomID={roomID}
                    reply={true} 
                    replyTo={post.event_id}
                    on:saved={replySaved} 
                    placeholder={placeholder} />
        </div>
        {/if}

        {#if ready}
            {#if replies}
                {#each replies as reply}
                    <Event isReply={true} event={reply} />
                {/each}
            {/if}
        {:else}
            <SkeletonBoardEvents />
        {/if}

    </section>


</section>


<style>
.content {
    display: grid;
    grid-template-columns: auto;
    grid-template-rows: 48px auto;
    overflow-y: hidden;
    background-color: var(--bg);
}
.events {
    overflow-y: auto;
}
@media screen and (max-width: 1280px) {
    .content {
        position: fixed;
        top: 0;
        right: 0;
        bottom: 0;
        left: 304px;
    }
}
@media screen and (max-width: 768px) {
    .content {
        position: static;
    }
}
</style>

