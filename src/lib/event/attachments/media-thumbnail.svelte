<script>
import { onMount } from 'svelte'
import { play } from '$lib/assets/icons.js'
import { PUBLIC_MEDIA_URL } from '$env/static/public';
import { store } from '$lib/store/store.js'
import { page } from '$app/stores';
export let media;

$: isDomain = $page.params.domain !== undefined && 
    $page.params.domain !== 'undefined' && 
    $page.params.domain?.length > 0

$: mediaURL = isDomain ? $store?.federated?.media_url : PUBLIC_MEDIA_URL

function getURL(item) {
    let key = item?.key || ``
    if(item?.thumbnail?.key) {
        key = item.thumbnail.key
    }
    return `${mediaURL}/${key}` 
}

$: isImage = media?.[0]?.type?.startsWith('image') 
$: isVideo = media?.[0]?.type?.startsWith('video')
$: mediaType = media?.[0]?.type


</script>


<div class="thumbnail grd mr3">

    {#if isImage}
        <div class="at-img grd-c" 
            style="background-image: url({getURL(media[0])})">

            {#if media?.length > 1}
                <div class="img-count">
                    +{media.length - 1}
                </div>
            {/if}
        </div>
    {:else if isVideo}
        <div class="vbg at-img grd-c" >

            <video width="85" height="85">
              <source src={getURL(media[0])} type={mediaType} autoplay muted>
            </video>

            <div class="vid grd">
                <div class="ico-s grd-c">
                    {@html play}
                </div>
            </div>

            {#if media?.length > 1}
                <div class="img-count">
                    +{media.length - 1}
                </div>
            {/if}
        </div>
    {/if}

</div>

<style>
.thumbnail {
}

.img-count {
    position: absolute;
    bottom: 0.25rem;
    right: 0.25rem;
    background-color: #000;
    color: #fff;
    padding: 0.125rem 0.25rem;
    border-radius: 500px;
    font-size: small;
    font-weight: 500;
}

.at-img {
    height: 70px;
    width: 70px;
    border-radius: 9px;
    background-repeat: no-repeat;
    background-size: cover;
    background-position: center;
    position: relative;
}
.vbg {
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

@media screen and (max-width: 768px) {
    .at-img {
        height: 50px;
        width: 50px;
    }
}
</style>
