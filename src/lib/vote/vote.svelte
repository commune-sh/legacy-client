<script>
import { createEventDispatcher } from 'svelte';
import { up, down } from '$lib/assets/icons.js';
import { savePost, redactReaction } from '$lib/utils/request.js'
import { store } from '$lib/store/store.js'
import {saveUpvote, saveDownvote} from '$lib/utils/request.js'

const dispatch = createEventDispatcher();

export let event;
export let display = false;

$: authenticated = $store?.authenticated && 
    $store?.credentials != null
    $store?.credentials?.access_token?.length > 0

async function upvote() {
    if(!authenticated) {
        store.startAuthenticating()
        return
    }

    if(!event?.upvoted && event?.downvoted) {
        events.downvoted = false
    }


    const res = await saveUpvote(event.event_id)
    console.log(res)
    if(res?.upvoted) {
        event.upvoted = true
    } else {
        event.upvoted = false
    }
}

async function downvote() {
    saveDownvote()
    if(!authenticated) {
        store.startAuthenticating()
        return
    }

    if(!event?.downvoted && event?.upvoted) {
        events.upvoted = false
    }

    const res = await saveDownvote(event.event_id)
    console.log(res)
    if(res?.downvoted) {
        event.downvoted = true
    } else {
        event.downvoted = false
    }
}

</script>


<div class="vote mr3 mt2">
    <div class="upvote grd" on:click|stopPropagation={upvote}>
        <div class="c-ico" class:ac={event?.upvoted}>
            {@html up}
        </div>
    </div>
    <div class="count ph1">
    </div>
    <div class="downvote grd" on:click|stopPropagation={downvote}>
        <div class="c-ico" class:ac={event?.downvoted}>
            {@html down}
        </div>
    </div>
</div>

<style>
.vote {
    display: grid;
    grid-template-columns: auto auto auto;
    height: 22px;
}

.c-ico {
    height: 22px;
    width: 22px;
}
.ac {
    fill: var(--primary);
}
</style>
