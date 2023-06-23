<script>
import { onMount, createEventDispatcher } from 'svelte'
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
            <div class="header grd">
                <div class="grd-c">
                    Space Settings
                </div>
            </div>
            <div class="page">
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
    padding: 1rem;
}

@media (max-width: 700px) {
    .modal {
        width: 100%;
    }
}
</style>

