<script>
import SpaceItem from './space-item.svelte'
export let spaces;
</script>

{#each spaces as space}
    <SpaceItem space={space} />
{/each}
