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
$: if(emojiSelected) {
    dispatch('react', selectedEmoji)
    store.killEmojiPicker()
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
    width: 18px;
    height: 18px;
    border-radius: 4px;
    padding: 0.25rem;
}
.icon:hover {
    background-color: var(--shade-2);
}

.inline {
    width: 16px;
    height: 16px;
    padding: 0;
}
</style>
