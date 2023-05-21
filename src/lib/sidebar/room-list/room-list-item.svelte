<script>
import { page } from '$app/stores';
import { goto } from '$app/navigation';
import { hash, board } from '../../../assets/icons.js'

export let isSpace;
export let item;

$: space = $page.params?.space
$: room = $page.params?.room
$: active = room === item?.alias

$: name = isSpace ? `general` : item?.alias

function goToRoom() {
    let url = `/${space}/${item?.alias}`
    if(isSpace) {
        url = `/${space}`
    }
    goto(url, {
        noscroll: true,
    })
}

$: isBoard = item?.type === 'board'

</script>

<div class="item" 
    on:click={goToRoom}
    class:active={active}>

    <div class="ico grd-c"
        class:inactive={!active}>
        {#if isBoard}
            {@html board}
        {:else}
            {@html hash}
        {/if}
    </div>

    <div class="sl">
        {name}
    </div>
</div>

<style>
.item {
    cursor: pointer;
    display: grid;
    grid-template-columns: auto 1fr;
    height: 26px;
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

.ico {
    margin-right: 0.5rem;
    margin-left: 0.5rem;
    height: 14px;
    width: 14px;
}
.sl {
    padding-top: 2px;
    align-self: center;
}
.inactive {
    opacity: 0.5;
}
</style>
