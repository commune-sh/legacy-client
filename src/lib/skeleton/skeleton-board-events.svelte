<script>
export let num = 20;
export let reply;

function rp() {
    const min = 30;
    const max = 100;
    const randomPercentage = Math.floor(Math.random() * (max - min + 1)) + min;
    return randomPercentage;
}

function img(i) {
    return Math.random() < 0.5;
}

</script>

<section class="events">
    {#each Array(num) as _, i}
        <div class="event pa3">
            <div class="fl-co">
                <div class="title sklt" style="width:20%"></div>
                <div class="body mt2 sklt"></div>
                <div class="body mt2 sklt"></div>
                <div class="body mt2 sklt" style="width:{rp()}%"></div>
            </div>
            {#if !reply && img(i)}
                <div class="img sklt"></div>
            {/if}
        </div>
    {/each}
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

.fade {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    background: linear-gradient(to bottom, transparent, var(--bg));
}

.event {
    border-bottom: 1px solid var(--border-1);
    display: grid;
    grid-template-columns: 1fr auto;
}

.title {
    background: var(--shade-2);
    border-radius: 500px;
    height: 14px;
}

.body {
    background: var(--shade-2);
    border-radius: 500px;
    height: 14px;
    width: 100%;
}

.img {
    background: var(--shade-2);
    border-radius: 9px;
    height: 70px;
    width: 70px;
    margin-left: 1rem;
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
        height: 12px;
    }
    .body {
        height: 12px;
    }
    .img {
        height: 65px;
        width: 65px;
    }
}
</style>
