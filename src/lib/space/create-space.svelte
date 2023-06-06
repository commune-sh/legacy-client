<script>
import { onMount, onDestroy } from 'svelte'
import { APIRequest } from '$lib/utils/request.js'
import { PUBLIC_BASE_URL } from '$env/static/public';
import { page } from '$app/stores';
import { store } from '$lib/store/store.js'

let active = false;

let kill =() => {
    active = false;
    store.toggleCreateSpace()
}

$: if($store.creatingSpace) {
    active = true
}

</script>

{#if active}
<div class="mask grd" 
    on:click|self={kill}>

    <div class="modal grd-c">
        <div class="create">
            create
        </div>
    </div>

</div>
{/if}

<style>
.create {
    height: 400px;
    width: 500px;
}
@media screen and (max-width: 550px) {
    .create {
        width: 100%;
        height: 100%;
    }
}

</style>
