<script>
import { md } from '$lib/composer/md/md.js'
import { goto } from '$app/navigation'
import { page } from '$app/stores'

export let event;

$: title = event?.content?.title ? event?.content?.title : `Untitled`

$: content = event?.content?.body

function shorten(body) {
    if(!body) return ''
    const lastSpaceIndex = body?.lastIndexOf(' ', 200);
    if (lastSpaceIndex > 0) {
        const trimmedText = body?.substring(0, lastSpaceIndex);
        return trimmedText + '...';
    } else {
        return body.substring(0, 200)
    }
}

$: shortened = content ? md.render(shorten(content)) : ''

function goToPost() {
    let url = `${$page.url.pathname}/post/${event.slug}?view=board`
    if($page.url.search.includes('view=chat')){
        url = `${$page.url.pathname}/post/${event.slug}`
    }
    console.log(url)
    goto(url)
}

</script>

<div class="board-post-container" on:click={goToPost}>
    <div class="board-post fl-co">
        <div class="post-title">
            {title}
        </div>
        <div class="post-body">
            {@html shortened}
        </div>
    </div>
</div>

<style>
.board-post-container {
    display: flex;
}

.board-post {
    margin-left: calc(30px + 2rem);
    margin-bottom: 0.5rem;
    margin-right: 1.5rem;
    max-width: 500px;
    background: var(--event-highlight);
    border-radius: 7px;
    border: 1px solid transparent;
    padding: 0.5rem 0.75rem;
    cursor: pointer;
}
.board-post:hover {
    border: 1px solid var(--primary);
}
.post-title {
    font-weight: 500;
}
.post-body {
    margin-top: 0.125rem;
    font-weight: 400;
    font-size: 14px;
    color: var(--text-light);
}
</style>
