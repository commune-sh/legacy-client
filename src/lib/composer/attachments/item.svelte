<script>
import { tick, onMount, onDestroy, createEventDispatcher } from 'svelte'
import { store } from '$lib/store/store.js'
import { close } from '$lib/assets/icons.js'

export let item;
export let roomID;
export let index;
export let uploading;

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
    {#if !uploading}
    <div class="close grd">
        <div class="grd-c c-ico" on:click={deleteAttachment}>
            {@html close}
        </div>
    </div>
    {/if}
    {#if uploading}
        <div class="mask grd">
            <div class="loader grd-c">
            </div>
        </div>
    {/if}
</div>


{/if}

<style>
.mask {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: var(--mask);
    border-radius: 14px;
}
.item {
    width: 170px;
    height: 170px;
    margin-right: 1rem;
    margin-bottom: 1rem;
    display: grid;
    grid-template-rows: 1fr auto;
    position:relative;
    border-radius: 14px;
}

.image {
    background-repeat: no-repeat;
    background-size: cover;
    background-position: center;
    border-radius: 14px;
}

.close {
    position: absolute;
    top: 6px;
    right: 6px;
    height: 26px;
    width: 26px;
    fill: var(--primary);
    border-radius: 50%;
    background: var(--bg);
}
.c-ico {
    height: 26px;
    width: 26px;
}
</style>
