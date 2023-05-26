<script>
import SpaceItem from './space-item.svelte'
export let spaces;
</script>

<div class="switcher-items">
    {#if spaces?.length > 0}
        {#each spaces as space}
            <SpaceItem space={space} />
        {/each}
    {/if}
</div>

<style>
.switcher-items {
}
</style>
