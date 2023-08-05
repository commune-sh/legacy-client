<script>
import { PUBLIC_MATRIX_URL } from '$env/static/public';

export let event;


$: isImage = event?.content?.msgtype === 'm.image';

$: stripped = event?.content?.url?.replace('mxc://', '');

$: height = event?.content?.info?.h;
$: width = event?.content?.info?.w;

$: imgSrc = isImage
    ? `${PUBLIC_MATRIX_URL}/_matrix/media/r0/thumbnail/${stripped}?width=${width}&height=${height}&method=scale`
    : null;

function openImage() {
    window.open(imgSrc, '_blank')
}

</script>

<div class="item">
    {#if isImage}
        <img src={imgSrc} 
            on:click={openImage}
            width="500" />
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
