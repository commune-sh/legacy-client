<script>
import { external } from '$lib/assets/icons.js'

export let links;

function getURL(item) {
    return item?.image
}

$: isImage = links?.[0]?.type?.startsWith('image') 
$: isVideo = links?.[0]?.type?.startsWith('video')
$: linksType = links?.[0]?.type

$: hasImage = links[0]?.image?.length > 0


</script>


<div class="thumbnail grd mr3">

    {#if hasImage}
        <div class="at-img grd-c" 
            style="background-image: url({getURL(links[0])})">

            {#if links?.length > 1}
                <div class="img-count">
                    <b>+{links.length - 1}</b>
                </div>
            {/if}
        </div>
    {:else}
        <div class="at-img link grd">
            <div class="grd-c ico-s">
                {@html external}
            </div>
            {#if links?.length > 1}
                <div class="img-count">
                    <b>+{links.length - 1}</b>
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
    background-color: var(--shade-3);
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
    opacity: 1;
}

@media screen and (max-width: 768px) {
    .at-img {
        height: 60px;
        width: 60px;
    }
}
</style>
