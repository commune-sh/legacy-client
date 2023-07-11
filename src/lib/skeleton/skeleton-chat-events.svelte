<script>
import { onMount } from 'svelte'
export let num = 20;
export let reply;

function rp(m) {
    const min = 30;
    const max = m || 60;
    const randomPercentage = Math.floor(Math.random() * (max - min + 1)) + min;
    return randomPercentage;
}

function img(i) {
    return Math.random() < 0.5;
}

function tp() {
    const min = 1;
    const max = 10;
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
let el;
onMount(() => {
    el.scrollTop = el.scrollHeight;
})
</script>

<section class="events">
    <div class="co" bind:this={el}>
    {#each Array(num) as _, i}
        <div class="event pa3">
            <div class="img sklt"></div>
            <div class="ml3 fl-co">
                <div class="title sklt" style="width:20%"></div>
                {#each Array(tp()) as _, i}
                    <div class="body mt2 sklt" style="width:{rp(100)}%"></div>
                {/each}
                <div class="body mt2 sklt" style="width:{rp()}%"></div>
            </div>
        </div>
    {/each}
    </div>
    <div class="fade"></div>
</section>

<style>
.events {
    display: grid;
    grid-template-rows: repeat(auto-fill, auto);
    overflow: hidden;
    pointer-events: none;
    position: relative;
}

.co {
    overflow: hidden;
}

.fade {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    background: linear-gradient(to bottom, var(--bg), transparent);
}

.event {
    display: grid;
    grid-template-columns: auto 1fr;
}

.title {
    background: var(--shade-2);
    border-radius: 500px;
    height: 10px;
}

.body {
    background: var(--shade-2);
    border-radius: 500px;
    height: 10px;
    width: 100%;
}

.img {
    background: var(--shade-2);
    border-radius: 50%;
    height: 30px;
    width: 30px;
}

.sklt {
  animation: skeleton-loading 1s linear infinite alternate;
}

@keyframes skeleton-loading {
  0% {
    background: var(--shade-2);
  }
  100% {
    background: var(--shade-3);
  }
}

@media screen and (max-width: 768px) {
    .event { 
        border: none;
    }
    .title {
        height: 8px;
    }
    .body {
        height: 8px;
    }
    .img {
        height: 50px;
        width: 50px;
    }
}
</style>
