<script>
import RoomListItem from './room-list-item.svelte'
import AddRoom from './add-room.svelte'
import { page } from '$app/stores';
import { store } from '$lib/store/store.js'

export let items;

$: state = $store?.states[$page?.params?.space]
$: sender_id = $store.credentials?.matrix_user_id

$: isOwner = state?.owner === sender_id

</script>

<div class="mb2">
    <div class="brds">
        <span class="label">boards</span>
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
</style>
