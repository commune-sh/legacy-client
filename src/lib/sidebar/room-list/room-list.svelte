<script>
import RoomListItem from './room-list-item.svelte'
import AddRoom from './add-room.svelte'
import { page } from '$app/stores';
import { addLine } from '$lib/assets/icons.js'
import { store } from '$lib/store/store.js'

export let items;

$: state = $store?.states[$page?.params?.space]
$: sender_id = $store.credentials?.matrix_user_id

$: isOwner = state?.owner === sender_id

function addRoom() {
    $store.addingRoom = true
}

</script>

<div class="fl mb2">
    <div class="brds fl-o">
        <span class="label">boards</span>
    </div>
    <div class="grd-c ico-s" on:click={addRoom}>
        {@html addLine}
    </div>
</div>

{#if items?.length > 0}
    {#each items as item}
        <RoomListItem item={item} />
    {/each}
{/if}

{#if isOwner}
    <AddRoom />
{/if}

<style>
.brds {
    color: var(--text-light);
}
.ico-s {
    width: 18px;
    height: 18px;
    cursor: pointer;
}
</style>
