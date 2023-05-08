<script>
import Config from '../../config.json'
import { APIRequest } from '../utils/request.js'
import { onMount } from 'svelte'
import { page } from '$app/stores';
export let data;
console.log(data)

onMount(() => {
})

let active = false;

function link(item) {
        return `/${item.room_alias}/${item.slug}`
}

    console.log($page)
$: error = data?.error
$: exists = data?.exists
</script>


{#if error && !exists}
    oopss
{/if}

{#if data.events}

    {#each data.events as item}
        <div class="item">
            <p>
                <a href={link(item)}>{item?.content?.body}</a>
                <br/>
            </p>
            <p>
                Replies: {item?.reply_count}
                Reactions: {item?.reactions?.length}
            </p>
        </div>
    {/each}
{/if}

{active}

<style>
.item {
    padding-bottom: 1rem;
}
</style>
