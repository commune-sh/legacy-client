<script>
import { PUBLIC_APP_NAME } from '$env/static/public';
import { onMount, createEventDispatcher } from 'svelte'
import { store } from '$lib/store/store.js'
import { settings } from '$lib/assets/icons.js'
import { page } from '$app/stores';
import tippy from 'tippy.js';

let el;
let content;

let menu;

onMount(() => {
    menu = tippy(el, {
        content: `Settings`,
        placement: 'right',
        arrow: true,
        duration: 1,
        offset: [0, 26],
        theme: 'inline',
    });
})

export let space;

function goToSpace() {
    $store.settings.active = true
    if($store.menuToggled) {
        $store.menuToggled = false
    }
}

</script>

<div class="i-c grd">
    <div class="item grd-c" 
    on:click={goToSpace}
    bind:this={el}>
        <div class="create ico grd-c">
            {@html settings}
        </div>
    </div>
</div>

<style>

.i-c {
    margin-bottom: 0.5rem;
    position: relative;
}

.item{
    border-radius: 50%;
    width: 36px;
    height: 36px;
    display: grid;
    cursor: pointer;
    transition: 0.1s;
}


.create {
    height: 20px;
    width: 20px;
    fill: var(--action-icon);
}


.item:hover .create {
    fill: var(--primary);
}
</style>
