<script>
import { page } from '$app/stores';
import { goto } from '$app/navigation';
import * as dayjs from 'dayjs'
import * as relativeTime from 'dayjs/plugin/relativeTime'
import Reactions from '../../components/event/reactions/reactions.svelte'

export let isReply = false;
export let showAlias = false;


export let event;

function goToEvent() {
    goto(`/${event?.room_alias}/p/${event?.slug}`, {
        noscroll: true,
    })
}

$: isToday = dayjs().isSame(dayjs(event?.origin_server_ts), 'day')
$: dayjsr = dayjs.extend(relativeTime)
$: when = dayjsr(event?.origin_server_ts)?.fromNow(true)
$: created = dayjs(event?.origin_server_ts)?.format('MMM D')


$: content = event?.content?.formatted_body ? event?.content?.formatted_body :
    event?.content?.body

function fetchReplies() {
    console.log("lol")
}


$: highlight = $page.params.post === event?.slug
</script>

<div class="event" on:click={goToEvent} class:highlight={highlight}>
    <div class="fl-co">
        <div class="">
        </div>
        <div class="">
            {@html content}
        </div>
        <div class="pt2 fl">
            <div class="fl">
                <div class="">
                    <div class="avatar-base">
                    </div>
                </div>
                <div class="">
                    {event?.sender?.display_name}
                </div>
            </div>
            <div class="fl-o">
            </div>
            <div class="">
                <Reactions reactions={event?.reactions} />
            </div>
            {#if event?.reply_count > 0}
                <div class="rep ml3" on:click={fetchReplies}>
                    {event?.reply_count} replies
                </div>
            {/if}
        </div>
        <div class="pt1">
            {#if showAlias && event?.room_alias}
                <a href={`/${event?.room_alias}`}>
                <span class="time" title={event?.room_alias}>{event?.room_alias}</span>
            </a>
            {/if}
        </div>
        <div class="pt1">
            {#if isToday}
                <span class="time" title={when}>{when}</span>
            {:else}
                <span class="time" title={created}>{created}</span>
            {/if}
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
    cursor: pointer;
    border-bottom: 1px solid var(--ev-bb);
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

.event:hover {
    background-color: var(--event-bg-hover);
}

.highlight {
    background-color: var(--event-bg-hover);
}

.avatar-base {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background-color: #ccc;
}

.rep {
    font-size: small;
    line-height: 1;
    color: var(--text-light);
    border: 2px solid var(--rep-bb);
    padding-left: 0.25rem;
    padding-right: 0.25rem;
}


.time {
    font-size: small;
    color: var(--text-light);
}

.time[title]:hover::after {
    background-color: red;
}
</style>
