<script>
import { PUBLIC_BASE_URL } from '$env/static/public'
import { createEventDispatcher } from 'svelte'
import { goto } from '$app/navigation';

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



<div class="item pa3" on:click={go}>
    <a href={sender}><span class="href">@{from}</span></a> {action} to your
    post "{item?.body?.substring(0, 20)}{item?.body?.length > 20 ? `...` : ``}"
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
