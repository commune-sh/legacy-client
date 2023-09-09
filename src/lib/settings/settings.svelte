<script>
import { onMount, createEventDispatcher } from 'svelte'
import { store } from '$lib/store/store.js'
import { close, down } from '$lib/assets/icons.js';
import tippy from 'tippy.js';

import General from './pages/general/general.svelte'
import Appearance from './pages/appearance/appearance.svelte'

$: active = $store.settings?.active

function kill() {
    $store.settings.active = false
}

let items = [
    {
        category: 'App Settings',
        settings: [
            {
                name: 'General',
                component: General
            },
            {
                name: 'Appearance',
                component: Appearance
            }
        ],
    },
]

let selected = items[0].settings[0]

let toggled = false;
function toggleMenu() {
    toggled = !toggled;
}

let el;
let menu;
let content;

onMount(() => {
    menu = tippy(el, {
        content: content,
        allowHTML: true,
        trigger: 'click',
        interactive: true,
        theme: 'notifications',
        placement: 'bottom-start',
        arrow: false,
        duration: 1,
        zIndex: 99999,
        onShown(i) {
            toggled = true
        },
        onHide(i) {
            toggled = false
        },
        onClickOutside(i) {
            toggled = false
        },
    });
})

function selectItem(item) {
    selected = item
    if(menu) {
        menu.hide()
    }
}


</script>

{#if active}
<section class="settings">
    <nav class="sidebar">
        <div class="">
        </div>
        <div class="items ph3 fl-co">
            {#each items as item, i}
            <div class="category fl-co">
                <div class="label">
                    {item.category}
                </div>
                {#each item.settings as setting}
                <div class="p-item" 
                    class:p-ac={selected.name == setting.name}
                    on:click={() => selected = setting}>
                    <div class="plb">
                        {setting.name}
                    </div>
                    <div class="">
                    </div>
                </div>
                {/each}
            </div>
                {#if i != items.length - 1}
                    <div class="sep">
                    </div>
                {/if}
            {/each}
        </div>
    </nav>
    <main class="content">

        <div class="header">
            <div class="m-s fl">

                <div class="lst grd-c" 
                    class:tg={toggled}
                    on:click={toggleMenu}
                    on:click|stopPropagation bind:this={el}>

                    <div class="name">
                        {selected.name}
                    </div>
                    <div class="ico-s grd-c mh1">
                        {@html down}
                    </div>
                </div>

                <div class="fl-o">
                </div>

            </div>

            <div class="grd-c">
                <div class="sml ph3" 
                    on:click={kill}>
                    <div class="c-ico grd-c">
                        {@html close}
                    </div>
                </div>
            </div>
        </div>

        <div class="p-wrap">
            <svelte:component this={selected.component} />
        </div>
    </main>
</section>

<div class="close" 
    on:click={kill}>
    <div class="c-ico grd-c">
        {@html close}
    </div>
</div>

<div class="menu" bind:this={content}>
    <div class="mcon pa1 fl-co">

            {#each items as item, i}
            <div class="category fl-co">
                <div class="label mt2">
                    {item.category}
                </div>
                {#each item.settings as setting}
                <div class="p-item" 
                    class:p-ac={selected.name == setting.name}
                    on:click={() => selectItem(setting)}>
                    <div class="plb sm mi">
                        {setting.name}
                    </div>
                    <div class="">
                    </div>
                </div>
                {/each}
            </div>
                {#if i != items.length - 1}
                    <div class="sep">
                    </div>
                {/if}
            {/each}

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
    grid-template-columns: 1fr 230px;
    overflow-y: auto;
}

.items {
    padding-top: 4rem;
}

.content {
    display: grid;
    height: 100dvh;
    overflow: hidden;
}

.header {
    display: none;
    border-bottom: 1px solid var(--border-1);
}

.close {
    position: fixed;
    right: 0.5rem;
    top: 0.5rem;
    padding: 1rem;
    z-index: 1001;
}

.c-ico {
    width: 40px;
    height: 40px;
}
.p-item{
    display: grid;
    grid-template-columns: 1fr auto;
    cursor: pointer;
    height: 30px;
    border-radius: 4px;
    font-size: 14px;
    margin-bottom: 0.1rem;
}

.p-item:hover {
    background-color: var(--shade-3);
}

.category .p-item:last-child {
}

.sep {
    height: 1px;
    background-color: var(--shade-2);
    margin-top: 1rem;
    margin-bottom: 1rem;
}

.p-ac {
    background-color: var(--shade-2);
}
.p-ac:hover {
    background-color: var(--shade-2);
}
.plb {
    align-self: center;
    margin-left: 0.75rem;
}

.label {
    margin-left: 0.75rem;
    margin-bottom: 0.5rem;
    color: var(--text-light);
    font-size: 0.7rem;
}
.sidebar::-webkit-scrollbar {
    width: 3px;
}
.sidebar::-webkit-scrollbar-thumb {
    background: transparent;
    transition: 0.1s;
}
.sidebar::-webkit-scrollbar-track {
    background: transparent;
    transition: 0.1s;
}

.sidebar:hover::-webkit-scrollbar-thumb {
    background: var(--scrollbar-thumb);
}

.p-wrap:hover::-webkit-scrollbar-thumb {
    background: var(--scrollbar-thumb);
}

.p-wrap {
    overflow-y: auto;
    height: 100%;
    padding-top: 4rem;
    margin-left: 2rem;
}

.m-s {
    align-self: center;
    margin-left: 0.75rem;
}

.lst {
    display: grid;
    grid-template-columns: 1fr auto;
    border-radius: 5px;
    background: var(--shade-3);
    cursor: pointer;
    overflow: hidden;
    padding: 0.25rem;
    min-width: 200px;
}

.lst:hover {
    background: var(--shade-4);
}

.name {
    align-self: center;
    margin-left: 0.5rem;
    font-size: small;
    font-weight: 500;
    color: var(--text-light);
}

.lst:hover .name {
}

.tg {
    background: var(--shade-4);
    color: var(--text-1);
}

.mcon {
    min-width: 200px;
}

.mi:hover {
    color: var(--text-1);
}

.mi:hover .p-item {
    background: var(--shade-4);
}

@media screen and (max-width: 768px) {
    .settings {
        grid-template-columns: 1fr;
    }
    .sidebar {
        display: none;
    }
    .content {
        grid-template-rows: 48px 1fr;
        padding-top: 0;
    }
    .header {
        display: grid;
        grid-template-columns: 1fr auto;
    }
    .close {
        display: none;
    }
    .c-ico {
        width: 30px;
        height: 30px;
    }
    .p-wrap {
        margin-top: 0;
        margin-left: 1rem;
        padding-top: 2rem;
    }

}
</style>
