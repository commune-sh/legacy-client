<script>
import { onMount, createEventDispatcher, tick } from 'svelte'
import { store } from '$lib/store/store.js'
import { suspendUser, pinToIndex, unpinFromIndex } from '$lib/utils/request.js'
import { more, code, trash, pin, tag as tagIcon, suspend as suspendIcon } from '$lib/assets/icons.js'
import ViewSource from './source.svelte'
import tippy from 'tippy.js';
import { page } from '$app/stores';

$: state = $store?.states[$page?.params?.space]
$: sender_id = $store.credentials?.matrix_user_id
$: isOwner = state?.owner?.user_id === sender_id
$: isSpaceAdmin = $store?.power_levels?.space?.[$store?.credentials?.matrix_user_id] == 100

$: isAdmin = $store?.credentials?.admin

$: notSelf = $store?.credentials?.matrix_user_id !== event?.sender?.id

$: authenticated = $store?.authenticated && 
    $store?.credentials != null
    $store?.credentials?.access_token?.length > 0

$: isSpace = $page?.params?.space !== undefined && $page?.params?.space !== null && $page?.params?.space !== ''

const dispatch = createEventDispatcher();

export let event;
export let isAuthor;
export let isPostAuthor;
export let isReply;
export let isChat;
export let nested;

let el;
let content;

let menu;

let active = false;

onMount(() => {
    menu = tippy(el, {
        content: content,
        allowHTML: true,
        trigger: 'click',
        interactive: true,
        theme: 'light-border',
        placement: 'bottom-end',
        arrow: false,
        duration: 1,
        zIndex: 99999,
        onShown(i) {
            active = true
            dispatch('active', true)
        },
        onHide(i) {
            active = false
            dispatch('kill', true)
        },
        onClickOutside(i) {
            active = false
            dispatch('kill', true)
        },
    });
})

function kill() {
}


function viewSource() {
    menu.hide()
    console.log(event)
    /*
    $store.modal = {
        active: true,
        component: ViewSource,
        props: {
            event: event
        }
    }
    */
}

async function suspend() {
    menu.hide()
    const res = await suspendUser(event.sender.id)
    console.log(res)
}

function redactEvent() {
    menu.hide()
    dispatch('redact', event)
}

function pinEvent() {
    menu.hide()
    dispatch('pin', event)
}

$: replyPinned = isReply && event?.reactions?.filter(r => r.key === 'pinned').length > 0


function tagEvent() {
    menuMode = false
    tagMode = true
}

$: if(tagMode) {
    focusTagInput()
}

async function focusTagInput() {
    await tick()
    tagInput.focus()
}

let menuMode = true
let tagMode = false

let tagInput;
let tag;

function addTag() {
    if(!tag) return
    menu.hide()

    let key = `tag:${tag}`
    dispatch('add-tag', key)

    active = false
    dispatch('kill', true)

    menuMode = true
    tagMode = false

    if(tagInput) {
        tagInput.value = null
    }
    tag = null
}

function handleEnter(e) {
    if(e.key === 'Enter') {
        addTag()
    }
}

async function pinToFrontPage() {
    menu.hide()

    if(event?.pinned) {
        const res = await unpinFromIndex(event?.slug)
        console.log(res)
        if(res?.unpinned) {
            dispatch('toggle-pin', event)
        }
    } else {
        const res = await pinToIndex(event?.slug)
        console.log(res)
        if(res?.pinned) {
            dispatch('toggle-pin', event)
        }
    }
}

</script>


<div class="menu fl-co" 
    class:tagMode={tagMode}
    bind:this={content}>

{#if menuMode}

    {#if authenticated && isAdmin && !isChat}
    <div class="m-item fl" on:click|stopPropagation={pinToFrontPage}>
        <div class="grd-c mr2 fl-o">
            {event?.pinned ? 'Unpin from' : 'Pin to'} front page
        </div>
        <div class="mic grd-c ico-s" >
            {@html pin}
        </div>
    </div>
    {/if}


    {#if authenticated && (isOwner || isSpaceAdmin) && !nested && !isReply && isSpace && !isChat}
    <div class="m-item fl " on:click|stopPropagation={pinEvent}>
        <div class="grd-c mr2 fl-o">
            {event?.pinned ? 'Unpin' : 'Pin'} Post
        </div>
        <div class="mic grd-c ico-s" >
            {@html pin}
        </div>
    </div>
    {/if}


    {#if authenticated && (isOwner || isSpaceAdmin)}
        <div class="m-item fl " on:click|stopPropagation={tagEvent}>
            <div class="grd-c mr2 fl-o">
                Tag Post
            </div>
            <div class="mic grd-c ico-s" >
                {@html tagIcon}
            </div>
        </div>
    {/if}

    {#if authenticated && (isPostAuthor && isReply) && !nested && isSpace}
    <div class="m-item fl " on:click|stopPropagation={pinEvent}>
        <div class="grd-c mr2 fl-o">
            {replyPinned ? 'Unpin' : 'Pin'} Reply
        </div>
        <div class="mic grd-c ico-s" >
            {@html pin}
        </div>
    </div>
    {/if}

    <div class="m-item fl" on:click|stopPropagation={viewSource}>
        <div class="grd-c mr2 fl-o">
            View source
        </div>
        <div class="mic grd-c ico-s" >
            {@html code}
        </div>
    </div>

    {#if authenticated && isAdmin && notSelf}
    <div class="m-item fl pr" on:click|stopPropagation={suspend}>
        <div class="grd-c mr2 fl-o">
            Suspend User
        </div>
        <div class="mic grd-c ico-s" >
            {@html suspendIcon}
        </div>
    </div>
    {/if}


    {#if authenticated && (isOwner || isAuthor || isAdmin)}
    <div class="m-item fl pr" on:click|stopPropagation={redactEvent}>
        <div class="grd-c mr2 fl-o">
            Delete
        </div>
        <div class="mic grd-c ico-s" >
            {@html trash}
        </div>
    </div>
    {/if}


{:else if tagMode}
<div class="tag fl">
    <div class="fl-o">
        <input 
            class="tagInput"
            on:keydown={handleEnter}
            bind:this={tagInput}
            bind:value={tag} 
            placeholder="tag"/>
    </div>
    <div class="">
                <button class="h100" on:click={addTag}>Add</button>
    </div>
</div>
{/if}

</div>

<div class="more grd-c c-ico" 
    class:ac={active}
    on:click|stopPropagation bind:this={el}>
    {@html more}
</div>

<style>
.menu {
    width: 160px;
    z-index: 901;
    padding: 0.25rem;
}
.tagMode {
    width: 240px;
}

.more {
    width: 18px;
    height: 18px;
    border-radius: 4px;
    padding: 0.25rem;
}

.more:hover {
    background-color: var(--shade-2);
}

.ac {
    background-color: var(--shade-2);
}


.m-item{
    cursor: pointer;
    border-radius: 4px;
    font-size: 0.8rem;
    font-weight: 500;
    padding: 0.4rem;
    line-height: 1.5;
}
.m-item:hover{
    background-color: var(--context-menu-hover);
}
.mic {
    width: 18px;
    height: 18px;
}
.pr {
    color: red;
}
.pr .ico-s {
    fill: red;
}
.ico-s {
    width: 16px;
    height: 16px;
}
input {
    height: 22px;
    width: 100%;
}
</style>
