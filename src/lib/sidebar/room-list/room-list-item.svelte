<script>
import { page } from '$app/stores';
import { goto } from '$app/navigation';
import { hash, board } from '$lib/assets/icons.js'
import { store } from '$lib/store/store.js'
import TopicItem from './topic-item.svelte'

export let item;

$: space = $page.params?.space
$: room = $page.params?.room
$: topic = $page.params?.topic
$: post = $page.params?.post

$: isGeneral = item?.general === true

$: active = (isGeneral && !room && !topic) || 
    (room === item?.alias && !topic)

$: selected = (isGeneral && !room) || 
    (room === item?.alias)

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
        if(room == item?.alias) {
            url = `/${space}${alias}`
        }
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
        {@html hash}
    </div>

    <div class="sl">
        {item?.alias}
    </div>
</div>

{#if item?.topics?.length > 0 && selected}
    {#each item?.topics as topic}
        <TopicItem 
            isGeneral={isGeneral}
            alias={item.alias}
            item={topic} />
    {/each}
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
