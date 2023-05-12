<script>
import Config from '../../../config.json'
import Editor from '../../components/editor/editor.svelte'
import { APIRequest } from '../../utils/request.js'
import { onMount, tick } from 'svelte'
import Header from '../../components/header/header.svelte'
import { page } from '$app/stores';
import Event from '../../components/event/event.svelte'

export let data;

function link(space) {
        return `/${$page.params.space}/p/${space}`
}

$: error = data?.error
$: exists = data?.exists

$: isPost = $page.params.post !== undefined && $page.params.post !== null &&
    $page.params.post !== ''

let scrollHeight;
let scrollable
let obs;

onMount(() => {
    scrollHeight = scrollable.scrollHeight;
    console.log(scrollHeight/2)
    handleScroll();
})

function handleScroll() {
    let options = {
        root: scrollable,
        rootMargin: `${scrollHeight/2}px`,
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

let editing = false;

function newPost() {
}

</script>

{#if error && !exists}

<section class="error grd">
    <div class="grd-c">
        It looks like that page doesn't exist.
    </div>
</section>

{:else}



<section class="space-container" class:post={isPost}>

    <div class="inner-area">

        <Header/>

        <div class="inner-content" bind:this={scrollable}>

            <Editor />
            {#if data.events}
                <section class="events">
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

            <div class="obs" bind:this={obs}>loooool</div>

        </div>


    </div>

    <slot></slot>

</section>



{/if}

<style>

.space-container {
    display: grid;
    grid-template-columns: auto;
    grid-template-columns: auto;
    overflow: hidden;
}

.inner-area {
    display: grid;
    grid-template-columns: auto;
    grid-template-rows: 48px auto;
    overflow: hidden;
}

.inner-content {
    overflow-y: auto;
    display: grid;
}

.post {
    grid-template-columns: 50% 50%;
}

.events {
    place-self: stretch;
    width: 100%;
    height: 100%;
    justify-self: center;
    align-self: start;
    display: grid;
}
</style>
