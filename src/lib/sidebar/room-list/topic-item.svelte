<script>
import { page } from '$app/stores';
import { goto } from '$app/navigation';
import { hash, down } from '$lib/assets/icons.js'
import { store } from '$lib/store/store.js'
import TopicTools from './topic-tools.svelte'
import { onMount, createEventDispatcher } from 'svelte';

const dispatch = createEventDispatcher();

export let roomItem;
export let item;
export let index;
export let isGeneral;
export let alias;

let Popup;
onMount(() => {
    import('$lib/popup/popup.svelte').then((m) => {
        Popup = m.default
    })
})

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

$: viewQuery = $page.url.searchParams.get('view')
$: chatView = viewQuery === 'chat'
$: boardView = viewQuery === 'board'

function goToRoom() {

    let url = `/${space}/${alias}/topic/${item}`
    if(isGeneral) {
        url = `/${space}/topic/${item}`
    }

    if(viewQuery) {
        url = url + `?view=${viewQuery}`
    }

    if($page.params.domain) {
        url = `/${$page.params.domain}${url}`
    }


    goto(url, {
        noscroll: true,
    })

    if($store.menuToggled) {
        store.toggleMenu()
    }
}

$: isBoard = item?.type === 'board'

function logItem(e) {
    e.preventDefault()
    console.log(item)
}

let menuActive = false;
let killPopup = () => {
    popup.kill()
}

let popup;

let killed = () => {
    menuActive = false
    //hovered = false
}

function removeTopic(e) {
    dispatch('remove', e.detail)

    if(active) {

        let url = `/${space}/${alias}`
        if(isGeneral) {
            url = `/${space}`
        }

        goto(url, {
            noscroll: true,
        })
    }
}

let dragging = false;

let initialX;
let initialY;

function dragStart(e) {
    initialX = e.clientX;
    initialY = e.clientY;
    $store.draggable = 'topic'
    dragging = true;
    e.dataTransfer.setData('text/plain', JSON.stringify(item));
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setDragImage(new Image(), 0, 0);
}

function dragEnd() {
    dragging = false;
}

function drag(e) {
    if(e.clientY - initialY >= 30) {
        initialY = e.clientY
        dispatch('move-down', index)
    }
    if(initialY - e.clientY >= 30) {
        initialY = e.clientY
        dispatch('move-up', index)
    }
}



</script>

<div class="topic-item"
    on:dragstart|stopPropagation={dragStart}
    on:dragend|stopPropagation={dragEnd}
    on:drag|stopPropagation={drag}
    class:dhov={dragging}
    class:ih={$store.draggable == null}
    class:active={active} draggable="true">

    <div class="item sel-no" 
        on:click={goToRoom}
        on:contextmenu={logItem}>

        <div class="ico grd-c"
            class:inactive={!active}>
            {@html hash}
        </div>

        <div class="sl">
            {item}
        </div>
    </div>

        {#if Popup}
            <div class="tools grd">
                <Popup
                bind:this={popup}
                trigger={"click"}
                offset={[0, 4]}
                on:killed={killed}
                shadow={`box-shadow: 0px 9px 15px -7px rgba(0,0,0,0.1);`}
                mask={true}
                placement={"bottom-end"}>

                    <div class="ich grd ph2"
                        slot="reference">
                        <div class="ico-s grd-c " >
                            {@html down}
                        </div>
                    </div>



                    <div class="component" slot="content">
                        <TopicTools 
                        topic={item} 
                        room={roomItem} 
                        on:remove={removeTopic}
                        on:kill={killPopup}/>
                    </div>

                </Popup>

            </div>
        {/if}

</div>


<style>
.topic-item {
    cursor: pointer;
    height: 30px;
    border-radius: 4px;
    font-size: 14px;
    display: grid;
    grid-template-columns: 1fr auto;
    margin-top: 0.1rem;
    margin-bottom: 0.1rem;
}

.item {
    display: grid;
    grid-template-columns: auto 1fr;
}

.ih:hover {
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
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: normal;
}
.inactive {
    opacity: 0.5;
}
.tools {
    opacity: 0;
}
.topic-item:hover .tools {
    opacity: 1;
}
.dhov {
    outline: 2px solid var(--primary);
    border-radius: 7px;
}
</style>
