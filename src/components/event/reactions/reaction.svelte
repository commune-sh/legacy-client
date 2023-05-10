<script>
export let reaction;
</script>

<div class="reaction fl mr1">
    <div class="emoji">
        {reaction?.key}
    </div>
    <div class="t">
        {reaction?.senders?.length}
    </div>
</div>

<style>
.reaction {
    padding-right: 0.25rem;
    padding-left: 0.25rem;
    padding-top: 0.25rem;
    padding-bottom: 0.25rem;
    border-radius: 500px;
    border: 2px solid var(--reaction-border);
    height: 14px;
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
    font-size: 1rem;
    line-height: 1;
}
.t {
    font-size: small;
    color: var(--text-light);
    line-height: 1;
    margin-left: 4px;
}
</style>
