<script>
import { onMount, createEventDispatcher } from 'svelte'
import { store } from '$lib/store/store.js'
import { page } from '$app/stores';
import { goto } from '$app/navigation';
import ImageThumbnail from './attachments/image-thumbnail.svelte'
import Images from './attachments/images.svelte'
import Reactions from '$lib/event/reactions/reactions.svelte'
import Replies from '$lib/event/replies/replies.svelte'
import User from './user/user.svelte'
import Date from './date/date.svelte'
import Tools from './tools/tools.svelte'

const dispatch = createEventDispatcher()

export let isPost = false;
export let isReply = false;
export let showAlias = true;


export let event;
export let sender;

export let depth = 0;

export let nested = false;

$: isSpace = $page.params.space !== undefined && $page.params.space !== null &&
    $page.params.space !== ''

$: isRoom = $page.params.room !== undefined && $page.params.room !== null &&
    $page.params.room !== ''

$: isTopic = $page.params.topic !== undefined && $page.params.topic !== null &&
    $page.params.topic !== ''

let el;

onMount(() => {
    if (isReplyEvent) {
        if(el) {
            el.scrollIntoView({ behavior: "smooth" });
        }
    }
    if (event?.just_posted) {
        if(el) {
            el.scrollIntoView({ behavior: "smooth" });
        }
    }
})


$: topic = $page.params.topic

function buildLink(e, page) {
    let url = `/post/${e?.slug}`
    if(isSpace) {
        url = `/${e?.room_alias}/post/${e?.slug}`
    }

    if(isTopic) {
        url = `/${e?.room_alias}/topic/${topic}/post/${e?.slug}`
    }

    /*
    if(isSpace && isRoom)  {
        url = `/${e?.room_alias}/${page.params.room}/post/${e?.slug}`
    }
    */


    //if post is opened, we close it and go to space or room
    const pathname = page.url.pathname
    if(url == pathname) {
        url = '/'

        if(isSpace) {
            url = `/${page.params.space}`
        }

        if(isSpace && isRoom)  {
            url = `/${page.params.space}/${page.params.room}`
        }

    }

    return url
}

$: link = buildLink(event, $page)

function goToEvent() {


    if(isPost || isReply || toolsActive) {
        return
    }

    goto(link, {
        noscroll: true,
    })
}

function getFirstParagraphNode(content) {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = content;
  const firstParagraphNode = tempDiv.querySelector('p');
  return firstParagraphNode?.innerHTML || null;
}

$: content = event?.content?.formatted_body ? event?.content?.formatted_body :
    event?.content?.body


$: clipped = getFirstParagraphNode(content)

$: title = event?.content?.title ? event?.content?.title : `Untitled`

$: attachments = event?.content?.attachments
$: hasAttachments = event?.content?.attachments?.length > 0

$: images = attachments?.filter(a => a?.type?.startsWith('image'))


function fetchReplies() {
    console.log("lol")
}


$: highlight = $page.params.post === event?.slug && !isPost


$: user = {
    avatar_url: event?.sender?.avatar_url,
    display_name: event?.sender?.display_name,
    id: event?.sender?.id,
    username: event?.sender?.username
}

let toolsActive = false;

function activateTools() {
    toolsActive = true
}
function killTools() {
    toolsActive = false
    displayTools = false
}

let displayTools = false;

function showTools() {
    displayTools = true
}

function hideTools() {
    if(toolsActive) {
        return
    }
    displayTools = false
}

let emp = false;
$: if($store.emojiPicker.active && toolsActive) {
    emp = true
}

$: if(!$store.emojiPicker.active) {
    killTools()
    emp = false
}


function replyToEvent() {
    if(!isPost && !isReply && !isPost) {
        //goToEvent()
        return
    }
    dispatch('replyTo', event)
}

$: hasReplies = event?.children?.length > 0

$: op = sender == user?.id

$: replyParam = $page.params.reply !== undefined && $page.params.reply !== null && $page.params.reply !== ''
$: isReplyEvent = replyParam && $page.params?.reply === event?.slug


$: isSingleReply = $page.params.reply !== undefined && $page.params.reply !== null && $page.params.reply !== ''


</script>

<div class="event" 
    bind:this={el}
    on:mouseover={showTools}
    on:mouseleave={hideTools}
    class:h={!isReply && !isPost}
    class:ha={!isReply && !isPost && hasAttachments}
    class:ma={toolsActive}
    on:click={goToEvent} 
    class:fresh={event?.just_posted}
    class:isrep={isReplyEvent}
    class:highlight={highlight} role="button">


    {#if isReply}
    {/if}
    <div class="ev-c fl-co">
        <div class="body">

            <div class="ph3 fl mb3">
                <User hideAvatar={true} user={user} op={op}/>
                <div class="sm ph1"></div>
                <Date date={event?.origin_server_ts} />
            </div>

            {#if isPost}
                {#if !isSingleReply}
                <div class="post-title pb3 ph3">
                    {title}
                </div>
                {/if}

                <div class="post-body ph3">
                    {@html content}
                </div>
            {:else if isReply}


                <div class="post-body ph3">
                    {@html content}
                </div>
            {:else}
                <div class="post-title-default ph3">
                    <b>{title}</b>
                </div>
                <div class="post-body clipped ph3">
                    {@html clipped}
                </div>
            {/if}

            {#if (isPost || isReply) && hasAttachments && images}
                <Images images={images} />
            {/if}


        </div>

        <div class="fl ph3 pt2">

            {#if !isReply}
                    <div class="mr2">
                        <Replies count={event?.reply_count} />
                    </div>
            {/if}


                <div class="">
                <Reactions 
                    event={event} 
                    isReply={isReply}
                    on:active={activateTools} 
                hovered={displayTools}/>
                </div>
        </div>

    </div>

    {#if !isPost && !isReply && hasAttachments && images}
        <ImageThumbnail images={images} />
    {/if}

        {#if displayTools}
            <div class="tools">
                <Tools 
                    isReply={isReply} 
                    on:reply={replyToEvent}
                    active={toolsActive}
                    on:active={activateTools} 
                    on:kill={killTools} 
                    event={event} />
            </div>
        {/if}

</div>


{#if hasReplies}
    <div class="replies">
        <div class="gap"></div>
        <div class="events">
        {#each event.children as reply}
            <svelte:self 
                isReply={true} 
                depth={depth + 1}
                nested={true}
                event={reply} 
                sender={sender}
                on:replyTo/>
        {/each}
        </div>
    </div>
{/if}

<style>
.event {
    display: grid;
    grid-template-columns: auto;
    grid-template-rows: auto;
    padding-bottom: 1rem;
    padding-top: 1rem;
    border-bottom: 1px solid var(--ev-bb);
    overflow: hidden;
    position: relative;
}

.replies {
    display: grid;
    grid-template-columns: 3px 1fr;
    grid-column-gap: 3px;
}
.gap {
    margin-left: 3px;
    width: 1px;
    background-color: var(--reply-gap);
}

.ha {
    grid-template-columns: 1fr auto;
}

.event:hover .tools {
    opacity: 1;
}


.ev-c {
    overflow: hidden;
}


.h {
    cursor: pointer;
}

.h:hover {
    background-color: var(--event-bg-hover);
}

.ma {
    background-color: var(--event-bg-hover);
}

.highlight {
    background-color: var(--event-highlight);
}

.tools {
    position: absolute;
    top: 0.75rem;
    right: 0.75rem;
}

.body {
    line-height: 1.5;
    user-select: text;
    overflow: hidden;
}


.post-title {
    font-weight: bold;
}

.post-body {

}

:global(.post-body p:first-of-type){
    margin-block-start: 0;
}

:global(.post-body p:last-of-type){
    margin-block-end: 0;
}

.clipped {
    font-size: 14px!important;
    font-weight: 500;
    height: 30px;
    line-height: 30px!important;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    word-break: break-word;
}
.clipped p {
    margin-block-start: 0;
    margin-block-end: 0;
    margin-inline-start: 0px;
    margin-inline-end: 0px;
}

.fresh {
    animation-name: fadeOut;
    animation-duration: 6s;
}

@keyframes fadeOut {
  from {
    background-color: var(--just-posted-bg);
  }
  to {
    background-color: var(--bg);
  }
}


.isrep {
}

</style>
