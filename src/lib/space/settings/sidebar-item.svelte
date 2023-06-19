<script>
import { page } from '$app/stores';
import { goto } from '$app/navigation';
import { store } from '$lib/store/store.js'

export let item;

$: selected = $page.params?.page == item.alias

$: if(selected) {
    document.title = `Settings - ${item.name} - ${$page.params.space}`
}

function switchToPage() {
    let url = `/${$page.params.space}/settings/${item.path}`
    goto(url)
}

</script>

<div class="item" 
    on:click={switchToPage}
    class:active={selected}>

    <div class="ico grd-c" class:inac={!selected}>
        {@html item.icon}
    </div>

    <div class="sl">
        {item.name}
    </div>
</div>

<style>
.item {
    cursor: pointer;
    display: grid;
    grid-template-columns: auto 1fr auto;
    height: 30px;
    border-radius: 4px;
    font-size: 14px;
    margin-bottom: 0.15rem;
}

.item:hover {
    background-color: var(--shade-3);
}

.active {
    background-color: var(--shade-2);
}
.active:hover {
    background-color: var(--shade-2);
}
.sl {
    align-self: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: normal;
}
.ico {
    margin-right: 0.5rem;
    margin-left: 0.5rem;
    height: 14px;
    width: 14px;
}

.inac {
    opacity: 0.5;
}
</style>
