<script>
export let reaction;
</script>

<div class="reaction fl mr1">
    <div class="emoji">
        {reaction?.key}
    </div>
    {#if reaction?.senders?.length > 1}
    <div class="t">
        ×{reaction?.senders?.length}
    </div>
    {/if}
</div>

<style>
.reaction {
    font-size: small;
    font-weight: bold;
    line-height: 1;
    color: var(--text-light);
    background-color: var(--shade-2);
    border-radius: 3px;
    padding-left: 0.25rem;
    padding-right: 0.25rem;
    padding-top: 0;
    padding-bottom: 0;
    height: 20px;
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
    line-height: 1;
    margin-left: 2px;
}
</style>
