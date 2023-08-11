<script>
import { PUBLIC_BASE_URL, PUBLIC_MEDIA_URL } from '$env/static/public'
import { createEventDispatcher } from 'svelte'
import { goto } from '$app/navigation';
import { user as userIcon } from '$lib/assets/icons.js'

import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import tz from 'dayjs/plugin/timezone'
import relativeTime from 'dayjs/plugin/relativeTime'
import updateLocale from 'dayjs/plugin/updateLocale'

dayjs.extend(utc);
dayjs.utc()
dayjs.extend(tz)
dayjs.extend(relativeTime)
dayjs.extend(updateLocale)

dayjs.updateLocale('en', {
  relativeTime: {
    future: "in %s",
    past: "%s ago",
    s: 'just now',
    m: "1m",
    mm: "%dm",
    h: "1h",
    hh: "%dh",
    d: "1d",
    dd: "%dd",
    M: "a month",
    MM: "%d months",
    y: "a year",
    yy: "%d years"
  }
})
$: date = item?.created_at

$: isThisWeek = dayjs().diff(dayjs(date), 'day') < 7
$: when = dayjs(date)?.fromNow(true)
$: created = dayjs(date)?.format('MMM D')

const dispatch = createEventDispatcher()

export let item;

function process(item) {
    return item.body
}

$: notification = process(item)

$: localpart = `@` + item.from_matrix_user_id.split(':')[0].substring(1);

$: from = item?.display_name ? item?.display_name : localpart

$: sender = `${PUBLIC_BASE_URL}/${localpart}`

$: action = (item?.type == `post.reply` || item?.type == `reply.reply`) ?
    `replied` : item?.type == `reaction` ? `reacted` : item?.type ==
        `reply.reaction` ? `reacted` : ``

$: post_slug = item?.relates_to_event_id?.slice(-11);
$: reply_slug = item?.event_id?.slice(-11);
$: thread_slug = item?.thread_event_id?.slice(-11);

$: isChat = item?.event_type == `m.room.message`

function go() {
    dispatch('go', item)

    let view = isChat ? `chat` : `board`

    let url = `${PUBLIC_BASE_URL}/${item.room_alias}/post/${post_slug}?context=${reply_slug}`

    if(item.type == `reply.reply`) {
        url = `${PUBLIC_BASE_URL}/${item.room_alias}/post/${thread_slug}?context=${reply_slug}`
    }

    if(item.type == `reaction`) {
        url = `${PUBLIC_BASE_URL}/${item.room_alias}/post/${post_slug}`
        if(isChat) {
            url = `${PUBLIC_BASE_URL}/${item.room_alias}?view=chat&context=${post_slug}`
        }
    }

    if(item.type == `reply.reaction`) {
        url = `${PUBLIC_BASE_URL}/${item.room_alias}/post/${thread_slug}?context=${post_slug}`
    }

    if(item.type == `space.follow`) {
        url = sender
    }

    goto(url)
}

$: avatar = item?.avatar_url ?  `${PUBLIC_MEDIA_URL}/${item?.avatar_url}` : null

$: thing = isChat ? `message` : item?.type == `reply.reaction` ? `reply` : `post`

$: isReaction = item?.type == `reaction` || item?.type == `reply.reaction`


function buildBody(e) {
    if(!isReaction) {
        let b = e?.body?.substring(0, 20) + (e?.body?.length > 20 ? `...` : ``)
        return ` - "${b}"`
    } else {
        if(e.body?.includes(`https`)) {
            let b = `<img class="emoji" src="${e.body}" />`
            return ` - ${b}`
        } else {
            return ` - ${e.body}`
        }
    }
}


$: body = buildBody(item)

</script>



<div class="item ph3 pv2 fl-co" 
    on:click={go}>
    <div class="fl">
        <div class="grd-c avatar-base grd mr3"
            style="background-image: url({avatar})">
                {#if !avatar}
                        <div class="ico-s grd-c">
                            {@html userIcon}
                        </div>
                {/if}
        </div>
        <div class="fl-co">
            <div class="body">
                {#if item?.type == `space.follow`}
                <a href={sender}><span class="href">{from}</span></a> started
                    following you.
                {:else}
                <a href={sender}><span class="href">{from}</span></a> {action} to your
                    {thing} {@html body}
                {/if}
            </div>

            <div class="mt1 sm">
                {isThisWeek ? when : created}
            </div>
        </div>
    </div>


    {#if !item.read}
        <div class="dot"></div>
    {/if}
</div>

<style>
.item {
    line-height: 1.5;
    cursor: pointer;
    position: relative;
}
.item:hover {
    background: var(--context-menu-hover);
}
.unread{ 
    background: var(--primary);
}

.dot {
    top: 0.5rem;
    right: 1rem;
    height: 7px;
    width: 7px;
}

.avatar-base {
    min-width: 30px;
    width: 30px;
    height: 30px;
    min-height: 30px;
    border-radius: 50%;
    background-color: var(--shade-4);
    background-repeat: no-repeat;
    background-size: cover;
    background-position: center;
}
.ico-s {
    height: 16px;
    width: 16px;
}

div :global(.body .emoji){
    height: 20px;
    width: 20px;
    object-fit: contain;
    vertical-align: text-bottom;
}
</style>
