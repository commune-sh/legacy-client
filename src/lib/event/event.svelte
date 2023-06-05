<script>
import { createEventDispatcher } from 'svelte'
import { PUBLIC_MEDIA_URL, PUBLIC_APP_NAME } from '$env/static/public';
import { page } from '$app/stores';
import { goto } from '$app/navigation';
import Composer from '$lib/composer/composer.svelte'
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

$: isSpace = $page.params.space !== undefined && $page.params.space !== null &&
    $page.params.space !== ''

$: isRoom = $page.params.room !== undefined && $page.params.room !== null &&
    $page.params.room !== ''


function buildLink(e, page) {
    let url = `/post/${e?.slug}`
    if(isSpace) {
        url = `/${e?.room_alias}/post/${e?.slug}`
    }

    /*
    if(isSpace && isRoom)  {
        url = `/${e?.room_alias}/${page.params.room}/post/${e?.slug}`
    }
    */

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


function fetchReplies() {
    console.log("lol")
}


$: highlight = $page.params.post === event?.slug


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

function getURL(item) {
    return `${PUBLIC_MEDIA_URL}/${item.key}`
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


function replyToEvent() {
    if(!isPost && !isReply && !isPost) {
        //goToEvent()
        return
    }
    dispatch('replyTo', event)
}

</script>

<div class="event" 
    on:mouseover={showTools}
    on:mouseleave={hideTools}
    class:h={!isReply && !isPost}
    class:ha={!isReply && !isPost && hasAttachments}
    class:ma={toolsActive}
    on:click={goToEvent} 
    class:highlight={highlight}>
    <div class="ev-c fl-co">
        <div class="body">
            {#if isPost}
                <div class="post-title">
                    {title}
                </div>
                <div class="post-body">
                    {@html content}
                </div>
            {:else if isReply}
                <div class="post-body">
                    {@html content}
                </div>
            {:else}
                <div class="post-title-default">
                    <b>{title}</b>
                </div>
                <div class="post-body clipped">
                    {@html clipped}
                </div>
            {/if}
        </div>

        <div class="pt2 fl">
            <User hideAvatar={true} user={user} />
            <div class="fl-o">
            </div>
            <div class="">
                <Reactions reactions={event?.reactions} />
            </div>
            {#if event?.reply_count > 0}
                <Replies count={event?.reply_count} />
            {/if}
        </div>
        <div class="pt1 fl">
            <div class="">
                <Date date={event?.origin_server_ts} />
            </div>
            <div class="fl-o">
            </div>


        </div>
    </div>

    {#if !isPost && !isReply && hasAttachments}
    <div class="grd">
        <div class="at-img grd-c" 
            style="background-image: url({getURL(attachments[0])})">
        </div>
    </div>
    {/if}

    {#if (isPost || isReply) && hasAttachments}
    <div class="grd">
        <div class="at-img grd-c" 
            style="background-image: url({getURL(attachments[0])})">
        </div>
    </div>
    {/if}


        {#if displayTools}
            <div class="tools">
                <Tools 
                    on:reply={replyToEvent}
                    active={toolsActive}
                    on:active={activateTools} 
                    on:kill={killTools} 
                    event={event} />
            </div>
        {/if}


</div>

<style>
.event {
    display: grid;
    grid-template-columns: auto;
    grid-template-rows: auto;
    grid-column-gap: 10px;
    padding: 1rem;
    border-bottom: 1px solid var(--ev-bb);
    overflow: hidden;
    position: relative;
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
    background-color: var(--event-bg-hover);
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

.at-img {
    height: 100px;
    width: 100px;
    border-radius: 2px;
    background-repeat: no-repeat;
    background-size: cover;
    background-position: center;
}

</style>
