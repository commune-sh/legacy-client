<script>
import { onMount, createEventDispatcher } from 'svelte'
import { browser } from '$app/environment';
import { store } from '$lib/store/store.js'
import { moon, sun } from '$lib/assets/icons.js'
import { goto } from '$app/navigation';
import { page } from '$app/stores';
import tippy from 'tippy.js';

let el;
let content;

let menu;

$: tip =`${isLight ? 'Dark' : isDark? 'Black' : 'Light'} mode`

$: if(browser && tip && el) {
    menu = tippy(el, {
        content: tip,
        placement: 'right',
        arrow: true,
        duration: 1,
        offset: [0, 26],
        theme: 'inline',
    });
}

export let space;

$: spacePath = $store?.spacePaths[space?.alias]?.pathname

$: initial = space?.alias?.charAt(0)?.toUpperCase()

function goToSpace() {
    let url = `/settings`
    goto(url, {noscroll: true})
}

let hovered = false;

$: active = $page?.route?.id === `/(app)/settings`

$: isLight = $store.settings?.theme === 'light'
$: isDark = $store.settings?.theme === 'dark'

function toggle() {
    store.toggleTheme()
    menu.show()
}

</script>

<div class="i-c grd">
    <div class="item grd-c" 
    on:mouseover={() => hovered = true}
    on:mouseleave={() => hovered = false}
    on:click={toggle}
    bind:this={el}>
        <div class="create ico grd-c" class:ac={active}>
            {#if isLight}
                {@html moon}
            {:else}
                {@html sun}
            {/if}
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



.ac {
    opacity: 1;
}

.create {
    height: 20px;
    width: 20px;
    fill: var(--action-icon);
}
</style>
