<script>
import Authentication from '../components/auth/authentication.svelte'
import Switcher from '../components/switcher/switcher.svelte'
import Sidebar from '../components/sidebar/sidebar.svelte'
import Config from '../../config.json'
import { APIRequest } from '../utils/request.js'
import { onMount, tick } from 'svelte'
import { page } from '$app/stores';
import { store } from '../store/store.js'
import Event from '../components/event/event.svelte'
import Header from '../components/header/header.svelte'

export let data;
$: if(data) {
    console.log(data)
}

function toggleTheme() {
    const theme = localStorage.getItem('theme')
    if(theme === 'light') {
        localStorage.removeItem('theme')
        document.documentElement.setAttribute('class', 'dark')
    } else {
        localStorage.setItem('theme', 'light')
        document.documentElement.setAttribute('class', 'light')
    }
}


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

let ready = false;

onMount(() => {
    if(!data.error && !data.down) {
        scrollHeight = scrollable?.scrollHeight;
        handleScroll();
    }
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

$: isSpace = $page.params.space !== undefined && $page.params.space !== null &&
    $page.params.space !== ''

$: isRoom = $page.params.room !== undefined && $page.params.room !== null &&
    $page.params.room !== ''

let fetchMore = () => {
    let events = data?.events;
    const last = events?.[events?.length - 1]?.origin_server_ts

    let url = `${Config.baseURL}/events?last=${last}`
    if(isSpace) {
        url = `${Config.baseURL}/${$page.params.space}/events?last=${last}`
    }

    if(isSpace && isRoom) {
        url = `${Config.baseURL}/${$page.params.space}/${$page.params.room}/events?last=${last}`
    }

    APIRequest({
        url: url,
      method: 'GET',
    }).then((res) => {
        if(res && res?.events?.length > 0) {
            data.events = [...data.events, ...res.events];
        }
    });
}
</script>


{#if data?.down}
<div class="root">
    <section class="grd">
        <section class="grd-c">
            Shpong is down right now.
        </section>
    </section>
</div>
{:else}




<div class="root">
    <div class="container">

    <div class="switcher-container grd">
        <Switcher />
    </div>

    <div class="sidebar-container grd">
        <Sidebar data={data}/>
    </div>

    <div class="content">


    <section class="space-container" class:post={isPost}>

        <div class="inner-area" class:ina={isPost}>

            <Header data={data}/>

            <div class="inner-content" bind:this={scrollable}>

                {#if data.events}
                    <section class="events">
                        {#each data.events as event}
                            <Event event={event} />
                        {/each}
                    </section>
                {:else}
                    <div class="grd">
                        <div class="grd-c">
                            This space does not have any posts yet.
                        </div>
                    </div>
                {/if}

                {#if data?.error && !data?.exists}
                    <section class="grd">
                        <section class="grd-c">
                            This space does not exist.
                        </section>
                    </section>
                {/if}

                <div class="obs" bind:this={obs}></div>

            </div>


        </div>

        <slot></slot>

    </section>


    </div>

    </div>
</div>




<div class="theme-switcher">
        <Authentication />
<button on:click={toggleTheme}>Toggle</button>
</div>

{/if}

<style>

.root {
    height: 100vh;
    display: grid;
    grid-template-columns: 100%;
    grid-template-rows: 100%;
}

.container {
    place-self: stretch;
    width: 100%;
    height: 100%;
    justify-self: center;
    align-self: start;
    display: grid;
    grid-template-rows: auto;
    grid-template-columns: [switcher] 64px [sidebar] 240px [content] 1fr;
}

.content {
    place-self: stretch;
    width: 100%;
    height: 100vh;
    display: grid;
    grid-template-rows: auto;
    grid-template-columns: auto;
    overflow: hidden;
}



.theme-switcher {
    position: fixed;
    bottom: 0;
    right: 0;
    padding: 1rem;
    z-index: 1000;
}
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
}

.ina {
    border-right: 1px solid var(--border-1);
}



@media screen and (max-width: 1280px) {
    .container {
        grid-template-columns: [switcher] 54px [content] 1fr;
    }
    .sidebar-container {
            display: none;
    }
}
@media screen and (max-width: 768px) {
    .container {
        grid-template-columns: auto;
    }
    .switcher-container {
        display: none;
    }
    .post {
        grid-template-columns: auto;
    }
    .ina {
        display: none;
    }
}

</style>
