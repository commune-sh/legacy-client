<script>
import { onMount } from 'svelte'
import { play } from '$lib/assets/icons.js'
import { PUBLIC_MEDIA_URL } from '$env/static/public';
export let media;

function getURL(item) {
    let key = item?.key || ``
    if(item?.thumbnail?.key) {
        key = item.thumbnail.key
    }
    return `${PUBLIC_MEDIA_URL}/${key}` 
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
                    <b>+{media.length - 1}</b>
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
                    <b>+{media.length - 1}</b>
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
}

.at-img {
    height: 85px;
    width: 85px;
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
        height: 65px;
        width: 65px;
    }
}
</style>
