<script>
</script>

<div class="items">
    <div class="co fl-co">
        {#each Array(13) as _, i}
            <div class="item grd-c">
            </div>
        {/each}
    <div class="fade"></div>
    </div>
</div>

<style>
.items {
    display: grid;
    grid-template-rows: repeat(auto-fill, auto);
    overflow: hidden;
    pointer-events: none;
    margin-top: 0.75rem;
    height: 100%;
}

.co {

    position: relative;
}

.item{
    margin-bottom: 0.75rem;
    position: relative;
    background-color: var(--switcher-item);
    border-radius: 50%;
    width: 36px;
    height: 36px;
    display: grid;
    cursor: pointer;
    border: 2px solid transparent;
}
.fade {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    background: linear-gradient(to bottom, transparent, var(--bg));
}

</style>
