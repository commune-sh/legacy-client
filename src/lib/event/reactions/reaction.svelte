<script>
import { createEventDispatcher } from 'svelte'
import { store } from '$lib/store/store.js'

const dispatch = createEventDispatcher()

export let event;
export let reaction;
export let isReply;

$: sender= $store.credentials?.matrix_user_id

$: reacted = reaction?.senders?.findIndex(s => s === sender) > -1

function reactToEvent() {
    dispatch('react', reaction.key)
}

</script>

<div class="reaction fl mr1" 
    on:click|stopPropagation={reactToEvent}
    class:reacted={reacted}>
    <div class="emoji">
        {reaction?.key}
    </div>
    <div class="t ml1">
        {reaction?.senders?.length}
    </div>
</div>

<style>
.reaction {
    font-size: small;
    color: var(--text-light);
    background-color: var(--shade-2);
    border: 1px solid var(--shade-2);
    border-radius: 5px;
    padding-left: 0.25rem;
    padding-right: 0.25rem;
    padding-top: 0;
    padding-bottom: 0;
    height: 20px;
    cursor: pointer;
}

.reacted {
    border: 1px solid var(--primary);
}

.bg {
    background-color: var(--reaction-bg);
}

:global(:root) {
    --reaction-bg: #272727;
    --reaction-border: #272727;
}

:global(:root.light) {
    --reaction-bg: #f5f5f5;
    --reaction-border: #f0f0f0;
}

.emoji {
    font-size: small;
    line-height: 1.6;
}
.t {
    font-size: small;
    color: var(--text-light);
    line-height: 1.6;
}
</style>
