<script>
import { react} from '$lib/assets/icons.js'
import { createEventDispatcher } from 'svelte'
import { store } from '$lib/store/store.js'
import { savePost, redactReaction } from '$lib/utils/request.js'
import { page } from '$app/stores';

$: authenticated = $store?.authenticated && 
    $store?.credentials != null
    $store?.credentials?.access_token?.length > 0

const dispatch = createEventDispatcher();

export let event;
export let inline;
export let isReply = false;

let reactEl;


function reactToEvent() {
    if(!authenticated) {
        store.startAuthenticating()
        return
    }
    let e = {
        reacting_to: event?.event_id,
        is_reply: isReply,
        target: reactEl,
    }
    store.activateEmojiPicker(e)
    dispatch('active')
}

$: selectedEmoji = $store.emojiPicker.selected

$: emojiSelected = $store.emojiPicker.reacting_to == event?.event_id &&
    selectedEmoji != null &&
    selectedEmoji != undefined


$: sender= $store.credentials?.matrix_user_id

let emojiKey = null;
let rep;
$: if(emojiSelected) {
    emojiKey = selectedEmoji
    rep = $store.emojiPicker.is_reply
    store.killEmojiPicker()

    let exists = event.reactions?.findIndex(r => r.key === emojiKey &&
        r.senders.includes(sender)) > -1
    if(!exists) {
        store.addReaction(event, selectedEmoji, sender, rep, $page.params.post)
        saveReaction()
    } else {
        store.removeReaction(event, selectedEmoji, sender, rep, $page.params.post)
        redact()
    }
    emojiKey = null
}

async function saveReaction() {
    let post = {
        room_id: event.room_id,
        type: "m.reaction",
        content: {
            "m.relates_to": {
                "rel_type": "m.annotation",
                "event_id": event.event_id,
                "key": emojiKey,
            }
        },
    }
    const res = await savePost(post);
    console.log(res)
}

async function redact() {
    let redaction = {
        room_id: event.room_id,
        event_id: event.event_id,
        key: emojiKey,
    }
    const res = await redactReaction(redaction);
    console.log(res)
}

</script>
    <div class="icon grd-c c-ico" 
        class:inline={inline}
        bind:this={reactEl}
        on:click|stopPropagation={reactToEvent}>
        {@html react}
    </div>

<style>
.icon {
    width: 20px;
    height: 20px;
    border-radius: 4px;
    padding: 0.25rem;
}
.icon:hover {
    background-color: var(--shade-2);
}

.inline {
    width: 16px;
    height: 16px;
}
</style>
