<script>
import RoomListItem from './room-list-item.svelte'
import { joinSpace } from '$lib/utils/request.js'
import AddRoom from './add-room.svelte'
import { page } from '$app/stores';
import { addLine, up, down, settings } from '$lib/assets/icons.js'
import { store } from '$lib/store/store.js'
import SpaceSettingsSidebar from '$lib/space/settings/sidebar.svelte'

export let items;

$: state = $store?.states[$page?.params?.space]
$: sender_id = $store.credentials?.matrix_user_id

$: isOwner = state?.owner === sender_id

function addRoom() {
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
$: isOwner = state?.owner === sender_id
$: isSpaceSettings = isSpace && $page?.params?.room === 'settings'

$: spaceSettings = isSpaceSettings && authenticated && isOwner


$: space_room_id = state?.room_id
$: joinedSpace = authenticated && 
    $store?.spaces.find(x => x?.room_id === space_room_id) != null 

$: active = $store.verifiedSession

let busy = false;

$: space = $page.params.space

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
            //store.addRoom(resp.space.room_id)
            store.updateRoomJoinStatus($page.params.space, space_room_id)
        }
    } 
    busy = false
}


</script>

{#if isSpaceSettings && authenticated && isOwner}
    <SpaceSettingsSidebar />
{/if}

<div class="boards" class:op={spaceSettings}>

    {#if !joinedSpace && active}
        <div class="mb3 rel">
            <button class="but" 
                disabled={busy}
                on:click={join}>
                {#if busy}
                    Joining...
                {:else}
                    Join Space
                {/if}
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
    <div class="grd-c ico-s" on:click={addRoom}>
        {@html addLine}
    </div>
</div>

{#if items?.length > 0}
    {#each items as item}
        <RoomListItem item={item} collapsed={collapsed} />
    {/each}
{/if}

{#if isOwner && !collapsed}
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
    height: 26px;
}
.spinner {
    position: absolute;
    top: 3px;
    right: 5px;
}
</style>
