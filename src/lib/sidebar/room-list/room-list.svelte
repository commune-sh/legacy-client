<script>
import { createEventDispatcher } from 'svelte';
import RoomListItem from './room-list-item.svelte'
import { joinSpace } from '$lib/utils/request.js'
import AddRoom from './add-room.svelte'
import { page } from '$app/stores';
import { addLine, up, down, settings } from '$lib/assets/icons.js'
import { store } from '$lib/store/store.js'
import SpaceSettingsSidebar from '$lib/space/settings/sidebar.svelte'
const dispatch = createEventDispatcher()

export let items;

$: indexed = items.map((item, index) => ({ ...item, index }));

$: state = $store?.states[$page?.params?.space]
$: sender_id = $store.credentials?.matrix_user_id

$: isSpaceAdmin = $store?.power_levels?.space?.[$store?.credentials?.matrix_user_id] == 100

function addRoom() {
    console.log("adding")
    $store.addingRoom = true
}

let collapsed = false;

function toggleCollapse() {
    collapsed = !collapsed;
}

$: authenticated = $store?.authenticated && 
    $store?.credentials != null
    $store?.credentials?.access_token?.length > 0


$: isSpace = $page?.params?.space !== undefined && $page?.params?.space !== null && $page?.params?.space !== '' 
$: sender_id = $store.credentials?.matrix_user_id
$: isOwner = state?.owner?.user_id === sender_id
$: isSpaceSettings = isSpace && $page?.params?.room === 'settings'

$: spaceSettings = isSpaceSettings && authenticated && isOwner


$: space_room_id = state?.room_id



$: joinedSpace = authenticated && 
    $store.rooms?.find(x => x === space_room_id) != null 

$: active = $store.verifiedSession

let busy = false;

$: space = $page.params.space

$: banned = state?.banned === true

async function join() {
    if(!authenticated) {
        store.startAuthenticating("login")
        return
    }
    busy = true
    if(!joinedSpace) {
        const resp = await joinSpace(state?.room_id);
        if(resp && resp.space) {
            console.log(resp)
            if(!resp?.space?.is_profile) {
                store.addSpace(resp.space)
            }
            store.addRoom(resp.space.room_id)
            store.updateRoomJoinStatus($page.params.space, space_room_id)
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

$: isProfile = state?.space?.is_profile

$: buttonText = isProfile ? busy ? "Following" : "Follow" : busy ? "Joining" : "Join"


function moveRoom(e) {
    console.log(e.detail)
    let index = e.detail
    if (index.from === index.to || index.from < 0 || index.to < 0 || index.from
        >= items.length || index.to >= items.length) {
        return 
    }

    const shiftedArray = [...items];
    const [removedItem] = shiftedArray.splice(index.from, 1);
    shiftedArray.splice(index.to, 0, removedItem);
    items = shiftedArray;
    console.log(shiftedArray)
}

function moveUp(e) {
    if(e.detail === 0) return
    const [removedItem] = items.splice(e.detail, 1);
    items.splice(e.detail - 1, 0, removedItem);
    items = items
}

function moveDown(e) {
    if(e.detail == items.length -1) return
    const [removedItem] = items.splice(e.detail, 1);
    items.splice(e.detail + 1, 0, removedItem);
    items = items

}

</script>

{#if isSpaceSettings && authenticated && isOwner}
    <SpaceSettingsSidebar />
{/if}

<div class="boards" class:op={spaceSettings}>

    {#if !joinedSpace && active && !banned}
        <div class="mb3 rel">
            <button class="but" 
                disabled={busy}
                on:click={join}>
                {buttonText}
            </button>
            {#if busy}
                <div class="spinner">
                    <div class="sloader"></div>
                </div>
            {/if}
        </div>
    {/if}

<div class="fl mb2">
    <div class="brds grd-c fl" 
        on:click={toggleCollapse}>
        <div class="grd-c ico-s mr1">
            {#if collapsed}
                {@html up}
            {:else}
                {@html down}
            {/if}
        </div>
        <div class="fl grd-c">
            <div class="label">boards</div>
        </div>
    </div>
    <div class="fl-o"></div>

    {#if isOwner || isSpaceAdmin}
    <div class="grd-c ico-s" on:click={addRoom}>
        {@html addLine}
    </div>
    {/if}
</div>

{#if indexed?.length > 0}
    {#each indexed as item, i(item.room_id)}
            <RoomListItem item={item} 
                collapsed={collapsed} 
                on:move-up={moveUp}
                on:move-down={moveDown}
                index={i}/>
    {/each}
{/if}

{#if (isOwner || isSpaceAdmin) && !collapsed}
    <AddRoom />
{/if}

</div>

<style>
.brds {
    opacity: 0.9;
}

.brds:hover {
    opacity: 1;
}

.label {
    color: var(--text-light);
    cursor: pointer;
    font-size: 12px;
}
.ico-s {
    width: 18px;
    height: 18px;
    cursor: pointer;
}
.set {
    width: 18px;
    height: 18px;
}
.op {
    opacity: 0.4;
}
.but {
    width: 100%;
    height: 30px;
}
.spinner {
    position: absolute;
    top: 3px;
    right: 5px;
}
</style>
