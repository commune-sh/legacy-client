<script>
import { createEventDispatcher } from 'svelte';
import { up, down } from '$lib/assets/icons.js';
import { savePost, redactReaction } from '$lib/utils/request.js'

const dispatch = createEventDispatcher();

export let event;
export let display = false;

function upvote() {
    saveUpvote()
}

function downvote() {
    saveDownvote()
}

async function saveUpvote(key) {
    let post = {
        room_id: event.room_id,
        type: "vote",
        content: {
            "m.relates_to": {
                "rel_type": "m.annotation",
                "event_id": event.event_id,
                "key": "upvote",
            }
        },
    }

    const res = await savePost(post);
    console.log(res)
}

async function saveDownvote(key) {
    let post = {
        room_id: event.room_id,
        type: "vote",
        content: {
            "m.relates_to": {
                "rel_type": "m.annotation",
                "event_id": event.event_id,
                "key": "downvote",
            }
        },
    }

    const res = await savePost(post);
    console.log(res)
}

async function redact(key) {
    let redaction = {
        room_id: event.room_id,
        event_id: event.event_id,
        key: "upvote",
    }
    const res = await redactReaction(redaction);
    console.log(res)
}

</script>


<div class="vote">
    <div class="upvote grd" on:click|stopPropagation={upvote}>
        <div class="c-ico">
            {@html up}
        </div>
    </div>
    <div class="count">
    </div>
    <div class="downvote grd" on:click|stopPropagation={downvote}>
        <div class="c-ico">
            {@html down}
        </div>
    </div>
</div>

<style>
.vote {
    display: grid;
    grid-template-columns: auto auto auto;
}

.c-ico {
    height: 22px;
    width: 22px;
}
</style>
