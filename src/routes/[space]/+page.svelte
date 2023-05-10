<script>
import Header from '../../components/header/header.svelte'
import { page } from '$app/stores';
import Event from '../../components/event/event.svelte'
export let data;
console.log("lol", data)

function link(space) {
        return `/${$page.params.space}/p/${space}`
}

$: error = data?.error
$: exists = data?.exists

</script>

{#if error && !exists}

<section class="error grd">
    <div class="grd-c">
        It looks like that page doesn't exist.
    </div>
</section>

{:else}


<section class="content">
    <Header state={data.state}/>

        {#if data.events}
            <section class="">
                {#each data.events as event}
                    <Event event={event} />
                {/each}
            </section>
        {:else}
            <div class="grd">
                <div class="grd-c">
                    It looks like this page doesn't have any posts yet.
                </div>
            </div>
        {/if}
</section>

{/if}

<style>
.content {
    display: grid;
    grid-template-columns: auto;
    grid-template-rows: 64px 1fr;
    border-right: 1px solid var(--border-1);
    border-left: 1px solid var(--border-1);
}
</style>
