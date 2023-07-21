<script>
import { page } from '$app/stores';
import { goto } from '$app/navigation';
import { leaveSpace } from '$lib/utils/request.js'
import { leave as leaveIcon, settings, info } from '$lib/assets/icons.js'
import { store } from '$lib/store/store.js'
import {createEventDispatcher} from 'svelte';

$: authenticated = $store?.authenticated && 
    $store?.credentials != null
    $store?.credentials?.access_token?.length > 0


$: state = $store?.states[$page?.params?.space]
$: sender_id = $store.credentials?.matrix_user_id

$: isOwner = state?.owner?.user_id === sender_id

$: isSpaceAdmin = $store?.power_levels?.space?.[$store?.credentials?.matrix_user_id] == 100

$: space_room_id = state?.room_id

$: joinedSpace = $store?.rooms.find(x => x === space_room_id) != null 

$: isProfile = state?.space?.is_profile

const dispatch = createEventDispatcher();

function kill() {
    dispatch('kill')
}


async function leave() {
    dispatch('kill')
    store.removeSpace($page.params.space)
    store.removeRoom(space_room_id)
    if(state?.children) {
        state?.children?.forEach(x => {
            store.removeRoom(x.room_id)
        })
    }
    const resp = await leaveSpace(state?.room_id);
    if(resp) {
        console.log(resp)
    }
}

function spaceSettings() {
    $store.spaceSettingsOpen = true
    //goto(`/${$page.params.space}/settings`)
    kill()
}
</script>

<div class="user-popup">
    <div class="item fl" on:click={kill}>
        <div class="item grd-c fl-o">
            Space Info
        </div>
        <div class="ico-s ">
            {@html info}
        </div>
    </div>

    {#if isOwner || isSpaceAdmin}
        <div class="item fl" on:click={spaceSettings}>
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
                    {isProfile ? "Unfollow" : "Leave Space"}
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
    width: 216px;
    background-color: var(--popup-bg);
    border-radius: 5px;
    padding: 0.25rem;
    box-shadow: 0px 9px 15px -7px rgba(0,0,0,0.1);
}

.item {
    padding: 0.35rem 0.25rem;
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
