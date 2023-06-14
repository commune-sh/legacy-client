<script>
import { page } from '$app/stores';
import { goto } from '$app/navigation';
import { discuss, settings } from '$lib/assets/icons.js'
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


    /*
    if(spaceRoomPath == undefined || spaceRoomPath == '/') {
        url = `/${space}${alias}`
    } else {
        url = `/${space}${alias}${spaceRoomPath}`
        if(room == item?.alias) {
            url = `/${space}${alias}`
        }
    }

    if(menuToggled ) {
        url = `/${space}${alias}`
    }
    */

    url = `/${space}${alias}`



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

$: topics = item?.topics != undefined ? JSON.parse(item?.topics) : null


let hovered = false;

function showMenu(e) {
    e.stopPropagation()
}

</script>

<div class="item" 
    draggable="true"
    on:click={goToRoom}
    on:contextmenu={logItem}
    on:mouseover={() => hovered = true}
    on:mouseleave={() => hovered = false}
    class:active={active}>

    <div class="ico grd-c"
        class:inactive={!active}>
        {@html discuss}
    </div>

    <div class="sl pr2">
        {item?.alias}
    </div>

    {#if hovered}
        <div class="ico-s grd-c ph2 set" on:click={showMenu}>
        {@html settings}
    </div>
    {/if}
</div>

{#if topics?.length > 0 && selected}
    {#each topics as topic}
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

.ico {
    margin-right: 0.5rem;
    margin-left: 0.5rem;
    height: 14px;
    width: 14px;
}

.sl {
    padding-top: 2px;
    align-self: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
.inactive {
    opacity: 0.5;
}

.set {
}

.item:hover .set{
}

.ico-s {
    height: 14px;
    width: 14px;
}
</style>
