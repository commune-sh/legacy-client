<script>
import { PUBLIC_BASE_URL } from '$env/static/public';
import { leaveRoom } from '$lib/utils/request.js'
import { page } from '$app/stores';
import { leave as leaveIcon, settings, info, feed } from '$lib/assets/icons.js'
import { store } from '$lib/store/store.js'
import {createEventDispatcher} from 'svelte';

export let room;

$: authenticated = $store?.authenticated && 
    $store?.credentials != null
    $store?.credentials?.access_token?.length > 0


$: state = $store?.states[$page?.params?.space]
$: sender_id = $store.credentials?.matrix_user_id
$: isOwner = state?.owner?.user_id === sender_id

$: isSpaceAdmin = $store?.power_levels?.space?.[$store?.credentials?.matrix_user_id] == 100

$: space_room_id = state?.room_id
$: joinedSpace = $store?.spaces.find(x => x?.room_id === space_room_id) != null 

const dispatch = createEventDispatcher();

function kill() {
    dispatch('kill')
}

function openFeed() {
    dispatch('kill')


    let url = ``

    if(room?.alias == 'general') {
        url = `${PUBLIC_BASE_URL}/${$page.params.space}`
    } else {
        url = `${PUBLIC_BASE_URL}/${$page.params.space}/${room?.alias}`
    }

    url = `${url}/rss`

    window.open(url, '_blank')
}


async function leave() {
    kill()
    const resp = await leaveRoom(room.room_id);
    if(resp && resp?.left) {
        console.log(resp)
        store.updateRoomLeftStatus($page.params.space, room.room_id)
        store.removeRoom(room.room_id)
    }
}

function boardSettings() {
    //$store.spaceSettingsOpen = true
    //goto(`/${$page.params.space}/settings`)
    kill()

    if(room.alias == `general`) {
        $store.spaceSettingsOpen = true
    } else {
        $store.roomSettings = {
            active: true,
            room_id: room?.room_id,
        }
    }
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

    <div class="item fl" on:click={openFeed}>
        <div class="item grd-c fl-o">
            RSS Feed
        </div>
        <div class="ico-s ">
            {@html feed}
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
                    Leave Board
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
    border: 1px solid var(--border-1);
    border-radius: 5px;
    padding: 0.25rem;
}

.item {
    padding: 0.25rem;
    border-radius: 4px;
    font-size: 0.8rem;
    font-weight: 500;
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
