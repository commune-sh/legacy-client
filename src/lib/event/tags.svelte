<script>
export let event;
export let tags;

function findTag(t) {
    return t.split(':')[1]
}

</script>

<div class="tags fl">
    {#each tags as tag}
        <div class="tag grd-c mr1">
            {findTag(tag.key)}
        </div>
    {/each}
</div>

<style>
.tag {
    background-color: var(--primary);
    border-radius: 3px;
    padding: 0.125rem 0.25rem;
    font-size: small;
    font-weight: 500;
    color: white;
    height: 14px;
}
</style>
