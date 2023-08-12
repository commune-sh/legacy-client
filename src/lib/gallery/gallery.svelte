<script>
import { PUBLIC_MEDIA_URL, PUBLIC_MATRIX_URL } from '$env/static/public';
import { store } from '$lib/store/store.js'
import { prev, next, close } from '$lib/assets/icons.js';
import { page } from '$app/stores';

$: query = $page.url.searchParams.get('gallery')

$: active = $store.gallery.active && $store.gallery.items?.length > 0

$: images = $store.gallery.items || []

$: multiple = images.length > 1

function kill() {
    $store.gallery = {active: false}
}

$: selected = $store.gallery?.index

$: isMXC = $store.gallery?.mxc

$: src = active ? isMXC ? images[0]?.key : `${PUBLIC_MEDIA_URL}/${images[selected]?.key}` : null

$: noPrev = selected === 0
$: noNext = selected === images.length - 1

function goPrev() {
    if (selected > 0) {
        $store.gallery.index = selected - 1
    }
}

function goNext() {
    if (selected < images.length - 1) {
        $store.gallery.index = selected + 1
    }
}

function open() {
    let url = isMXC ? images[0]?.key : `${PUBLIC_MEDIA_URL}/${images[selected]?.key}`
    window.open(url, '_blank')
}

$: name = images[selected]?.name
</script>

{#if active}
<div class="mask grd sel-no" 
    on:click|self|stopPropagation={kill}>
    <div class="mod grd-c" >

        <div class="grd-c poin">
            <img src={src}
                class="" 
                on:click={open}>
        </div>
    </div>

    {#if multiple}
        <div class="prev" 
            on:click={goPrev}
            class:dis={noPrev}>
            <div class="c-ico grd-c">
                {@html prev}
            </div>
        </div>
        <div class="next" 
            on:click={goNext}
            class:dis={noNext}>
            <div class="c-ico grd-c">
                {@html next}
            </div>
        </div>
    {/if}

        <div class="close" 
            on:click={kill}>
            <div class="c-ico grd-c">
                {@html close}
            </div>
        </div>

</div>
{/if}

<style>
.mod {
    display: grid;
    grid-template-columns: auto;
    grid-template-rows: auto;
    background: transparent;
    max-width: 60%;
}

.prev {
    position: fixed;
    left: 1rem;
    top: calc(50% - 40px);
    padding: 1rem;
}

.next {
    position: fixed;
    right: 1rem;
    top: calc(50% - 40px);
    padding: 1rem;
}
.close {
    position: fixed;
    right: 1rem;
    top: 1rem;
    padding: 1rem;
}

.c-ico {
    width: 40px;
    height: 40px;
}

.dis {
    opacity: 0.2;
}

@media screen and (max-width: 1028px) {
    .mod {
        max-width: 80%;
    }
}
.poin {
    cursor: pointer;
}
</style>
