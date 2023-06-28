<script>
import { PUBLIC_MEDIA_URL } from '$env/static/public';
import { prev, next, play } from '$lib/assets/icons.js'
import { store } from '$lib/store/store.js'
import { page } from '$app/stores';

$: isDomain = $page.params.domain !== undefined && 
    $page.params.domain !== 'undefined' && 
    $page.params.domain?.length > 0

$: mediaURL = isDomain ? $store?.federated?.media_url : PUBLIC_MEDIA_URL

export let media;

function getURL(item) {
    return `${mediaURL}/${item?.key}` || ``
}

function getThumbnailURL(item) {
    let key = item?.key || ``
    if(item?.thumbnail?.key) {
        key = item.thumbnail.key
    }
    return `${mediaURL}/${key}` 
}


$: multiple = media?.length > 1

$: selected = media[0]

$: isImage = selected?.type?.startsWith('image')
$: isVideo = selected?.type?.startsWith('video')

let isItemImage = (item) => {
    return item?.type?.startsWith('image')
}


let isItemVideo = (item) => {
    return item?.type?.startsWith('video')
}

function goToPrevious() {
    let index = media.indexOf(selected)
    if(index === 0) {
        selected = media[media.length - 1]
    } else {
        selected = media[index - 1]
    }
}

function goToNext() {
    let index = media.indexOf(selected)
    if(index === media.length - 1) {
        selected = media[0]
    } else {
        selected = media[index + 1]
    }
}

</script>

<div class="container">

{#if multiple}


<div class="items fl mr2 ml3 mt3">
    {#each media as item, i}
        <div class="item mr3"
        class:selected={selected.key === item.key}
        on:click={() => selected = item}
        style="background: url({getThumbnailURL(item)})">

            {#if isItemVideo(item)}
                <video class="tvi" width="40" height="40">
                  <source src={getURL(media[0])} autoplay muted>
                </video>
                <div class="vid grd">
                    <div class="ico-s grd-c">
                        {@html play}
                    </div>
                </div>
            {/if}


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

<div class="pa3 con grd"> 
    {#if isImage}
        <img width={selected?.info?.w}
        height={selected?.info?.h}
        src={getURL(selected)} 
        loading="lazy"/>
    {/if}

    {#if isVideo}
        <div class="video-item grd-c">
            <video height="500" class="" controls>
              <source src={getURL(selected)} type={selected?.type}>
            </video>
        </div>
    {/if}
</div>


</div>

<style>
.item {
    height: 40px;
    width: 40px;
    border-radius: 2px;
    background-repeat: no-repeat !important;
    background-size: cover !important;
    background-position: center !important;
    cursor: pointer;
    opacity: 0.9;
    transition: 0.1s;
    position: relative;
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
video {
    max-height: 500px;
    width: 100%;
}

.tvi {
    background-color: var(--shade-2);
}
.vid {
    position: absolute;
    right: 0.25rem;
    bottom: 0.25rem;
    background-color: var(--bg);
    border-radius: 6px;
}

.ico-s {
    fill: var(--primary);
    opacity: 1;
}

</style>
