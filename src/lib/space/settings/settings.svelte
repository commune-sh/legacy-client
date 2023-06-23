<script>
import { onMount, createEventDispatcher } from 'svelte'
import { close } from '$lib/assets/icons.js'
import { store } from '$lib/store/store.js'
import General from './pages/general.svelte'

const dispatch = createEventDispatcher()


let active = false;

let kill =() => {
    active = false;
    $store.spaceSettingsOpen = false;
}


$: active = $store.spaceSettingsOpen
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
                    <div class="c-ico grd-c ph3" on:click={kill}>
                        {@html close}
                </div>
            </div>
            <div class="page pa3">
                <General />
            </div>
        </div>


    </div>
</div>
{/if}


<style>
.modal {
    width: 650px;
}
.space-settings {
    display: grid;
    grid-template-rows: 48px auto;
    display: grid;
    width: 100%;
}
.page {
    display: grid;
}

@media (max-width: 700px) {
    .modal {
        width: 100%;
    }
}
</style>

