<script>
import { PUBLIC_APP_NAME } from '$env/static/public';
import { page } from '$app/stores';
import { goto } from '$app/navigation';
import { isInViewport } from '$lib/utils/utils.js'
import { discuss, chat, down } from '$lib/assets/icons.js'
import { store } from '$lib/store/store.js'
import TopicItem from './topic-item.svelte'
import AddTopic from './add-topic.svelte'
import Popup from '$lib/popup/popup.svelte'
import RoomTools from './room-tools.svelte'

export let item;
export let collapsed;

$: state = $store?.states[$page?.params?.space]
$: sender_id = $store.credentials?.matrix_user_id

$: isOwner = state?.owner === sender_id

$: space = $page.params?.space
$: room = $page.params?.room
$: topic = $page.params?.topic
$: post = $page.params?.post

$: isGeneral = item?.general === true

$: active = (isGeneral && !room && !topic) || 
    (room === item?.alias && !topic)

$: selected = (isGeneral && !room) || 
    (room === item?.alias)

$: if(selected) {
    document.title = `${item.title} - ${PUBLIC_APP_NAME}`
}

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

$: isDomain = $page?.params?.domain != null && $page?.params?.domain?.length > 0

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


    if(isDomain) {
        url = `/${$page.params.domain}/${space}${alias}`
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
    popup.activate()
    console.log(item)
}

$: topics = item?.topics != undefined ? JSON.parse(item?.topics) : null


let hovered = false;

$: show = selected ? true : collapsed && selected ? true : !collapsed ? true :
    false

let menuActive = false;


let killPopup = () => {
    popup.kill()
}

let popup;

let killed = () => {
    menuActive = false
    //hovered = false
}

let el;
$: if(active && el) {
    isInViewport(el)
    .then(e => {
        if(!e) {
            el.scrollIntoView()
        }
    });
}

</script>

{#if show}
<div class="room-item"
        bind:this={el}
        on:contextmenu={logItem}
        on:mouseover={() => hovered = true}
        on:mouseleave={() => hovered = false}
        class:active={active}>

    <div class="item" 
            on:click={goToRoom}>

        <div class="ico grd-c"
            class:inactive={!active}>
                {#if isBoard}
                    {@html discuss}
                {:else}
                    {@html chat}
                {/if}
        </div>

        <div class="sl pr2">
            {item?.alias}
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
                    <RoomTools room={item} on:kill={killPopup}/>
                </div>

            </Popup>

        </div>

</div>

{#if topics?.length > 0 && selected}
    {#each topics as topic}
        <TopicItem 
            isGeneral={isGeneral}
            alias={item.alias}
            item={topic} />
    {/each}
{/if}

{#if selected && isOwner}
    <AddTopic alias={item.alias} topics={topics}/>
{/if}


{/if}


<style>

.room-item {
    display: grid;
    grid-template-columns: 1fr auto;
    cursor: pointer;
    height: 30px;
    border-radius: 4px;
    font-size: 14px;
    margin-bottom: 0.15rem;
}

.item {
    display: grid;
    grid-template-columns: auto 1fr auto;
}

.room-item:hover {
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
    line-height: normal;
}
.inactive {
    opacity: 0.5;
}

.set {
}

.item:hover .set{
}

.ico-s {
    height: 18px;
    width: 18px;
}

.tools {
    opacity: 0;
}
.room-item:hover .tools {
    opacity: 1;
}
.mac {
    opacity: 1;
}
.ich:hover .ico-s {
    opacity: 1;
}
</style>
