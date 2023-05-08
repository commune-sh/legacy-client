<script>
    /** @type {import('./$types').PageData} */
    import { page } from '$app/stores';
    export let data;
    console.log(data)

function link(space) {
        return `/${$page.params.space}/${space}`
}

    console.log($page)
$: error = data?.error
$: exists = data?.exists
</script>


{#if error && !exists}
    oopss
{/if}

{#if data.events}
Welcome to {$page.params.space} page
    {#each data.events as item}
        <div class="item">
            <p>
                <a href={link(item.slug)}>{item?.content?.body}</a>
            </p>
            <p>
                Replies: {item?.reply_count}
                Reactions: 
                {#each item?.reactions as reaction}
                    {reaction?.key}{reaction?.senders?.length}
                {/each}
            </p>
        </div>
    {/each}
{/if}

<style>
.item {
    padding-bottom: 1rem;
}
</style>
