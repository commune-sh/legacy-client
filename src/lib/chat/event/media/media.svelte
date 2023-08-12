<script>
import { PUBLIC_MATRIX_URL } from '$env/static/public';
import { store } from '$lib/store/store.js'
import { page } from '$app/stores';

export let event;


$: isImage = event?.content?.msgtype === 'm.image';

$: stripped = event?.content?.url?.replace('mxc://', '');

$: height = event?.content?.info?.h;
$: width = event?.content?.info?.w;

$: imgSrc = isImage
    ? `${PUBLIC_MATRIX_URL}/_matrix/media/r0/thumbnail/${stripped}?width=${width}&height=${height}&method=scale`
    : null;

function openImage() {

    let url = $page.url.href
    if($page.url.search) {
        url = `${url}&image=0`
    } else {
        url = `${url}?image=0`
    }
    $store.gallery = {
        active: true,
        items: [{
            key: imgSrc,
        }],
        mxc: true,
        index: 0,
    }
}

</script>

<div class="item">
    {#if isImage}
        <img src={imgSrc} 
            on:click={openImage}
            width={width > 500 ? 500 : width} />
    {/if}
</div>

<style>
.item {
    margin-left: calc(30px + 2rem);
    margin-right: 1.5rem;
}
.item img {
    cursor: pointer;
}
</style>
