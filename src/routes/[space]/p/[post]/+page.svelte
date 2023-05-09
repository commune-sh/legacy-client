<script>
import Config from '../../../../../config.json'
import { APIRequest } from '../../../../utils/request.js'
import Event from '../../../../components/event/event.svelte'
import { onMount } from 'svelte';

import { page } from '$app/stores';
export let data;

let replies;

onMount(() => {
    console.log(data)
    if(data?.event?.reply_count > 0) {
        APIRequest({
            url: `${Config.baseURL}/event/${data.event.event_id}/replies`,
            method: 'GET',
        })
        .then(resp => {
            console.log('Response:', resp);
            replies = resp?.replies;
                replies = replies
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }
})

function goBack() {
    history.back()
}

</script>

<section class="">
{#if data}
    <Event event={data.event} />
{/if}


{#if replies}
    {#each replies as reply}
            <Event reply={true} event={reply} />
    {/each}
{/if}
    <a href="" on:click={goBack}>Go Back</a>

</section>
