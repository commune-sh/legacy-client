<script>
import { tick, onMount, onDestroy, createEventDispatcher } from 'svelte'
import { store } from '$lib/store/store.js'
import { close } from '$lib/assets/icons.js'

export let item;
export let roomID;
export let index;

let imageURL;

let ready = false;

onMount(() => {
    const reader = new FileReader();

    reader.onload = () => {
        imageURL = reader.result;
        ready = true
    };

    reader.readAsDataURL(item);
})

function deleteAttachment() {
    store.deleteAttachment(roomID, index)
}

</script>

{#if item && ready}
<div class="item">
    <div class="image" style="background-image: url({imageURL})">
    </div>
    <div class="name">
        {item.name}
    </div>
    <div class="close grd">
        <div class="grd-c c-ico" on:click={deleteAttachment}>
            {@html close}
        </div>
    </div>
</div>
{/if}

<style>
.item {
    width: 200px;
    height: 200px;
    margin-right: 1rem;
    margin-bottom: 1rem;
    display: grid;
    grid-template-rows: 1fr auto;
    position:relative;
    border: 1px solid var(--border-1);
}

.image {
    background-repeat: no-repeat;
    background-size: cover;
    background-position: center;
}
.name {
    font-size: small;
    padding: 0.5rem;
}
.close {
    position: absolute;
    top: -8px;
    right: -8px;
    height: 26px;
    width: 26px;
    fill: var(--primary);
    border: 1px solid var(--border-1);
    background: var(--bg);
}
.c-ico {
    height: 26px;
    width: 26px;
}
</style>
