<script>
import { PUBLIC_BASE_URL } from '$env/static/public';
import { savePost } from '$lib/utils/request.js'
import { onMount, createEventDispatcher } from 'svelte'
import { store } from '$lib/store/store.js'
import { page } from '$app/stores';
import { goto } from '$app/navigation';
import MediaThumbnail from './attachments/media-thumbnail.svelte'
import LinkThumbnail from './links/link-thumbnail.svelte'
import MediaItems from './attachments/media-items.svelte'
import Reactions from '$lib/board/event/reactions/reactions.svelte'
import Replies from '$lib/board/event/replies/replies.svelte'
import User from './user/user.svelte'
import Date from './date/date.svelte'
import Time from './date/time.svelte'
import Edited from './edited/edited.svelte'
import Tools from './tools/tools.svelte'
import Vote from '$lib/vote/vote.svelte'
import Links from './links/links.svelte'
import { pin, hash } from '$lib/assets/icons.js'
import { isSafari } from '$lib/utils/utils.js'

import { getReplyCount } from '$lib/utils/utils.js'

import MarkdownIt from 'markdown-it'
import MarkdownItEmoji from 'markdown-it-emoji'
import MarkdownItLinkAttributes from 'markdown-it-link-attributes'

import Composer from '$lib/composer/composer.svelte'

const dispatch = createEventDispatcher()

export let isChat = false;
export let messages;
export let index;
export let isPost = false;
export let isReply = false;
export let showAlias = true;
export let interactive = true;
export let search = false;

export let isPostAuthor = false;;


export let event;
export let sender;

export let depth = 0;

export let nested = false;

$: isDomain = $page.params.domain !== undefined && 
    $page.params.domain !== 'undefined' && 
    $page.params.domain?.length > 0

$: isSpace = $page.params.space !== undefined && $page.params.space !== null &&
    $page.params.space !== ''

$: isRoom = $page.params.room !== undefined && $page.params.room !== null &&
    $page.params.room !== ''

$: isTopic = $page.params.topic !== undefined && $page.params.topic !== null &&
    $page.params.topic !== ''

let el;

async function save() {
    const res = await savePost(event)
    console.log(res)
    if(res?.success) {
        event.unsent = false
        event = res?.event
        event = event
    }
}

onMount(() => {
    if(event?.unsent) {
        save()
    }

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

$: isDomain = $page.params.domain !== undefined && 
    $page.params.domain !== 'undefined' && 
    $page.params.domain?.length > 0

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

    if(isDomain) {
        url = `/${page.params.domain}${url}`
    }

    if(page.url.search) {
        url = `${url}${page.url.search}`
    }

    if(page.url.pathname.startsWith('/all')) {
        url = `/all${url}`
    }

    return url
}

$: link = buildLink(event, $page)

function goToEvent() {


    if(isPost || isReply || toolsActive || editing || isChat) {
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


$: safari = isSafari()


$: edited = event?.content?.['m.new_content']?.body !== undefined &&
        event?.content?.['m.new_content']?.title !== undefined

$: formatted_body = event?.content?.body ? md.render(event?.content?.body) : null

$: content = formatted_body ? formatted_body :
    event?.content?.body


$: clipped = getFirstParagraphNode(content)

$: title = event?.content?.title ? event?.content?.title : `Untitled`

$: attachments = event?.content?.attachments
$: hasAttachments = event?.content?.attachments?.length > 0
$: links = event?.content?.links
$: hasLinks = event?.content?.links?.length > 0

$: media = attachments?.filter(a => a?.type?.startsWith('image') ||
a?.type?.startsWith('video'))
$: firstIsMedia = attachments?.[0]?.type?.startsWith('image') ||
    attachments?.[0]?.type?.startsWith('video')



$: highlight = $page.params.post === event?.slug && !isPost && !isChat

$: context = $page.url?.search == `?context=${event?.slug}`

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
    dispatch('replyTo', event)
}

$: hasReplies = event?.children?.length > 0

$: op = sender == user?.id

$: replyParam = $page.params.reply !== undefined && $page.params.reply !== null && $page.params.reply !== ''
$: isReplyEvent = replyParam && $page.params?.reply === event?.slug


$: isSingleReply = $page.params.reply !== undefined && $page.params.reply !== null && $page.params.reply !== ''

$: sender_id = $store.credentials?.matrix_user_id


let reactions;

function reactToKey(e) {
    reactions.process(e.detail)
}

function addTag(e) {
    reactions.process(e.detail)
}


$: showRoomAlias = !isSpace && !isRoom && !isReply && !isTopic && !isPost

let md = new MarkdownIt({
  html: true,
  linkify: true,
  breaks: true,
  typographer: true
});


md.linkify.set({ fuzzyEmail: false })

md.linkify.add('/', {
    validate: function (text, pos, self) {
        var tail = text.slice(pos);

        if (!self.re.space) {
            self.re.space =  new RegExp(
                '^([a-zA-Z0-9_]){1,15}(?!_)(?=$|' + self.re.src_ZPCc + ')'
            );
        }
        if (self.re.space.test(tail)) {
            if (pos >= 2 && tail[pos - 2] === '/') {
                return false;
            }
            return tail.match(self.re.space)[0].length;
        }
        return 0;
    },

    normalize: function (match) {
        match.url = `${PUBLIC_BASE_URL}/` + match.url.replace(/^\//, '');
    }
});


md.linkify.add('@', {
    validate: function (text, pos, self) {
        var tail = text.slice(pos);

        if (!self.re.mention) {
            self.re.mention =  new RegExp(
                '^([a-zA-Z0-9_]){1,15}(?!_)(?=$|' + self.re.src_ZPCc + ')'
            );
        }
        if (self.re.mention.test(tail)) {
            if (pos >= 2 && tail[pos - 2] === '@') {
                return false;
            }
            return tail.match(self.re.mention)[0].length;
        }
        return 0;
    },

    normalize: function (match) {
        match.url = `${PUBLIC_BASE_URL}/@` + match.url.replace(/^@/, '');
    }
});

md.use(MarkdownItEmoji);
md.use(MarkdownItLinkAttributes, [
    {
        matcher(href) {
            return href.includes('@')
        },
        attrs: {
            class: "mention"
        },
    },
    {
        matcher(href) {
            return href.match(/^https?:\/\//);
        },
        attrs: {
            class: "external",
            target: "_blank",
            rel: "noopener",
        },
    },
    {
        matcher(href) {
            return href.startsWith("/");
        },
        attrs: {
            class: "absolute-link",
        },
    },
    {
        matcher(href) {
            return href.startsWith("/blue/");
        },
        attrs: {
            class: "link-that-contains-the-word-blue",
        },
    },
]);


$: isAuthor = sender_id === event?.sender?.id

let editing = false;
function editEvent() {
    editing = true
}
function stopEditing() {
    setTimeout(() => {
        editing = false
    }, 10)
}
function finishedEditing(e) {
    event.content.title = e.detail.content.title
    event.content.body = e.detail.content.body
    editing = false
    if(isPost) {
        dispatch('edited', event)
    }
}


function print(e) {
    e.preventDefault()
    console.log(event)
}

$: wasEdited = event?.edited_on !== undefined && event?.edited_on !== null &&
    event?.edited_on > 0

let showingReplies = true
function toggleReplies() {
    showingReplies = !showingReplies
}

$: replies = getReplyCount(event)


$: hasTopic = event?.content?.topic !== undefined && event?.content?.topic !==
    null && event?.content?.topic !== ''

$: showTopic = hasTopic && !isTopic


$: replyPinned = isReply && event?.reactions?.filter(r => r.key === 'pinned').length > 0

$: state = $store?.states[$page?.params?.space]
$: bannedFromSpace = state?.banned === true

$: roomAlias = isDomain ? `${$page.params.domain}/${event.room_alias}` :
    event.room_alias

$: showMediaThumbnail = !isPost && !isReply && hasAttachments && firstIsMedia && !editing && !search

$: showLinkThumbnail = !isPost && !isReply && hasLinks && !editing && !search

let dragging = false;

function dragStart(e) {
    $store.draggable = 'post'
    dragging = true;
    e.dataTransfer.setData('text/plain', JSON.stringify(event));

    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setDragImage(new Image(), 0, 0);
}

function dragEnd() {
    dragging = false;
    $store.draggable = null
}

$: moveActive = $store.movingPost == event?.event_id

function togglePin() {
    event.pinned = !event.pinned
}


$: diff = (isChat && messages) ?
    (event.origin_server_ts - messages[index -1]?.origin_server_ts) / 1000: 0

//$: showSender = diff > 400

$: showSender = isChat && messages && messages[index-1]?.type == 'm.room.message' ?
    diff > 400 : true


</script>

<div class="event" 
    bind:this={el}
    draggable={!isReply && !isPost && !editing && interactive && !moveActive &&
    !isChat}
    on:dragstart={dragStart}
    on:dragend={dragEnd}
    class:dragging={dragging}
    on:contextmenu={print}
    on:mouseover={showTools}
    on:mouseleave={hideTools}
    class:h={!isReply && !isPost && !editing && !isChat}
    class:chat={isChat}
    class:shs={isChat && showSender}
    class:ha={!isReply && !isPost && (hasAttachments || hasLinks)}
    class:ma={toolsActive}
    class:bb={isPost || isReply}
    on:click={goToEvent} 
    class:fresh={event?.just_posted}
    class:isrep={isReplyEvent}
    class:context={context}
    class:highlight={highlight || !interactive} role="button">

    {#if (dragging || moveActive) && (!isReply && !isPost)}
        <div class="drg">
            <div class="drgm">
                {#if moveActive}
                    Moving...
                {:else}
                    Move Post
                {/if}
            </div>
        </div>
    {/if}


    <div class="ev-c fl-co"
    class:ovy={!interactive}>
        <div class="sender ph3 fl" 
            class:snm={isChat && showSender}
            class:hide={isChat && !showSender}>
            <User isChat={isChat} hideAvatar={false} user={user} op={op}/>
            <div class="grd-c ph1"></div>
            <Date date={event?.origin_server_ts} />
            {#if wasEdited}
                <Edited date={event?.edited_on} />
            {/if}
            {#if showRoomAlias}
                <div class="grd-c ml2">
                    <a href={`/${roomAlias}`}>{event.room_alias}</a>
                </div>
            {/if}
            {#if showTopic}
                <div class="ico-s sn grd-c ml2">
                    {@html hash}
                </div>
                <div class="grd-c ">
                    <a href={`/${event.room_alias}/topic/${event.content.topic}`}>{event.content.topic}</a>
                </div>

            {/if}
        </div>



        <div class="body" class:nonin={!interactive}
            class:ch={isChat}>

            {#if editing && interactive}

                <Composer 
                editing={true}
                    roomID={event.room_id}
                    editingEvent={event} 
                    editingReply={isReply}
                    on:saved={finishedEditing}
                    on:kill={stopEditing}/>

            {:else}

                {#if isChat}
                    <div class="chat-message">
                        <div class="chti">
                            <Time date={event?.origin_server_ts} />
                        </div>
                        <div class="chp post-body pr3 pci"
                        class:unsent={event?.unsent}>
                            {@html content}
                        </div>
                    </div>
                {:else if isPost}
                    {#if !isSingleReply}
                    <div class="post-title ph3 pb2 pti">
                        {title}
                    </div>
                    {/if}

                    <div class="post-body ph3 mb2 pci">
                        {@html content}
                    </div>
                {:else if isReply}


                    <div class="post-body ph3">
                        {@html content}
                    </div>
                {:else}
                    <div class="post-title ph3">
                        {title}
                    </div>
                    <div class="post-body pba clipped ph3 ">
                        {@html clipped}
                    </div>
                {/if}

            {/if}

            {#if (isPost || isReply) && hasAttachments && media}
                <MediaItems media={media} />
            {/if}

            {#if (isPost || isReply) && hasLinks}
                <Links event={event} />
            {/if}



            <div class="rec-a fl ph3">

                {#if !isReply && interactive && !isChat}
                        <Replies count={event?.reply_count} />
                {/if}

                {#if isReply && interactive && !isChat}
                    <Vote event={event} />
                {/if}



                {#if interactive}
                    <Reactions 
                        on:update-reactions
                        bind:this={reactions}
                        on:react={reactToKey}
                        event={event} 
                        isReply={isReply}
                        on:active={activateTools} 
                    hovered={displayTools}/>
                {/if}

                <div class="fl-o"></div>

                {#if isReply && interactive && hasReplies && !isChat}
                    <div class="mr2 grd-c mt2 expand" 
                        on:click={toggleReplies}>
                        {#if showingReplies}
                            [-]
                        {:else}
                            [+{replies ? replies : null}]
                        {/if}
                    </div>
                {/if}
            </div>


        </div>




    </div>

    {#if showMediaThumbnail && !isChat}
        <MediaThumbnail media={media} />
    {/if}

    {#if showLinkThumbnail && !showMediaThumbnail && !isChat}
        <LinkThumbnail links={links} />
    {/if}


        {#if !safari && displayTools && !editing && interactive && !bannedFromSpace && !dragging}
        <div class="tools" 
            class:chto={isChat && !showSender}
            class:asi={event?.pinned || replyPinned}>
                <Tools 
                    isReply={isReply} 
                    isPost={isPost}
                    on:reply={replyToEvent}
                    active={toolsActive}
                    isAuthor={isAuthor}
                    isPostAuthor={isPostAuthor}
                    nested={nested}
                    on:edit={editEvent}
                    on:toggle-pin={togglePin}
                    on:pin
                    on:redact
                    on:set-reply-thread
                    on:react={reactToKey}
                    on:add-tag={addTag}
                    on:active={activateTools} 
                    on:kill={killTools} 
                    event={event} />
            </div>
        {/if}



    {#if event.pinned || replyPinned}
        <div class="pin ico-s">
            {@html pin}
        </div>
    {/if}

</div>


{#if hasReplies && showingReplies && interactive && !isChat}
    <div class="replies">
        <div class="gap"></div>
        <div class="events">
        {#each event.children as reply}
            <svelte:self 
                isReply={true} 
                depth={depth + 1}
                nested={true}
                on:redact
                event={reply} 
                on:set-reply-thread
                isPostAuthor={isPostAuthor}
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
    padding-bottom: 0.5rem;
    padding-top: 0.5rem;
    position: relative;
    word-break: break-word;
    position: relative;
}

.bb {
    border-bottom: 1px solid var(--ev-bb);
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

.chat {
    padding-top: 0;
    padding-bottom: 0.125rem;
}

.shs {
    padding-top: 0.5rem;
}

.ev-c {
    overflow: hidden;
}

.ovy {
    overflow-y: auto;
    max-height: 140px;
}

.h {
    cursor: pointer;
}

.h:hover {
    background-color: var(--event-bg-hover);
}

.ch:hover {
    background-color: var(--event-bg-hover);
}

.ma {
    background-color: var(--event-bg-hover);
}

.highlight {
    background-color: var(--event-highlight);
}
.context {
    border: 1px solid var(--primary);
}


.tools {
    position: absolute;
    top: 0.75rem;
    right: 0.75rem;
}

.chto {
    top: -1.75rem;
}

.asi {
    right: 2.75rem;
}

.body {
    line-height: 1.5;
    user-select: text;

}

.nonin {
    overflow-y: auto;
}


.post-title {
    font-weight: 500;
}

.post-body {
    font-weight: 400;
}

.pba {
    color: var(--text-light);
}


.clipped {
    font-weight: normal;
    height: 22px;
    line-height: 22px!important;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    word-break: break-word;
    margin-bottom: 0.5rem;
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

:global(p) {
}

:global(p:first-of-type){
    margin-block-start: 0;
}

:global(p:last-of-type){
    margin-block-end: 0;
}

.expand {
    font-weight: 500;
    font-size: small;
    cursor: pointer;
    opacity: 0.5;
    transition: 0.1s;
}
.expand:hover {
    opacity: 1;
}

.pin {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    fill: var(--primary);
    height: 18px;
    width: 18px;
}

.sender {
    margin-bottom: 0.5rem;
    font-size: small;
}

.snm {
    margin-bottom: 0;
}

.sn {
    height: 12px;
    width: 12px;
}

.pti {
    font-size: 16px;
}

.pci {
    font-size: 15px;
}

@keyframes fadeOut {
  from {
    background-color: var(--just-posted-bg);
  }
  to {
    background-color: var(--bg);
  }
}


@media screen and (max-width: 768px) {
    .event {
        padding-bottom: 0.5rem;
        padding-top: 0.5rem;
    }
    .sender {
        margin-bottom: 0.25rem;
        font-size: 12px;
    }

    .clipped {
        margin-bottom: 0.25rem;
        font-size: 13px;
    }

    .post-body {
    }
}
.dragging {
    cursor: grabbing;
}
.drg {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    cursor: grabbing;
    z-index: 100;
    border: 2px solid var(--primary);
    border-radius: 7px;
    transition: 0.1s;
}

.drgm {
    position: absolute;
    right: 0;
    top: 0;
    background: var(--primary);
    padding: 0.25rem 0.5rem;
    color: white;
    font-size: small;
    font-weight: 500;
    border-radius: 0 0 0 7px;
}
.hide {
     display: none;
}

.chat-message {
    position: relative;
    display: grid;
    grid-template-columns: calc(30px + 2rem) 1fr;
}

.event:hover .chat-message {
    background-color: var(--event-bg-hover);
}

.chti {
    display: grid;
    opacity: 0;
}

.chat-message:hover .chti {
    opacity: 1;
}

.unsent {
    opacity: 0.2;
}
</style>
