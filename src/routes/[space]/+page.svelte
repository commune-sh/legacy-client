<script>
import Config from '../../../config.json'
import { APIRequest } from '../../utils/request.js'
import { onMount, tick } from 'svelte'
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

let scrollHeight;
let obs;

onMount(() => {
    scrollHeight = document.documentElement.scrollHeight;
    handleScroll();
})

function handleScroll() {
    let options = {
        rootMargin: `${scrollHeight/2}px`
    };

    let callback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                fetchMore()
            }
        });
    };

    let observer = new IntersectionObserver(callback, options);
    observer.observe(obs);
}

let fetchMore = () => {
    const events = data.events;
    const last = events[events.length - 1]?.origin_server_ts
    APIRequest({
        url: `${Config.baseURL}/${$page.params.space}?last=${last}`,
      method: 'GET',
    }).then((res) => {
            console.log("got data", res)
        if(res && res?.events?.length > 0) {
            data.events = [...data.events, ...res.events];
        }
    });
}

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
<section class="" bind:this={obs}></section>

{/if}

<style>
.content {
    display: grid;
    grid-template-columns: auto;
    grid-template-rows: 50px 1fr;
    border-right: 1px solid var(--border-1);
    border-left: 1px solid var(--border-1);
}
</style>
