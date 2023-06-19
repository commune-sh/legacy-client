<script>
import { page } from '$app/stores';
import { goto } from '$app/navigation';
import { leave, settings, info } from '$lib/assets/icons.js'
import { store } from '$lib/store/store.js'
import {createEventDispatcher} from 'svelte';

$: authenticated = $store?.authenticated && 
    $store?.credentials != null
    $store?.credentials?.access_token?.length > 0


$: state = $store?.states[$page?.params?.space]
$: sender_id = $store.credentials?.matrix_user_id
$: isOwner = state?.owner === sender_id

$: space_room_id = state?.room_id
$: joinedSpace = $store?.spaces.find(x => x?.room_id === space_room_id) != null 

const dispatch = createEventDispatcher();

function kill() {
    dispatch('kill')
}

function spaceSettings() {
    //$store.spaceSettingsOpen = true
    goto(`/${$page.params.space}/settings`)
    kill()
}
</script>

<div class="user-popup">
    <div class="item fl">
        <div class="item grd-c fl-o" on:click={kill}>
            Space Info
        </div>
        <div class="ico-s ">
            {@html info}
        </div>
    </div>

    {#if isOwner}
        <div class="item fl">
            <div class="item grd-c fl-o" on:click={spaceSettings}>
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
            <div class="item fl" on:click={kill}>
                <div class="item grd-c fl-o">
                    Leave Space
                </div>
                <div class="ico-s leave">
                    {@html leave}
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
