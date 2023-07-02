<script>
import { PUBLIC_BASE_URL } from '$env/static/public'
import { createEventDispatcher } from 'svelte'
import { goto } from '$app/navigation';

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

$: from = item.from_matrix_user_id.split(':')[0].substring(1);

$: sender = `${PUBLIC_BASE_URL}/@${from}`

$: action = item?.type == `post.reply` ? `replied` : item?.type == `reaction` ? `reacted` : ``

$: post_slug = item?.relates_to_event_id?.slice(-11);
$: reply_slug = item?.event_id?.slice(-11);
$: thread_slug = item?.thread_event_id?.slice(-11);

function go() {
    dispatch('go', item)

    let url = `${PUBLIC_BASE_URL}/${item.room_alias}/post/${post_slug}?context=${reply_slug}`

    if(item.type == `reply.reply`) {
        url = `${PUBLIC_BASE_URL}/${item.room_alias}/post/${thread_slug}?context=${reply_slug}`
    }

    if(item.type == `reaction`) {
        url = `${PUBLIC_BASE_URL}/${item.room_alias}/post/${post_slug}`
    }

    goto(url)
}


</script>



<div class="item ph3 pv2 fl-co" on:click={go}>
    <div class="">
        <a href={sender}><span class="href">@{from}</span></a> {action} to your
        post "{item?.body?.substring(0, 20)}{item?.body?.length > 20 ? `...` : ``}"
    </div>
    <div class="mt1 sm">
        {isThisWeek ? when : created}
    </div>
</div>

<style>
.item {
    line-height: 1.5;
    cursor: pointer;
}
.item:hover {
    background: var(--context-menu-hover);
}
</style>
