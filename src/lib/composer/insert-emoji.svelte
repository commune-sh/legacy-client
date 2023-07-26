<script>
import { tick, onMount, onDestroy, createEventDispatcher } from 'svelte'
import { em1 } from '$lib/assets/icons.js'
import { store } from '$lib/store/store.js'
import { v4 as uuidv4 } from 'uuid';
const dispatch = createEventDispatcher()

let id = uuidv4()

export let busy;
export let reply;
export let position = 'right';
export let center = true;

let reactEl;
function insertEmoji() {
    if(busy) {
        return
    }
    store.activateEmojiPicker({
        reacting_to: id,
        position: position || 'right',
        target: reactEl,
    })
}

$: selectedEmoji = $store.emojiPicker.selected

$: emojiSelected = $store.emojiPicker.reacting_to == id &&
    selectedEmoji != null &&
    selectedEmoji != undefined


$: if(emojiSelected) {
    store.killEmojiPicker()
    dispatch('selected', selectedEmoji)
}

</script>

<div class="ml2 c-ico"
    class:grd-c={center}
    class:pt3={!center}
    on:click={insertEmoji}
    bind:this={reactEl}>
    {@html em1}
</div>

<style>
.c-ico {
    height: 20px;
    width: 20px;
    filter: grayscale(1);
}
</style>
