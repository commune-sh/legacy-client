<script>
import { page } from '$app/stores';
import { leaveRoom } from '$lib/utils/request.js'
import { goto } from '$app/navigation';
import { leave as leaveIcon, settings, info } from '$lib/assets/icons.js'
import { store } from '$lib/store/store.js'
import {createEventDispatcher} from 'svelte';

export let room;

$: authenticated = $store?.authenticated && 
    $store?.credentials != null
    $store?.credentials?.access_token?.length > 0


$: state = $store?.states[$page?.params?.space]
$: sender_id = $store.credentials?.matrix_user_id
$: isOwner = state?.owner === sender_id

$: isSpaceAdmin = $store?.power_levels?.space?.[$store?.credentials?.matrix_user_id] == 100

$: space_room_id = state?.room_id
$: joinedSpace = $store?.spaces.find(x => x?.room_id === space_room_id) != null 

const dispatch = createEventDispatcher();

function kill() {
    dispatch('kill')
}

async function leave() {
    kill()
    const resp = await leaveRoom(room.room_id);
    if(resp && resp?.left) {
        console.log(resp)
        store.updateRoomLeftStatus($page.params.space, room.room_id)
    }
}

function boardSettings() {
    //$store.spaceSettingsOpen = true
    //goto(`/${$page.params.space}/settings`)
    console.log(room)
    $store.roomSettings = {
        active: true,
        room_id: room?.room_id,
    }
    kill()
}
</script>

<div class="user-popup">
    <div class="item fl" on:click={kill}>
        <div class="item grd-c fl-o">
            Board Info
        </div>
        <div class="ico-s ">
            {@html info}
        </div>
    </div>

    {#if isOwner || isSpaceAdmin}
        <div class="item fl" on:click={boardSettings}>
            <div class="item grd-c fl-o">
                Settings
            </div>
            <div class="ico-s">
                {@html settings}
            </div>
        </div>
    {/if}


    {#if authenticated}
        {#if !isOwner && joinedSpace}
        <div class="sep"></div>
            <div class="item fl" on:click={leave}>
                <div class="item grd-c fl-o">
                    Leave Space
                </div>
                <div class="ico-s leave">
                    {@html leaveIcon}
                </div>
            </div>
        {/if}
    {/if}
</div>

<style>
.user-popup {
    width: 180px;
    background-color: var(--popup-bg);
    border-radius: 5px;
    padding: 0.25rem;
    box-shadow: 0px 9px 15px -7px rgba(0,0,0,0.1);
}

.item {
    padding: 0.25rem;
    border-radius: 4px;
    font-size: 0.8rem;
    font-weight: bold;
    cursor: pointer;
}
.item:hover {
    background-color: var(--context-menu-hover);
}

.leave {
    fill: var(--primary);
}

.sep {
    width: 100%;
    height: 1px;
    background: var(--bg);
    margin-top: 0.25rem;
    margin-bottom: 0.25rem;
}
</style>
