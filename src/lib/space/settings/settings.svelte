<script>
import { onMount, createEventDispatcher } from 'svelte'
import { close } from '$lib/assets/icons.js'
import { store } from '$lib/store/store.js'
import General from './pages/general.svelte'
import Emoji from './pages/emoji.svelte'

const dispatch = createEventDispatcher()


let active = false;

let kill =() => {
    active = false;
    $store.spaceSettingsOpen = false;
    selected = pages[0];
}


$: active = $store.spaceSettingsOpen

let pages = [
    {
        name: 'General',
        component: General
    },
    {
        name: 'Custom Emoji',
        component: Emoji
    },
]

let selected = pages[0];

</script>

{#if active}
<div class="mask grd" 
    on:click|self|stopPropagation={kill}>
    <div class="modal grd-c" >
        <div class="space-settings">
            <div class="header grd fl">
                <div class="title grd-c ml3 fl-o">
                    Space Settings
                </div>
                <div class="c-ico grd-c close" on:click={kill}>
                    {@html close}
                </div>
            </div>
            <div class="page ph3 pb3">
                <div class="sidebar">
                    {#each pages as page}
                        <div class="page-item grd-c" 
                            on:click={ () => selected = page }
                            class:active={selected.name == page.name}>
                            {page.name}
                        </div>
                    {/each}
                </div>
                <div class="ph3">
                    <svelte:component this={selected.component} on:kill={kill}/>
                </div>
            </div>
        </div>


    </div>
</div>
{/if}


<style>
.modal {
    width: 850px;
    min-height: 750px;
}
.space-settings {
    display: grid;
    grid-template-rows: 48px auto;
    display: grid;
    width: 100%;
}
.page {
    display: grid;
    grid-template-columns: 200px 1fr;
    grid-gap: 1rem;
}

@media (max-width: 700px) {
    .modal {
        width: 100%;
    }
}
.close {
    position: fixed;
    right: 1rem;
    top: 1rem;
    height: 36px;
    width: 36px;
}
.page-item {
    padding: 0.5rem;
    border-radius: 4px;
    cursor: pointer;
    color: var(--text-light);
}

.page-item:hover {
    background-color: var(--shade-3);
}
.active {
    background-color: var(--event-context);
    color: var(--text-1);
}
.active:hover {
    background-color: var(--event-context);
}

</style>

