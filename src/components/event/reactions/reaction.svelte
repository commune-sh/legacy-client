<script>
export let reaction;
</script>

<div class="reaction fl mr1">
    <div class="emoji">
        {reaction?.key}
    </div>
    {#if reaction?.senders?.length > 1}
        <div class="t ml1">
            {reaction?.senders?.length}
        </div>
    {/if}
</div>

<style>
.reaction {
    padding-right: 0.25rem;
    border-radius: 13px;
}

.bg {
    background-color: var(--reaction-bg);
}

:global(:root) {
    --reaction-bg: #272727;
}

:global(:root.light) {
    --reaction-bg: #f5f5f5;
}

.emoji {
    font-size: 1.2rem;
    line-height: 1.2;
}
.t {
    font-size: small;
    color: var(--text-light);
}
</style>
