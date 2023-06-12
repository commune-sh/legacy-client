<script>
import { PUBLIC_MEDIA_URL } from '$env/static/public';
export let images;

function getURL(item) {
    return `${PUBLIC_MEDIA_URL}/${item?.key}` || ``
}

</script>


<div class="thumbnail grd mr3">
    <div class="at-img grd-c" 
        style="background-image: url({getURL(images[0])})">
    {#if images?.length > 1}
    <div class="img-count">
        <b>+{images.length - 1}</b>
    </div>
    {/if}
    </div>
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

@media screen and (max-width: 768px) {
    .at-img {
        height: 65px;
        width: 65px;
    }
}
</style>
