<script>
import { PUBLIC_MEDIA_URL } from '$env/static/public';
import { prev, next } from '$lib/assets/icons.js'
export let images;

function getURL(item) {
    return `${PUBLIC_MEDIA_URL}/${item?.key}` || ``
}

$: multiple = images?.length > 1

$: selected = images[0]

function goToPrevious() {
    let index = images.indexOf(selected)
    if(index === 0) {
        selected = images[images.length - 1]
    } else {
        selected = images[index - 1]
    }
}

function goToNext() {
    let index = images.indexOf(selected)
    if(index === images.length - 1) {
        selected = images[0]
    } else {
        selected = images[index + 1]
    }
}

</script>

<div class="container">

{#if multiple}


<div class="items fl mr2 ml3 mt3">
    {#each images as image, i}
        <div class="item mr3"
        class:selected={selected.key === image.key}
        on:click={() => selected = image}
        style="background-image: url({getURL(image)})">
        </div>
    {/each}

    <div class="fl-o"></div>
    <div class="cycle">
        <div class="c-ico prev grd-c" on:click={goToPrevious}>
            {@html prev}
        </div>
        <div class="c-ico next grd-c" on:click={goToNext}>
            {@html next}
        </div>
    </div>
</div>
{/if}

<div class="pa3">
    <img width={selected?.info?.w}
    height={selected?.info?.h}
    src={getURL(selected)} 
    loading="lazy"/>
</div>


</div>

<style>
.item {
    height: 40px;
    width: 40px;
    border-radius: 2px;
    background-repeat: no-repeat;
    background-size: cover;
    background-position: center;
    cursor: pointer;
    opacity: 0.7;
    transition: 0.1s;
}

.item:hover {
    opacity: 0.9;
    outline: 3px solid var(--primary);
}

.selected {
    outline: 3px solid var(--primary);
    opacity: 1;
}
.cycle {
    display: grid;
    grid-template-columns: auto auto;
    grid-column-gap: 0.5rem;
}

.container {
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
}
</style>
