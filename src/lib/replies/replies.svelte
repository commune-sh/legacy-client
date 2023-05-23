<script>
import Event from '$lib/event/event.svelte'
import Header from '$lib/header/post-header.svelte'
import { onMount } from 'svelte';
import { APIRequest } from '../../utils/request.js'
import { PUBLIC_BASE_URL } from '$env/static/public';
import { page } from '$app/stores';

let ready = false;

function loadEvents() {
    APIRequest({
      url: `${PUBLIC_BASE_URL}/event/${$page.params.post}`,
      method: 'GET',
    })
    .then(resp => {
        if(resp && resp?.event) {
            //
            data = resp
            lastPost = $page.params.post
            ready = true
        }
        if(!resp) {
            down = true
        }
    })

}

let data = null;
let down = false;

$: replies = data?.replies

let lastPost = null;

onMount(() => {
    if($page.params.post) {
        loadEvents()
    }
})

$: if(lastPost != null && $page.params.post != lastPost) {
    ready = false
    loadEvents()
}

</script>

<section class="content">
    <Header />

    {#if ready}
    <section class="events">
            <Event isPost={true} event={data.event} />

            <div class="sep">
            </div>


        {#if replies}
            {#each replies as reply}
                <Event isReply={true} event={reply} />
            {/each}
        {:else}
                No replies
        {/if}

    </section>
    {:else}
        <section class="grd">
            <section class="grd-c">
                <div class="loader"></div>
            </section>
        </section>
    {/if}
</section>


<style>
.content {
    display: grid;
    grid-template-columns: auto;
    grid-template-rows: 48px auto;
    overflow-y: hidden;
}
.events {
    overflow-y: auto;
}
</style>

