<script>
import { page } from '$app/stores';
import { goto } from '$app/navigation';
import { hash, home } from '../../../assets/icons.js'

export let isSpace
export let alias

$: space = $page.params?.space
$: room = $page.params?.room
$: active = room === alias

$: name = isSpace ? space : alias

function goToRoom() {
    let url = `/${space}/${alias}`
    if(isSpace) {
        url = `/${space}`
    }
    goto(url, {
        noscroll: true,
    })
}


</script>

<div class="item" 
    on:click={goToRoom}
    class:active={active}>

    <div class="icon grd-c"
        class:inactive={!active}>
        {#if isSpace}
            {@html home}
        {:else}
            {@html hash}
        {/if}
    </div>

    <div class="sl ml2">
        {name}
    </div>
</div>

<style>
.item {
    cursor: pointer;
    margin-bottom: 0.25rem;
    display: grid;
    grid-template-columns: auto 1fr;
    height: 28px;
}
.item:hover {
    background-color: var(--light);
}
.active {
    font-weight: bold;
    background-color: var(--light);
}

.icon {
    height: 16px;
    width: 16px;
    fill: var(--text-1);
}
.sl {
    padding-top: 4px;
    align-self: center;
}
.inactive {
    opacity: 0.5;
}
</style>
