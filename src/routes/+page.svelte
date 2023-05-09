<script>
import Config from '../../config.json'
import { APIRequest } from '../utils/request.js'
import { onMount } from 'svelte'
import { page } from '$app/stores';
import Event from '../components/event/event.svelte'
export let data;
console.log(data)

onMount(() => {
})

let active = false;

function link(item) {
        return `/${item.room_alias}/p/${item.slug}`
}

    console.log($page)
$: error = data?.error
$: exists = data?.exists
</script>


<section>
{#if error && !exists}
    oopss
{/if}

{#if data.events}
    {#each data.events as event}
        <Event event={event} />
    {/each}
{/if}

</section>

<style>
.item {
    padding-bottom: 1rem;
}
</style>
