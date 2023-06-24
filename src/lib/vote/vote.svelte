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
        store.startAuthenticating("login")
        return
    }

    if(event?.upvoted) {
        event.upvoted = false
    } else {
        event.upvoted = true
    }
    const res = await saveUpvote(event.event_id)
    console.log(res)
    event.upvoted = res?.upvoted

    if(event?.downvoted) {
        event.downvoted = false
        const res = saveDownvote(event.event_id)
        console.log(res)
    }

}

async function downvote() {
    saveDownvote()
    if(!authenticated) {
        store.startAuthenticating("login")
        return
    }

    if(event?.downvoted) {
        event.downvoted = false
    } else {
        event.downvoted = true
    }
    const res = await saveDownvote(event.event_id)
    console.log(res)
    event.downvoted = res?.downvoted

    if(event?.upvoted) {
        event.upvoted = false
        const res = await saveUpvote(event.event_id)
        console.log(res)
    }

}

$: votes = (event?.upvotes || 0) - (event?.downvotes || 0) 

</script>


<div class="vote mr3 mt2">
    <div class="upvote grd" on:click|stopPropagation={upvote}>
        <div class="c-ico" class:ac={event?.upvoted}>
            {@html up}
        </div>
    </div>
    <div class="count ph1 grd-c">
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

.count {
    font-size: small;
    color: var(--text-light);
    line-height: 14px;
    height: 14px;
}
</style>
