<script>
import { onMount, createEventDispatcher } from 'svelte'
import { store } from '$lib/store/store.js'

const dispatch = createEventDispatcher()

export let noStyle = false;

let kill =() => {
    $store.modal = {
        active: false,
        component: null
    }
}


$: active = $store.modal.active


</script>

{#if active}
<div class="mask grd" 
    on:click|self|stopPropagation={kill}>
    <div class="modal grd-c" 
    class:default={!noStyle}>
            <svelte:component this={$store.modal.component}
                {...$store.modal.props}/>
    </div>
</div>
{/if}


<style>
.mask {
    transition: 0.3s;
    position: fixed;
    z-index: 1000;
    width: 100%;
    height: 100%;
    background-color: var(--mask);
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
}

.modal {
    transition: 0.2s;
    box-shadow: 0 30px 60px rgba(0,0,0,.1);
}

.default {
    background-color: var(--bg);
    border-radius: 7px;
    max-width: 600px;
    max-height: 500px;
}

</style>

