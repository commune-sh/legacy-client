<script>
import { page } from '$app/stores';
import { goto } from '$app/navigation';
import Reactions from '$lib/event/reactions/reactions.svelte'
import Replies from '$lib/event/replies/replies.svelte'
import User from './user/user.svelte'
import Date from './date/date.svelte'
import Menu from './menu/menu.svelte'

export let isPost = false;
export let isReply = false;
export let showAlias = true;


export let event;

$: isSpace = $page.params.space !== undefined && $page.params.space !== null &&
    $page.params.space !== ''

$: isRoom = $page.params.room !== undefined && $page.params.room !== null &&
    $page.params.room !== ''


function goToEvent() {


    if(isPost || isReply || menuActive) {
        return
    }

    let url = `/post/${event?.slug}`
    if(isSpace) {
        url = `/${event?.room_alias}/post/${event?.slug}`
    }

    if(isSpace && isRoom)  {
        url = `/${event?.room_alias}/${$page.params.room}/post/${event?.slug}`
    }

    const pathname = $page.url.pathname
    if(url == pathname) {
        url = '/'

        if(isSpace) {
            url = `/${$page.params.space}`
        }

        if(isSpace && isRoom)  {
            url = `/${$page.params.space}/${$page.params.room}`
        }

        goto(url, {
            noscroll: true,
        })

        return
    }

    goto(url, {
        noscroll: true,
    })
}


$: content = event?.content?.formatted_body ? event?.content?.formatted_body :
    event?.content?.body

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

let menuActive = false;

function showMenu() {
    menuActive = true
}
function killMenu() {
    setTimeout(() => {
        menuActive = false
    }, 100)
}

</script>

<div class="event" 
    class:h={!isReply && !isPost}
    class:ma={menuActive}
    on:click={goToEvent} 
    class:highlight={highlight}>
    <div class="fl-co">
        <div class="">
            {@html content}
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
            <div class="menu" class:men={menuActive}>
                <Menu 
                    on:active={showMenu} 
                    on:kill={killMenu} 
                    event={event} />
            </div>
        </div>
    </div>
</div>

<style>
.event {
    display: grid;
    grid-template-columns: auto;
    grid-template-rows: auto;
    grid-column-gap: 10px;
    padding: 1rem;
    border-bottom: 1px solid var(--ev-bb);
}

.event:hover .menu {
    opacity: 1;
}


:global(:root) {
    --ev-bb: #272727;
    --rep-bb: #f2f2f2;
    --event-bg-hover: #181818;
}
:global(:root.light) {
    --ev-bb: #f2f2f2;
    --rep-bb: #f2f2f2;
    --event-bg-hover: #f7f7f7;
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

.menu {
    opacity: 0;
}
.men {
    opacity: 1;
}
</style>
