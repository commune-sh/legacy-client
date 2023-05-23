<script>
import Authentication from '$lib/auth/authentication.svelte'
import Switcher from '$lib/switcher/switcher.svelte'
import Sidebar from '$lib/sidebar/sidebar.svelte'
import { PUBLIC_BASE_URL, PUBLIC_APP_NAME } from '$env/static/public';
import { APIRequest } from '../utils/request.js'
import { onMount, tick } from 'svelte'
import { page } from '$app/stores';
import { store } from '../store/store.js'
import View from '$lib/view/view.svelte'
import Sync from '$lib/sync/sync.svelte'


let ready = false;

function viewReady() {
    ready = true;
}

onMount(() => {
    checkHealth()
})

function checkHealth() {

    let url = `${PUBLIC_BASE_URL}/health_check`

    let opt = {
      url: url,
      method: 'GET',
    }

    APIRequest(opt)
    .then(resp => {
        if(resp) {
            if(resp?.healthy) {
                down = false
            }
        }
        if(!resp) {
            down = true
        }
    })
}


let down = false;


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

</script>

<Sync />


{#if !down}

<div class="root">
    <div class="container">

    <div class="switcher-container grd">
        <Switcher />
    </div>

    <div class="sidebar-container grd">
        <Sidebar />
    </div>

    <div class="content">

                <View on:ready={viewReady} />

    </div>

    </div>
</div>



        <Authentication />

<div class="theme-switcher">
<button on:click={toggleTheme}>Toggle</button>
</div>

{/if}


<section class="loading" class:hide={ready || down}>
    <section class="grd-c">
        <div class="loader"></div>
    </section>
</section>


{#if down}
<section class="root">
    <section class="grd-c">
        {PUBLIC_APP_NAME} is down.
    </section>
</section>
{/if}

<style>

.loading {
    z-index: 3000;
    top: 0;
    bottom: 0;
    right: 0;
    left: 0;
    position: fixed;
    width: 100vw;
    height: 100vh;
    background-color: var(--bg);
    display: grid;
    grid-template-columns: 100%;
    grid-template-rows: 100%;
}

.hide {
    display: none;
}

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
