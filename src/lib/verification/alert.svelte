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
    <div class="mod grd-c ">
        <div class="grd grd-c in fl-co w100">
            <div class="fl">
                <div class="fl-o"></div>
                <div class="close c-ico pa3" on:click={kill}>
                    {@html close}
                </div>
            </div>
            <div class="grd-c">
                You'll need to verify your email address first.
            </div>
            <div class="pv4 grd-c">
                <button class="pa2" on:click={start}>Verify account</button>
            </div>
        </div>
    </div>
</div>
{/if}


<style>
.mask {
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

.mod {
    display: grid;
    box-sizing: border-box;
    box-shadow: 0 30px 60px rgba(0,0,0,.1);
    background: var(--modal);
    border-radius: 7px;
    width: 500px;
}

.in {
    place-self: stretch;
    justify-self: center;
    align-self: center;
    display: grid;

}

@media only screen and (max-width: 600px) {
    .mod {
        width: 100%;
        height: 100%;
        border-radius: 0;
    }
    .close {
        position: fixed;
        top: 1rem;
        right: 1rem;
    }
    .c-ico {
        width: 30px;
        height: 30px;
    }
}
</style>

