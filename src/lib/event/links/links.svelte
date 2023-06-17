<script>
export let event;
import { external } from '$lib/assets/icons.js'

$: links = event?.content?.links;
</script>

<div class="links">
    {#each links as item}
        <a class="" href={item.href} target="_blank" rel="noopener noreferrer">
        <div class="link-item fl">
            <div class="image grd-c grd mr2" 
                style="background-image: url({item.image})">
                {#if !item.image}
                    <div class="grd-c ico-s">
                        {@html external}
                    </div>
                {/if}
            </div>
            <div class="ovh fl-co fl-o">
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
        </div>
        </a>
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
    background-color: var(--shade-3);
    width: 40px;
    height: 40px;
}

.description {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    word-break: break-all;
}
a {
    color: var(--text);
    text-decoration: none;
}
</style>
