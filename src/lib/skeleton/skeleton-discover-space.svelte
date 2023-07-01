<script>
</script>

<div class="items">
    {#each Array(20) as _, i}
        <div class="pa2">
            <div class="item ">
            </div>
        </div>
    {/each}
    <div class="fade"></div>
</div>

<style>
.items {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    grid-auto-rows: auto;
    overflow-y: auto;
    overflow-x: hidden;
    width: 100%;
    position: relative;
    overflow: hidden;
}

.item {
    background: var(--shade-2);
    border-radius: 7px;
    transition: 0.2s;
    display:grid;
    cursor: pointer;
    grid-template-rows: 140px 1fr;
    border: 1px solid var(--shade-2);
}

.fade {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    background: linear-gradient(to bottom, transparent, var(--bg));
}

@media (max-width: 1010px) {
    .items {
        grid-template-columns: 50% 50%;
    }
}
@media (max-width: 700px) {
}
</style>
