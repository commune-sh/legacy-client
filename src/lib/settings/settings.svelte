<script>
import { onMount, createEventDispatcher } from 'svelte'
import { store } from '$lib/store/store.js'
import { close } from '$lib/assets/icons.js';

import General from './pages/general/general.svelte'
import Appearance from './pages/appearance/appearance.svelte'

$: active = $store.settings?.active

function kill() {
    $store.settings.active = false
}

let pages = [
    {
        name: 'General',
        component: General
    },
    {
        name: 'Appearance',
        component: Appearance
    }
]

let selected = pages[0]


</script>

{#if active}
<section class="settings">
    <nav class="sidebar">
        <div class="">
        </div>
        <div class="">
                {#each pages as page}
                    <div class="btn" 
                        class:active={selected.name == page.name}
                        on:click={() => selected = page}>
                        {page.name}
                    </div>
                {/each}
        </div>
    </nav>
    <main class="content">
        <svelte:component this={selected.component} />
    </main>
</section>

<div class="close" 
    on:click={kill}>
    <div class="c-ico grd-c">
        {@html close}
    </div>
</div>
{/if}

<style>
.settings {
    position: fixed;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    background: var(--bg);
    z-index: 1000;
    display: grid;
    grid-template-columns: 2fr 4fr;
}

.sidebar {
    height: 100dvh;
    background: var(--event-bg-hover);
    display: grid;
    grid-template-columns: 1fr 250px;
}

.content {
    height: 100dvh;
}

.close {
    position: fixed;
    right: 1rem;
    top: 1rem;
    padding: 1rem;
    z-index: 1001;
}

.c-ico {
    width: 40px;
    height: 40px;
}
</style>
