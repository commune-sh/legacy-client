<script>
import Event from '../../../../components/event/event.svelte'
import { onMount } from 'svelte';

import { page } from '$app/stores';


export let data;

$: replies = data?.replies

$: error = data?.error
$: exists = data?.exists

onMount(() => {
    console.log(data)
})

function goBack() {
    history.back()
}

</script>

{#if error && !exists}

<section class="error grd">
    <div class="grd-c">
        It looks like that post doesn't exist.
    </div>
</section>

{:else}

<section class="content">


    <section>
        <Event event={data.event} />

            <div class="sep">
            </div>


        {#if replies}
            {#each replies as reply}
                    <Event isReply={true} event={reply} />
            {/each}
        {/if}
    <a href="" on:click={goBack}>Go Back</a>

    </section>
</section>

{/if}

<style>
.content {
    display: grid;
    grid-template-columns: auto;
    grid-template-rows: auto;
    border-right: 1px solid var(--border-1);
    border-left: 1px solid var(--border-1);
}
</style>
