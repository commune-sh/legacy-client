<script>
import { page } from '$app/stores';
import { goto } from '$app/navigation';
import { hash, down } from '$lib/assets/icons.js'
import { store } from '$lib/store/store.js'
import Popup from '$lib/popup/popup.svelte'
import TopicTools from './topic-tools.svelte'
import { createEventDispatcher } from 'svelte'

const dispatch = createEventDispatcher();

export let roomItem;
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

</script>

<div class="topic-item"
    class:active={active}>

    <div class="item" 
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

</div>


<style>
.topic-item {
    cursor: pointer;
    height: 30px;
    border-radius: 4px;
    font-size: 14px;
    margin-bottom: 0.15rem;
    display: grid;
    grid-template-columns: 1fr auto;
}

.item {
    display: grid;
    grid-template-columns: auto 1fr;
}

.topic-item:hover {
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
</style>
