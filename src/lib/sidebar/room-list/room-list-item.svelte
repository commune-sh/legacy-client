<script>
import { page } from '$app/stores';
import { goto } from '$app/navigation';
import { hash, board } from '../../../assets/icons.js'
import { store } from '../../../store/store.js'

export let item;

$: space = $page.params?.space
$: room = $page.params?.room
$: post = $page.params?.post

$: isGeneral = item?.general === true

$: active = (isGeneral && !room) || (room === item?.alias)

let toggled = false;

$: if(active) {
    toggled = true
}

$: if(toggled) {
    let path = item?.alias
    if(post) {
        path = `${item?.alias}/${post}`
    }
    //store.addSpaceRoomPath(space, item?.alias, path)
    toggled = false
}

$: spacePath = $store?.spacePaths[space]
$: spaceRoomPath = $store?.spacePaths[space]?.rooms[item?.alias]

$: menuToggled = $store?.menuToggled

function goToRoom() {

    let url = `/`
    let alias = `/${item.alias}`
    if(isGeneral) {
        alias = ''
    }

    if(spaceRoomPath == undefined || spaceRoomPath == '/') {
        url = `/${space}${alias}`
    } else {
        url = `/${space}${alias}${spaceRoomPath}`
    }

    if(menuToggled) {
        url = `/${space}${alias}`
    }

    goto(url, {
        noscroll: true,
    })

    if(menuToggled) {
        store.toggleMenu()
    }
}

$: isBoard = item?.type === 'board'

</script>

<div class="item" 
    draggable="true"
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
        {item?.alias}
    </div>
</div>

<style>
.item {
    cursor: pointer;
    display: grid;
    grid-template-columns: auto 1fr;
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
