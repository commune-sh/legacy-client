<script>
import { createEventDispatcher } from 'svelte'
import { close } from '../../assets/icons.js'
import { page } from '$app/stores';
import { goto } from '$app/navigation';

const dispatch = createEventDispatcher()

function kill() {
    let url = `/${$page.params?.space}`
    if($page.params?.room) {
        url = `/${$page.params?.space}/${$page.params?.room}`
    }
    goto(url, {
        noscroll: true,
    })
}

</script>


<div class="header">
    <div class="container fl">
        <div class="pd grd-c">
            <span class="n">Replies</span>
        </div>
        <div class="fl-o"></div>
        <div class="icon pd grd-c" on:click={kill}>
            {@html close}
        </div>
    </div>
</div>

<style>
.header {
    border-bottom: 1px solid var(--border-1);
    position: sticky;
    z-index: 1;
    top: 0;
    background-color: var(--bg);
    display: grid;
    grid-template-columns: auto;
    grid-template-rows: auto;
}

.pd {
    padding-left: 1rem;
    padding-right: 1rem;
}

.n {
    cursor: pointer;
    font-weight: bold;
    font-size: 1rem;
}

.icon {
    height: 28px;
    width: 28px;
    cursor: pointer;
    opacity: 0.9;
}

.icon:hover {
    opacity: 1;
}

</style>
