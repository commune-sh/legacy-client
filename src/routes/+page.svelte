<script>
import Config from '../../config.json'
import { APIRequest } from '../utils/request.js'
import { onMount, tick } from 'svelte'
import { page } from '$app/stores';
import { store } from '../store/store.js'
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



$: authenticated = $store?.authenticated && $store?.credentials != null

let fetchMore = () => {
    const events = data.events;
    const last = events[events.length - 1]?.origin_server_ts


    let opt = {
      url: `${Config.baseURL}/events?last=${last}`,
      method: 'GET',
    }

    console.log("ARE WE AUTHE", authenticated)
    if(authenticated) {
      opt.url =  `${Config.baseURL}/feed?last=${last}`
    }

    APIRequest(opt).then((res) => {
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

        <Header isStatic={true} name={"What's New"} />

    <section class="">
        {#each data.events as event}
                <Event event={event} showAlias={true} />
        {/each}
    </section>
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
.item {
    padding-bottom: 1rem;
}
</style>
