<script>
import { page } from '$app/stores';

import RoomListItem from './room-list-item.svelte'

export let children;



</script>

<RoomListItem isSpace={true} />
{#if children?.length > 0}
    {#each children as child}
            <RoomListItem alias={child.alias} />
    {/each}
{/if}

<style>
.item {
    cursor: pointer;
    padding: 0.125rem;
}
</style>
