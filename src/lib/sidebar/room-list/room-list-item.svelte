<script>
import { PUBLIC_APP_NAME, PUBLIC_MEDIA_URL } from '$env/static/public';
import { joinSpace, joinRoom } from '$lib/utils/request.js'
import { page } from '$app/stores';
import { goto } from '$app/navigation';
import { isInViewport } from '$lib/utils/utils.js'
import { discuss, chat, down } from '$lib/assets/icons.js'
import { createStateEvent } from '$lib/utils/request.js'
import { store } from '$lib/store/store.js'
import TopicItem from './topic-item.svelte'
import AddTopic from './add-topic.svelte'
import Popup from '$lib/popup/popup.svelte'
import RoomTools from './room-tools.svelte'

export let item;
export let collapsed;

$: state = $store?.states[$page?.params?.space]
$: sender_id = $store.credentials?.matrix_user_id

$: isOwner = state?.owner?.user_id === sender_id
$: isSpaceAdmin = $store?.power_levels?.space?.[$store?.credentials?.matrix_user_id] == 100

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


$: authenticated = $store?.authenticated && 
    $store?.credentials != null
    $store?.credentials?.access_token?.length > 0

$: space_room_id = state?.room_id
$: room_id = item?.room_id

$: isSpaceRoom = room_id === space_room_id

/*
$: joinedRoom = () => {
    if(room_id == state?.room_id) {
        return true
    }
    return state?.children?.find(x => x?.room_id === room_id)?.joined
}
*/

$: joinedRoom = authenticated && 
    $store?.rooms.find(x => x === room_id) != null 

$: joinedSpace = authenticated && 
    $store?.spaces.find(x => x?.room_id === space_room_id) != null 

$: joined = joinedSpace && joinedRoom

$: banned = item?.banned === true

$: bannedFromSpace = state?.banned === true


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

$: topicItems = item?.topics != undefined ? JSON.parse(item?.topics) : null
$: topics = topicItems?.sort((a, b) => a.localeCompare(b));


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

let busy = false;

async function join() {
    if(!authenticated) {
        store.startAuthenticating("login")
        return
    }
    busy = true
    if(!joinedSpace) {
        const resp = await joinSpace(space);
        if(resp && resp.space) {
            console.log(resp)
            store.addSpace(resp.space)
            store.addRoom(resp.space.room_id)
            store.updateRoomJoinStatus($page.params.space, room_id)
        }
        if(resp && resp?.error) {
            console.log(resp)
            $store.alert = {
                active: true,
                message: resp.error
            }
        }
    } 

    if(!isSpaceRoom) {
        const resp = await joinRoom(room_id);
        if(resp && resp?.joined && resp.room_id) {
            console.log(resp)
            store.addRoom(resp.room_id)
            store.updateRoomJoinStatus($page.params.space, room_id)
        }
        if(resp && resp?.error) {
            console.log(resp)
            $store.alert = {
                active: true,
                message: resp.error
            }
        }
    }
    busy = false
}

$: isDomain = $page.params.domain !== undefined && 
    $page.params.domain !== 'undefined' && 
    $page.params.domain?.length > 0

$: mediaURL = isDomain ? $store?.federated?.media_url : PUBLIC_MEDIA_URL


$: avatar = item?.avatar ? `${mediaURL}/${item?.avatar}` : null
$: header = item?.header ? `${mediaURL}/${item?.header}` : null

async function removeTopic(e) {
    let newTopics = topics.filter(x => x !== e.detail)
    store.updateRoomTopics($page.params.space, item.alias, JSON.stringify(newTopics))
    const res = await createStateEvent({
        room_id: room_id,
        event_type: 'm.room.topics',
        content: {
            topics: newTopics
        }
    })
    console.log(res)
}


</script>

<svelte:head>
{#if active}
    {#if avatar}
        <meta property="og:image" content={avatar} />
    {:else if header}
        <meta property="og:image" content={header} />
    {/if}
{/if}
</svelte:head>

{#if show}
<div class="room-item"
    bind:this={el}
    on:contextmenu={logItem}
    on:mouseover={() => hovered = true}
    on:mouseleave={() => hovered = false}
    draggable="true">

    <div class="item" class:active={active}>

    <div class="inner sel-no" on:click={goToRoom}>

        {#if avatar}
        <div class="ico grd-c img"
            class:inactive={!active}
            style="background-image: url({avatar})">
        </div>
        {:else}
        <div class="ico grd-c"
            class:inactive={!active}>
                {#if isBoard}
                    {@html discuss}
                {:else}
                    {@html chat}
                {/if}

        </div>
        {/if}

        <div class="sl ml1  pr2">
            {item?.alias}
        </div>



    </div>
        {#if authenticated && !joined && !isGeneral && !banned && !bannedFromSpace}
            <div class="grd-c mr1 join">
                <button class="light" 
                    disabled={busy}
                    on:click={join}>
                    {busy ? "Joining..." : "Join"}
                </button>
            </div>
        {/if}


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

    <div class="topics">

        {#if topics?.length > 0 && selected}
            {#each topics as topic}
                <TopicItem 
                    on:remove={removeTopic}
                    isGeneral={isGeneral}
                    alias={item.alias}
                    roomItem={item}
                    item={topic} />
            {/each}
        {/if}

        {#if selected && (isOwner || isSpaceAdmin)}
            <AddTopic alias={item.alias} topics={topics}/>
        {/if}

    </div>

</div>

{/if}


<style>

.room-item {
    display: grid;
    grid-template-rows: 1fr auto;
    grid-row-gap: 0.15rem;
}

.item {
    display: grid;
    grid-template-columns: 1fr auto auto;
    cursor: pointer;
    height: 30px;
    border-radius: 4px;
    font-size: 14px;
}

.inner {
    display: grid;
    grid-template-columns: auto 1fr auto;
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
button {
    padding: 0.25rem;;
}

.join {
    display: none;
}
.room-item:hover .join {
    display: grid;
}

.img {
    background-size: cover;
    background-position: center;
    border-radius: 50%;
    height: 14px;
    width: 14px;
}
</style>
