<script>
import { search } from '$lib/assets/icons.js'
let searchInput;

function focus() {
    searchInput.focus()
}
</script>

<div class="search grd" on:click={focus}>
    <div class="in grd-c">
        <input bind:this={searchInput} type="text" class="input" placeholder="Search" />
    </div>
    <div class="fl ico" on:click={focus}>
        {@html search}
    </div>
</div>

<style>
.search {
    border-bottom: 1px solid var(--border-1);
    position: relative;
    padding-right: 1.6rem;
    cursor: text;
}

.in {
    width: 100%;
    height: 100%;
}

.input {
    height: 100%;
    width: 100%;
    font-size: 15px;
    border: none;
    background-color: var(--bg);
    padding-left: 1rem;
}

.fl {
    position: absolute;
    top: 15px;
    right: 6px;
    height: 18px;
    width: 18px;
    cursor: text;
    opacity: 0.6;
}
</style>
