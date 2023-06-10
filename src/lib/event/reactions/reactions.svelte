<script>
import { store } from '$lib/store/store.js'
import Reaction from './reaction.svelte'
import React from '$lib/event/tools/react.svelte'
export let event;
export let isReply;
export let hovered;

$: authenticated = $store?.authenticated && 
    $store?.credentials != null
    $store?.credentials?.access_token?.length > 0

$: sender= $store.credentials?.matrix_user_id


$: processed = event?.reactions?.sort((a,b) => b?.senders?.length - a?.senders?.length)

$: ml = processed?.length > 0

</script>

<div class="reactions fl">
    {#if processed?.length > 0}
        {#each processed as reaction}
            <Reaction isReply={isReply} event={event} hovered={hovered} reaction={reaction} />
        {/each}
    {/if}
    <div class="grd re" class:ml2={ml}>
        <React isReply={isReply} event={event} inline={true} on:active/>
    </div>
</div>

<style>
.re {
    height: 22px;
}
</style>
