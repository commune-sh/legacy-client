<script>
import { PUBLIC_BASE_URL } from '$env/static/public';
import { leaveRoom } from '$lib/utils/request.js'
import { page } from '$app/stores';
import { trash, feed } from '$lib/assets/icons.js'
import { store } from '$lib/store/store.js'
import {createEventDispatcher} from 'svelte';

export let room;
export let topic;

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

function openFeed() {
    dispatch('kill')

    let url = ``

    if(room?.alias == 'general') {
        url = `${PUBLIC_BASE_URL}/${$page.params.space}/topic/${topic}`
    } else {
        url = `${PUBLIC_BASE_URL}/${$page.params.space}/${room?.alias}/topic/${topic}`
    }

    url = `${url}/rss`

    window.open(url, '_blank')
}


async function remove() {
    kill()
    dispatch('remove', topic)
}


</script>

<div class="user-popup">


    <div class="item fl" on:click={openFeed}>
        <div class="item grd-c fl-o">
            RSS Feed
        </div>
        <div class="ico-s ">
            {@html feed}
        </div>
    </div>

    {#if authenticated && (isOwner || isSpaceAdmin)}
        <div class="item fl" on:click={remove}>
            <div class="rem item grd-c fl-o">
                Remove
            </div>
            <div class="ico-s rem">
                {@html trash}
            </div>
        </div>
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

.rem {
    color: red;
    fill: red;
}

.ico-s {
    height: 16px;
    width: 16px;
}
</style>
