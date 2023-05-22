<script>
import RoomListItem from './room-list-item.svelte'

export let items;



</script>

{#if items?.length > 0}
    {#each items as item}
        <RoomListItem item={item} />
    {/each}
{/if}

<style>
.item {
    cursor: pointer;
    padding: 0.125rem;
}
</style>
