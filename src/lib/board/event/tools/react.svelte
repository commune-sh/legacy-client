<script>
import { react} from '$lib/assets/icons.js'
import { onMount, createEventDispatcher } from 'svelte'
import { store } from '$lib/store/store.js'
import tippy from 'tippy.js';

onMount(() => {
    tippy(reactEl, {
        content: 'Click for full list of reactions',
        arrow: true,
        duration: 1,
        theme: 'inline',
    });
})

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
        store.startAuthenticating("login")
        return
    }
    let ra = event?.room_alias
    if(ra?.includes('/')) {
        ra = ra.split('/')[0]
    }
    let e = {
        reacting_to: event?.event_id,
        is_reply: isReply,
        target: reactEl,
        position: 'left',
        space_alias: ra,
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

function hovered() {
    dispatch('hovered')
}

function queryState() {
    if(!$store.loadEmojiPicker) {
        $store.loadEmojiPicker = true
    }
}

</script>

<div class="icon grd-c c-ico" 
    on:mouseenter={queryState}
    class:inline={inline}
    bind:this={reactEl}
    on:mouseenter={hovered}
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
