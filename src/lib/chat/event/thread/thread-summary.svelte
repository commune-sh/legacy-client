<script>
import { getEventThread } from '$lib/utils/request.js'
import {thread} from '$lib/assets/icons.js'
import { goto } from '$app/navigation'
import { page } from '$app/stores'
import User from './user.svelte'

export let event;

$: user = {
    avatar_url: event?.sender?.avatar_url,
    display_name: event?.sender?.display_name,
    id: event?.sender?.id,
    username: event?.sender?.username
}

$: content = JSON.parse(event?.last_thread_reply?.content)

async function getThread() {
    const res = await getEventThread(event.event_id)
    console.log(res)
}

function goToThread() {

    let url = `${$page.url.pathname}?thread=${event.slug}`
    if($page.url.search.includes('view=chat')) {
        url = `${$page.url.pathname}?view=chat&thread=${event.slug}`
        if($page.url.search.includes('thread')) {
            url = `${$page.url.pathname}?view=chat&thread=${event.slug}`
        }
    } else if($page.url.search.includes('thread')) {
        url = `${$page.url.pathname}?thread=${event.slug}`
    }
    goto(url)
}

$: threadQuery = $page.url.searchParams.get('thread')
$: active = threadQuery === event.slug

</script>

<div class="thread-container">
    <div class="thread-summary fl" 
        class:active={active}
        on:click={goToThread}>
        <div class="np grd-c">
            <User user={user} />
        </div>
        <div class="content ml2 fl-o grd-c">
            {content?.body}
        </div>
        <div class="ml3 count grd-c fl">
            <div class="ico-s grd-c">
                {@html thread}
            </div>
            <div class="ml2 grd-c">
                {event?.thread_reply_count}
            </div>
        </div>
    </div>
</div>

<style>
.thread-container {
        display: flex;
}

.thread-summary {
    margin-top: 0.5rem;
    margin-bottom: 0.5rem;
    margin-left: calc( 30px + 2rem );
    margin-right: 1rem;
    max-width: 500px;
    background: var(--event-highlight);
    border-radius: 7px;
    border: 1px solid transparent;
    padding: 0.5rem 0.75rem;
    cursor: pointer;
}
.thread-summary:hover {
    border: 1px solid var(--primary);
}

.np {
    pointer-events: none;
}

.active {
    border: 1px solid var(--primary);
}

.content {
    font-weight: normal;
    height: 22px;
    line-height: 22px!important;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    word-break: break-word;
}
.count {
    font-weight: 500;
    font-size: 13px;
}
.ico-s {
    height: 14px;
    width: 14px;
}

</style>
