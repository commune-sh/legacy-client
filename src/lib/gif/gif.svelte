<script>
import { gif } from '$lib/assets/icons.js'
import { tick, onMount, onDestroy, createEventDispatcher } from 'svelte'
import { store } from '$lib/store/store.js'
import { v4 as uuidv4 } from 'uuid';
import tippy from 'tippy.js';

const dispatch = createEventDispatcher()

let id = uuidv4()

export let room_alias = null;

export let busy = false;
export let reply = false;
export let position = 'right';
export let center = true;
export let isChat = false;


let el;
function insertGIF() {
    if(busy) {
        return
    }
    let ra = room_alias
    if(ra?.includes('/')) {
        ra = ra?.split('/')[0]
    }
    let e = {
        reacting_to: id,
        isGIF: true,
        position: 'left',
        target: el,
        space_alias: ra,
        isChat: isChat,
    }

    store.activateEmojiPicker(e)
}

$: if($store.selectedGIF) {
    dispatch('gif-selected', $store.selectedGIF)
}

onMount(() => {
    tippy('.gif', {
        content: 'Insert GIF',
        arrow: true,
        duration: 1,
        theme: 'inline',
    });
})

$: active = $store.emojiPicker.active &&
    $store.emojiPicker.isGIF
</script>


<div class="gif grd"
    class:mtop={!center}
    class:mle={center}
    on:click={insertGIF}
    class:grd-c={center}
    bind:this={el}>
    <div class="c-ico" class:active={active}>
        {@html gif}
    </div>
</div>

<style>
.mtop {
    margin-top: 16px;
}
.mle {
    margin-left: 11px;
}
.c-ico {
    width: 24px;
    height: 24px;
}
.active {
    fill: var(--primary);
    opacity: 1;
}
</style>

