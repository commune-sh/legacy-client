<script>
import { page } from '$app/stores';
import { goto } from '$app/navigation';
import * as dayjs from 'dayjs'
import * as relativeTime from 'dayjs/plugin/relativeTime'
import Reactions from '../../components/event/reactions/reactions.svelte'


export let event;

function goToEvent() {
    goto(`/${$page.params.space}/p/${event?.slug}`)

}

$: dayjsr = dayjs.extend(relativeTime)

$: when = dayjsr(event?.origin_server_ts)?.fromNow()

</script>

<div class="event" on:click={goToEvent}>
    <div class="">
        <div class="avatar-base">
        </div>
    </div>
    <div class="fl-co">
        <div class="">
            {event?.content?.body}
        </div>
        <div class="pt2 fl">
            <div class="">
                <div class="">
                    {#if event?.sender?.display_name}
                        <b>{event?.sender?.display_name}</b>
                        {event?.sender?.id}
                    {:else}
                        <b>{event?.sender?.id}</b>
                    {/if}
                </div>
            </div>
            <div class="fl-o">
            </div>
            <div class="">
                <Reactions reactions={event?.reactions} />
            </div>
        </div>
        <div class="pt1">
            <span class="time" title="This is your tooltip">{when}</span>
        </div>
    </div>
</div>

<style>
.event {
    display: grid;
    grid-template-columns: 40px 1fr;
    grid-template-rows: auto;
    grid-column-gap: 10px;
    padding: 1rem;
    cursor: pointer;
}

:global(:root) {
    --ev-bb: #272727;
    --event-bg-hover: #f7f7f7;
}
:global(:root.light) {
    --ev-bb: #f2f2f2;
    --event-bg-hover: #f7f7f7;
}

.event:hover {
    background-color: var(--event-bg-hover);
}

.avatar-base {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background-color: #ccc;
}

.time {
    font-size: small;
    color: var(--text-light);
}

.time[title]:hover::after {
    background-color: red;
}
</style>
