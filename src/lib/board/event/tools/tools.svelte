<script>
import { reply, external, edit, thread, quote, link } from '$lib/assets/icons.js'
import React from './react.svelte'
import Menu from './menu.svelte'
import ShowFrequent from './frequent-reactions.svelte'
import { onMount, createEventDispatcher } from 'svelte'
import { goto } from '$app/navigation';
import { store } from '$lib/store/store.js'
import { page } from '$app/stores';
import tippy from 'tippy.js';

let rel;
let thr;
let ed;
let ref;
let lnk;

onMount(() => {
})

$:if(lnk) {
    tippy(lnk, {
        content: 'Open Permalink',
        arrow: true,
        duration: 1,
        theme: 'inline',
    });
}

$:if(ref) {
    tippy(ref, {
        content: 'Reference',
        arrow: true,
        duration: 1,
        theme: 'inline',
    });
}

$:if(rel) {
    tippy(rel, {
        content: 'Reply',
        arrow: true,
        duration: 1,
        theme: 'inline',
    });
}

$:if(thr) {
    tippy(thr, {
        content: 'Start a thread',
        arrow: true,
        duration: 1,
        theme: 'inline',
    });
}

$:if(ed) {
    tippy(ed, {
        content: 'Edit',
        arrow: true,
        duration: 1,
        theme: 'inline',
    });
}

$: state = $store?.states[$page?.params?.space]
$: sender_id = $store.credentials?.matrix_user_id
$: isOwner = state?.owner?.user_id === sender_id

$: authenticated = $store?.authenticated && 
    $store?.credentials != null
    $store?.credentials?.access_token?.length > 0

const dispatch = createEventDispatcher();

export let active;
export let event;

export let nested;

export let isReply;
export let isPost;
export let isAuthor;
export let isChat;

export let isBoardPostInChat = false;

export let isPostAuthor;

function kill() {
    dispatch('kill')
}

function replyToEvent() {
    dispatch('reply')
}

function editEvent() {
    dispatch('edit')
}

function reference() {
    dispatch('reference')
}

function menuIsActive() {
    menuActive = true
    dispatch('active')
}


function goToEvent() {
    let url = `/${event.room_alias}/post/${$page.params.post}/reply/${event?.slug}`

    if($page.params?.domain) {
        url = `/${$page.params.domain}${url}`
    }

    goto(url, {
        noscroll: true,
    })
}

let killPopup = (e) => {
    popup.kill()
    console.log("dispatching", e.detail)
    dispatch('kill', e.detail)
}

let logEvent = () => {
    console.log(event)
}

let popup;

let menuActive = false;

let killed = () => {
    menuActive = false
    //dispatch('kill')
    console.log("killin")
}


let showFrequent = false;

function reactHovered() {
    if(!authenticated) {
        return
    }
    if(menuActive) {
        return
    }
    showFrequent = true;
}

function resetHovered() {
    showFrequent = false;
}

function reacted(e) {
    showFrequent = false;
    dispatch('react', e.detail)
}

function startThread() {
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
        url = `${url}?view=chat&thread=${event?.slug}`
    } else {
        url = `${url}?thread=${event?.slug}`
    }

    goto(url, {
        noscroll: true,
    })
}

function goToPermalink() {
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
        url = `${url}?view=chat&context=${event?.slug}`
    } else {
        url = `${url}?context=${event?.slug}`
    }

    window.open(url, '_blank')
}
function referenceEvent() {
    dispatch('reference', event)
    kill()
}

</script>

<div class="event-tools">
    {#if showFrequent}
        <ShowFrequent on:active on:react={reacted} event={event} />
    {/if}

    <React inline={false} 
        isReply={isReply} 
        event={event} 
        on:hovered={reactHovered}
        on:react
        on:active />

    {#if isChat}
        <div bind:this={lnk} class="link icon grd-c c-ico" 
        on:mouseenter={resetHovered}
        on:click|stopPropagation={goToPermalink}>
        {@html link}
    </div>
    {/if}


    {#if !isBoardPostInChat}


        {#if !isReply && !isChat}
            <div bind:this={ref} class="ref icon grd-c c-ico" 
            on:mouseenter={resetHovered}
            on:click|stopPropagation={referenceEvent}>
            {@html quote}
        </div>
        {/if}

        {#if isPost || isReply || isChat}
            <div bind:this={rel} class="reply icon grd-c c-ico" 
            on:mouseenter={resetHovered}
            on:click|stopPropagation={replyToEvent}>
            {@html reply}
        </div>
        {/if}

        {#if isChat}
        <div bind:this={thr} class="thread icon grd-c c-ico" 
            on:mouseenter={resetHovered}
            on:click|stopPropagation={startThread}>
            {@html thread}
        </div>
        {/if}

        {#if isReply}
            <div class="icon grd-c c-ico" 
            on:mouseenter={resetHovered}
                on:click|stopPropagation={goToEvent}>
                {@html external}
            </div>
        {/if}

        {#if isAuthor}
            <div bind:this={ed} class="edit icon grd-c c-ico" 
                on:mouseenter={resetHovered}
                on:click|stopPropagation={editEvent}>
                {@html edit}
            </div>
        {/if}


        <Menu 
            on:active ={menuIsActive}
            on:kill 
            on:redact
            on:react
            on:pin
            on:add-tag
            on:toggle-pin
            on:mouseenter={resetHovered}
            isReply={isReply}
            isChat={isChat}
            isAuthor={isAuthor}
            isPostAuthor={isPostAuthor}
            nested={nested}
            event={event} />

    {/if}

</div>

{#if active}
    <div class="tools-mask" on:click={kill}></div>
{/if}

<style>
.event-tools {
    display: grid;
    grid-auto-flow: column;
    grid-column-gap: 0.25rem;
    border: 1px solid var(--border-1);
    z-index: 900;
    border-radius: 9px;
    padding: 0.25rem;
    background-color: var(--bg);
    position: relative;
}


.tools-mask {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    height: 100%;
    z-index: 899;
    width: 100vw;
    cursor: auto;
}
.icon {
    width: 18px;
    height: 18px;
    border-radius: 4px;
    padding: 0.25rem;
}
.icon:hover {
    background-color: var(--shade-2);
}

</style>
