<script>
import { play } from '$lib/assets/icons.js'

export let link;

$: id = link?.youtube_id
$: title = link?.title
$: description = link?.description
$: href = link?.href

export let reply;

let active = false;

let iframe;

$: src = `https://www.youtube.com/embed/${id}?autoplay=1&enablejsapi=1`

function activate() {
    active = true
}

</script>


<div class="lic pa3 fl " 
    on:click={activate} >

    <div class="link-item fl fl-co">
        {#if active}

            <div class="frame-con ">
                <iframe 
                    title={title}
                    bind:this={iframe}
                    src="https://www.youtube.com/embed/{id}?autoplay=1&enablejsapi=1"
                    width="100%" 
                    height="100%" 
                    frameborder="0" 
                    allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen>
                </iframe>
            </div>
        {:else}
            <div class="vp-i grd"
                style="background-image: url({link?.image});">
                <div class="pic grd-c grd pa3">
                    <div class="play-icon grd-c">
                        {@html play}
                    </div>
                </div>
            </div>
        {/if}


    </div>

</div>


<style>

.lic {
}

.frame-con {
  overflow: hidden;
}
 
.frame-con iframe {
    height: 225px;
    width: 400px;
}

.vp-i {
    cursor: pointer;
    height: 225px;
    width: 400px;
    background-repeat: no-repeat;
    background-position: center;
    background-size: cover;
}
.pic {
    border-radius: 50%;
    background-color: black;
    padding: 0.5rem;
    opacity: 0.8;
    transition: 0.1s;
}

.vp-i:hover .pic{
    opacity: 1;
}

.play-icon {
    width: 34px;
    height: 34px;
    fill: white;
}

.link-item:hover .play-icon {
    fill: var(--white);
}
</style>


