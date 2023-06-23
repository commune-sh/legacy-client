<script>
import { onMount, createEventDispatcher, tick } from 'svelte'
import { store } from '$lib/store/store.js'
import { close } from '$lib/assets/icons.js'


const dispatch = createEventDispatcher()


let kill =() => {
    $store.showVerificationAlert = false
}

$: active = $store.showVerificationAlert 

function start() {
    kill()
    $store.startAccountVerification = true
}

</script>

{#if active}
<div class="mask grd" 
    on:click|self|stopPropagation={kill}>
    <div class="modal grd-c grd pa3">
        <div class="fl-co">
            <div class="">
                You'll need to verify your email address first.
            </div>
            <div class="mt3">
                <button on:click={start}>Verify account</button>
            </div>
        </div>
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
    background: var(--modal);
    border-radius: 7px;
    width: 500px;
}

</style>

