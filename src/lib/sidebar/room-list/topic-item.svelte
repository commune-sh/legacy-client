<script>
import { page } from '$app/stores';
import { goto } from '$app/navigation';
import { pulse } from '$lib/assets/icons.js'
import { store } from '$lib/store/store.js'

export let item;
export let isGeneral;
export let alias;

$: space = $page.params?.space
$: room = $page.params?.room
$: topic = $page.params?.topic
$: post = $page.params?.post


$: active = (isGeneral && !room && topic == item) || 
    (room === alias && topic == item)

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

    let url = `/${space}/${alias}/topic/${item}`
    if(isGeneral) {
        url = `/${space}/topic/${item}`
    }

    if($page.params.domain) {
        url = `/${$page.params.domain}${url}`
    }


    goto(url, {
        noscroll: true,
    })

}

$: isBoard = item?.type === 'board'

function logItem(e) {
    e.preventDefault()
    console.log(item)
}

</script>

<div class="item" 
    draggable="true"
    on:click={goToRoom}
    on:contextmenu={logItem}
    class:active={active}>

    <div class="ico grd-c"
        class:inactive={!active}>
        {@html pulse}
    </div>

    <div class="sl">
        {item}
    </div>
</div>
{#if item?.topics?.length > 0}
    ok
{/if}

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
    margin-left: 1.75rem;
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
