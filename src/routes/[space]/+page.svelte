<script>
import { page } from '$app/stores';
import Event from '../../components/event/event.svelte'
export let data;
console.log(data)

function link(space) {
        return `/${$page.params.space}/p/${space}`
}

    console.log($page)
$: error = data?.error
$: exists = data?.exists
</script>


<section class="">
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
