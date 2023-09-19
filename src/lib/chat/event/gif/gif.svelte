<script>
import { store } from '$lib/store/store.js'

export let event;

export let board = false;

$: src = event?.content?.gif?.src?.url

$: w = event?.content?.gif?.src?.dims[0]
$: h = event?.content?.gif?.src?.dims[1]

$: width = w > 400 ? 400 : w
$: height = width * h / w

function openImage(index) {
    $store.gallery = {
        active: true,
        items: [{
            key: src,
        }],
        index: 0,
        gif: true,
        url: event?.content?.gif?.url
    }
}
</script>

<div class="gif-event mv1" 
    class:ml={!board}
    on:click={openImage}>
    {#if src}
        <video autoplay loop muted playsinline width={width} height={height}>
            <source src={src} type="video/mp4" />
        </video>
    {/if}

    <div class="gifl">
        GIF
    </div>
</div>

<style>
.gif-event {
    margin-right: 1.5rem;
    margin-left: 1rem;
    max-width: 400px;
    position: relative;
    cursor: pointer;
}

.ml {
    margin-left: calc(30px + 2rem);
}

.gifl {
    position: absolute;
    top: 0.25rem;
    left: 0.25rem;
    background: var(--bg);
    padding: 0 0.25rem;
    font-size: small;
    font-weight: 500;
    border-radius: 5px;
    opacity: 0;
    transition: 0.1s;
}

.gif-event:hover .gifl {
    opacity: 1;
}

video {
    border-radius: 4px;
    background-color: var(--shade-3);
}

@media screen and (max-width: 768px) {
    video {
        max-width: 100%;
        height: auto;
    }
}
</style>
