<script>
import Reaction from './reaction.svelte'
import { react } from '$lib/assets/icons.js'
export let reactions;

$: processed = reactions?.sort((a,b) => b?.senders?.length - a?.senders?.length)

</script>

<div class="reactions fl">
    {#if processed?.length > 0}
        {#each processed as reaction}
            <Reaction reaction={reaction} />
        {/each}
    {/if}
</div>

<style>
.reactions {
}
</style>
