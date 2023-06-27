<script>
import { store } from '$lib/store/store.js'
import { close } from '$lib/assets/icons.js'

$: active = $store.alert?.active === true && $store.alert?.message

function kill() {
    $store.alert = {
        active: false,
        message: null 
    }
}

</script>

{#if active}
<div class="alert">
    <div class="mes grd-c fl">
        <div class="fl-o grd-c">
            {$store.alert?.message}
        </div>
        <div class="ico-s" on:click={kill}>
            {@html close}
        </div>
    </div>
</div>
{/if}

<style>
.alert {
    display: grid;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 10000;
    margin-top: 1rem;
}

.mes {
    padding: 1rem;
    background-color: var(--primary);
    color: white;
    border-radius: 7px;
    min-width: 500px;
    box-shadow: 4px 4px 18px -10px rgba(0, 0, 0, 0.21);
}

.ico-s{
    opacity:0.9;
    fill: white;
    cursor: pointer;
}
</style>
