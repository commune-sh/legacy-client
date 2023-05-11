<script>
import Config from '../../config.json'
import { APIRequest } from '../utils/request.js'
import { onMount, tick } from 'svelte'
import { page } from '$app/stores';
import Event from '../components/event/event.svelte'
import Header from '../components/header/header.svelte'
export let data;
console.log(data)


let scrollHeight;
let obs;

onMount(() => {
    scrollHeight = document.documentElement.scrollHeight;
    handleScroll();
})

let observer;
let options;
let callback;

function handleScroll() {
    options = {
        rootMargin: `${scrollHeight/2}px`
    };

    callback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                fetchMore()
            }
        });
    };

    observer = new IntersectionObserver(callback, options);
    observer.observe(obs);
}

let fetchMore = () => {
    const events = data.events;
    const last = events[events.length - 1]?.origin_server_ts
    APIRequest({
      url: `${Config.baseURL}/events?last=${last}`,
      method: 'GET',
    }).then((res) => {
        if(res && res?.events?.length > 0) {
            data.events = [...data.events, ...res.events];
        }
    });
}

let active = false;

function link(item) {
        return `/${item.room_alias}/p/${item.slug}`
}

$: error = data?.error
$: exists = data?.exists

</script>


{#if error && !exists}
    <div class="grd">
        <div class="grd-c">
            Something is wrong.
        </div>
    </div>
{/if}


{#if data?.events}
<section class="content">

        <Header isStatic={true} name={"Public Feed"} />

    <section class="">
        {#each data.events as event}
            <Event event={event} />
        {/each}
    </section>
</section>
<section class="" bind:this={obs}></section>
{/if}

<style>
.content {
    display: grid;
    grid-template-columns: auto;
    grid-template-rows: 64px 1fr;
    border-right: 1px solid var(--border-1);
    border-left: 1px solid var(--border-1);
}
.item {
    padding-bottom: 1rem;
}
</style>
