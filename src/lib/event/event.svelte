<script>
import { PUBLIC_BASE_URL } from '$env/static/public';
import { onMount, createEventDispatcher } from 'svelte'
import { store } from '$lib/store/store.js'
import { page } from '$app/stores';
import { goto } from '$app/navigation';
import MediaThumbnail from './attachments/media-thumbnail.svelte'
import LinkThumbnail from './links/link-thumbnail.svelte'
import MediaItems from './attachments/media-items.svelte'
import Reactions from '$lib/event/reactions/reactions.svelte'
import Replies from '$lib/event/replies/replies.svelte'
import User from './user/user.svelte'
import Date from './date/date.svelte'
import Edited from './edited/edited.svelte'
import Tools from './tools/tools.svelte'
import Vote from '$lib/vote/vote.svelte'
import Links from './links/links.svelte'
import { pin } from '$lib/assets/icons.js'

import { getReplyCount } from '$lib/utils/utils.js'

import MarkdownIt from 'markdown-it'
import MarkdownItEmoji from 'markdown-it-emoji'
import MarkdownItLinkAttributes from 'markdown-it-link-attributes'

import Composer from '$lib/composer/composer.svelte'

const dispatch = createEventDispatcher()

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

    return url
}

$: link = buildLink(event, $page)

function goToEvent() {


    if(isPost || isReply || toolsActive || editing) {
        return
    }

    console.log("go to event")

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

$: edited = event?.content?.['m.new_content']?.body !== undefined &&
        event?.content?.['m.new_content']?.title !== undefined

$: formatted_body = md.render(event?.content?.body)

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

$: sender_id = $store.credentials?.matrix_user_id


let reactions;

function reactToKey(e) {
    reactions.process(e.detail)
}


$: showRoomAlias = !isSpace && !isRoom && !isReply && !isTopic && !isPost

let md = new MarkdownIt("zero", {
  html: true,
  linkify: true,
  breaks: true,
  typographer: true
});

let enable = ["normalize", "block", "inline", "linkify", "autolink", 'link', 'backticks', 'emphasis', "paragraph", "text", "newline"]
md.enable(enable)

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

</script>

<div class="event" 
    bind:this={el}
    on:contextmenu={print}
    on:mouseover={showTools}
    on:mouseleave={hideTools}
    class:h={!isReply && !isPost && !editing}
    class:ha={!isReply && !isPost && (hasAttachments || hasLinks)}
    class:ma={toolsActive}
    on:click={goToEvent} 
    class:fresh={event?.just_posted}
    class:isrep={isReplyEvent}
    class:highlight={highlight || !interactive} role="button">


    <div class="ev-c fl-co"
    class:ovy={!interactive}>

        <div class="sender ph3 fl">
            <User hideAvatar={true} user={user} op={op}/>
            <div class="sm ph1"></div>
            <Date date={event?.origin_server_ts} />
            {#if wasEdited}
                <Edited date={event?.edited_on} />
            {/if}
            {#if showRoomAlias}
                <div class="sm ml2">
                    <a href={`/${event.room_alias}`}>{event.room_alias}</a>
                </div>
            {/if}
            {#if showTopic}
                <div class="sm ml2">
                    <a href={`/${event.room_alias}/topic/${event.content.topic}`}>{event.content.topic}</a>
                </div>
            {/if}
        </div>



        <div class="body" class:nonin={!interactive}>

            {#if editing && interactive}

                <Composer 
                editing={true}
                    roomID={event.room_id}
                    editingEvent={event} 
                    editingReply={isReply}
                    on:saved={finishedEditing}
                    on:kill={stopEditing}/>

            {:else}

                {#if isPost}
                    {#if !isSingleReply}
                    <div class="post-title ph3 mb1">
                        {title}
                    </div>
                    {/if}

                    <div class="post-body ph3 mb2">
                        {@html content}
                    </div>
                {:else if isReply}


                    <div class="post-body ph3">
                        {@html content}
                    </div>
                {:else}
                    <div class="post-title ph3 mb1">
                        <b>{title}</b>
                    </div>
                    <div class="post-body clipped ph3 ">
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

                {#if !isReply && interactive}
                        <div class="mr2">
                            <Replies count={event?.reply_count} />
                        </div>
                {/if}

                {#if isReply && interactive}
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

                {#if isReply && interactive && hasReplies}
                    <div class="mr2 grd-c mt2 expand" 
                        on:click={toggleReplies}>
                        {#if showingReplies}
                            <b>[-]</b>
                        {:else}
                            <b>[+{replies ? replies : null}]</b>
                        {/if}
                    </div>
                {/if}
            </div>


        </div>



    </div>

    {#if !isPost && !isReply && hasAttachments && firstIsMedia && !editing && !search}
        <MediaThumbnail media={media} />
    {/if}

    {#if !isPost && !isReply && hasLinks && !editing && !search}
        <LinkThumbnail links={links} />
    {/if}


        {#if displayTools && !editing && interactive && !bannedFromSpace}
        <div class="tools" class:asi={event?.pinned || replyPinned}>
                <Tools 
                    isReply={isReply} 
                    on:reply={replyToEvent}
                    active={toolsActive}
                    isAuthor={isAuthor}
                    isPostAuthor={isPostAuthor}
                    nested={nested}
                    on:edit={editEvent}
                    on:pin
                    on:redact
                    on:set-reply-thread
                    on:react={reactToKey}
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


{#if hasReplies && showingReplies && interactive}
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
    padding-bottom: 0.75rem;
    padding-top: 0.75rem;
    border-bottom: 1px solid var(--ev-bb);
    position: relative;
    word-break: break-word;
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
    font-weight: bold;
}

.post-body {
}


.clipped {
    font-weight: 500;
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
    font-weight: bold;
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
    top: 0.75rem;
    right: 0.75rem;
    fill: var(--primary);
}

.sender {
    margin-bottom: 0.5rem;
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
    }

    .clipped {
        margin-bottom: 0.25rem;
    }

    .post-body {
    }
}
</style>
