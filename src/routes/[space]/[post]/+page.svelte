<script>
    import { onMount } from 'svelte';

/** @type {import('./$types').PageData} */
import { page } from '$app/stores';
export let data;

let replies;

onMount(() => {
    console.log(data.event)
})

</script>

{#if data}
    {data.event.content.body}
    <br/>
    <br/>

    {#each data?.event?.reactions as reaction}
        {reaction?.key}{reaction?.senders?.length}
    {/each}
    Replies: {data.event.reply_count}

{#if replies}
    {#each data.replies as item}
        <div class="item">
            <p>
                {item?.content?.body}
                {item?.origin_server_ts}
                {item?.slug}
            </p>
        </div>
    {/each}
{/if}

    <br/>
    <br/>
    <br/>

    <a href="/{$page.params.space}">Go Back</a>
{/if}
