<script>
export let event;

$: links = event?.content?.links;
</script>

<div class="links">
    {#each links as item}
        <div class="link-item">
            <a href={item.href} target="_blank" rel="noopener noreferrer">
            <div class="ovh fl-co">
                <div class="sm">
                    <b>{item.title}</b>
                </div>
                <div class="li link mr3 sm">
                    {item.href}
                </div>
                {#if item.description}
                    <div class="description sm">
                        {item.description}
                    </div>
                {/if}
                {#if item.author}
                    <div class="author sm li">
                        By {item.author}
                    </div>
                {/if}
            </div>
            </a>
        </div>
    {/each}
</div>

<style>
.link-item {
    margin: 0.5rem;
    padding: 0.5rem;
    border: 1px solid var(--border-1);
    position: relative;
    line-height: 1.5;
}
.ovh {
    overflow: hidden;
}

.li {
    color: var(--text-light);
}
.link {
    overflow: hidden;
    text-overflow: ellipsis;
    word-break: break-word;
    height: 22px;
}
.image {
    background-repeat: no-repeat;
    background-size: cover;
    background-position: center;
    border-radius: 3px;
    width: 60px;
    height: 60px;
}

a {
    color: var(--text);
    text-decoration: none;
}
</style>
