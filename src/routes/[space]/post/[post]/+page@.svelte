<script>
import Event from '../../../../components/event/event.svelte'
import Header from '../../../../components/header/replies-header.svelte'
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
        <Header />


    <section class="events">
            <Event isPost={true} event={data.event} />

            <div class="sep">
            </div>


        {#if replies}
            {#each replies as reply}
                    <Event isReply={true} event={reply} />
            {/each}
        {/if}

    </section>
</section>

{/if}

<style>
.content {
    display: grid;
    grid-template-columns: auto;
    grid-template-rows: 48px auto;
    overflow-y: hidden;
}
.events {
    overflow-y: scroll;
}
</style>
