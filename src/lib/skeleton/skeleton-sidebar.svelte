<script>
function rp() {
    const min = 30;
    const max = 60;
    const randomPercentage = Math.floor(Math.random() * (max - min + 1)) + min;
    return randomPercentage;
}

function tp() {
    const min = 1;
    const max = 3;
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function topics(i) {
    return Math.random() < 0.5;
}
</script>

<section class="items">
    {#each Array(20) as _, i}
        <div class="item sklt"></div>
        {#if topics(i)}
            {#each Array(tp()) as _, i}
                <div class="fl">
                    <div class="ml4">
                    </div>
                    <div class="item sklt" style="width:{rp()}%"></div>
                </div>
            {/each}
        {/if}
    {/each}
    <div class="fade"></div>
</section>

<style>
.items {
    display: grid;
    grid-template-rows: repeat(auto-fill, auto);
    overflow: hidden;
    padding: 0.5rem;
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

.item {
    display: grid;
    grid-template-columns: 1fr auto;
    background: var(--shade-2);
    border-radius: 4px;
    height: 16px;
    margin-bottom: 0.5rem;
    width: 100%;
}

.topic {
    width: 60%;
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
    .item {
    }
}
</style>
