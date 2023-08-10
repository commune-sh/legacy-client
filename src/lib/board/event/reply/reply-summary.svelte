<script>
import { createEventDispatcher } from 'svelte'
import { store } from '$lib/store/store.js'
import { extractMatrixID, getLocalpart } from '$lib/utils/utils.js'
import User from '$lib/board/event/user/user.svelte'

const dispatch = createEventDispatcher()

export let event;

$: legacy = event?.content?.formatted_body?.includes(`mx-reply`)

$: modern = !legacy &&
    event?.content?.['m.relates_to']?.['m.in_reply_to']?.formatted_body !==
        undefined

$: user_id = modern ?
    event?.content?.['m.relates_to']?.['m.in_reply_to']?.sender :
    extractMatrixID(event?.content?.formatted_body)
    

$: member = $store.roomMembers[event?.room_id]?.find(m => m.user_id === user_id)

$: user = {
    avatar_url: member?.avatar_url,
    display_name: member?.display_name,
    id: user_id,
    username: user_id ? getLocalpart(user_id) : ``
}

const regex = /(?:>\s*<@.*?>\s*)(.*?)\n\n/;


$: lc = event?.content?.body?.match(regex)?.[1]

$: body = modern ?
    event?.content?.['m.relates_to']?.['m.in_reply_to']?.formatted_body :
    lc

function focusReplyEvent() {
    dispatch('focus-reply', event?.content?.['m.relates_to']?.['m.in_reply_to']?.event_id)
}
</script>

<div class="rep-s" on:click={focusReplyEvent}>
    <div class="spine-c">
        <div class="spine">
        </div>
    </div>
    <div class="rep-e">
        <User {user} reply={true}/>
        <div class="body ml2 grd-c">
            {@html body}
        </div>
    </div>
</div>

<style>
.rep-s {
    display: grid;
    grid-template-columns: calc(30px + 2rem) 1fr;
    margin-bottom: 0.25rem;
    cursor: pointer;
}

.rep-e {
    display: grid;
    grid-template-columns: auto 1fr;
}

.spine-c {
    position: relative;
    display: grid;
}

.spine {
    position: absolute;
    margin-top: 7px;
    margin-left: calc(13px + 1rem);
    margin-right: 4px;
    border-left: 2px solid var(--shade-4);
    border-top: 2px solid var(--shade-4);
    border-radius: 7px 0 0 0;
    height: 12px;
    width: 28px;
    top: 0;
    left: 0;
}

.body {
    width: 100%;
    font-size: 12px;
    color: var(--text-light);
    height: 12px;
    line-height: 12px!important;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    word-break: break-word;
}
.rep-s:hover .body{
    color: var(--text-1);
}

</style>
