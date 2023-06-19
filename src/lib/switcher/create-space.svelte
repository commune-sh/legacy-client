<script>
import { onMount, createEventDispatcher } from 'svelte'
import { store } from '$lib/store/store.js'
import { addLine } from '$lib/assets/icons.js'
import { page } from '$app/stores';
import tippy from 'tippy.js';

let el;
let content;

let menu;

onMount(() => {
    menu = tippy(el, {
        content: content,
        placement: 'right',
        arrow: true,
        duration: 1,
        offset: [0, 26],
        theme: 'inline',
    });
})

export let space;

$: authenticated = $store?.authenticated && 
    $store?.credentials != null
    $store?.credentials?.access_token?.length > 0

let createSpaceAfterLogin = false;

$: if(authenticated && createSpaceAfterLogin)  {
    store.toggleCreateSpace()
    createSpaceAfterLogin = false
}

function createSpace() {
    if(!authenticated) {
        store.startAuthenticating()
        createSpaceAfterLogin = true
        return
    }
    store.toggleCreateSpace()
}

</script>

<div class="" bind:this={content}>
    Create Space
</div>

<div class="i-c grd">
    <div class="item grd-c"
    on:click={createSpace} bind:this={el}>
        <div class="create c-ico grd-c">
            {@html addLine}
        </div>
    </div>
</div>



<style>

.i-c {
    margin-bottom: 0.5rem;
    position: relative;
}

.item{
    background-color: var(--switcher-item);
    border-radius: 50%;
    width: 36px;
    height: 36px;
    display: grid;
    cursor: pointer;
}
.item:hover {
    background-color: var(--primary);
}


.tick {
    opacity: 0;
    position: absolute;
    top: 12px;
    left: 0px;
    height: 15px;
    width: 4px;
    border-radius: 0 5px 5px 0;
    background-color: var(--switcher-pill);
}
.th {
    opacity: 1;
}

.ac {
    opacity: 1;
}

.create {
    height: 22px;
    width: 22px;
}
</style>
