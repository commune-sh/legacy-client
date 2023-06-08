<script>
import { react} from '$lib/assets/icons.js'
import { createEventDispatcher } from 'svelte'
import { store } from '$lib/store/store.js'

const dispatch = createEventDispatcher();

export let event;

let reactEl;
function reactToEvent() {
    store.activateEmojiPicker({
        reacting_to: event?.event_id,
        target: reactEl,
    })
    dispatch('active')
}

$: selectedEmoji = $store.emojiPicker.selected

$: emojiSelected = $store.emojiPicker.reacting_to == event?.event_id &&
    selectedEmoji != null &&
    selectedEmoji != undefined


$: if(emojiSelected) {
    console.log("inserting ", selectedEmoji)
    store.killEmojiPicker()
}

</script>

<div class="icon grd-c c-ico" 
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

</style>
