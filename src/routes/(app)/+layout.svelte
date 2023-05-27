<script>
import Authentication from '$lib/auth/authentication.svelte'
import Switcher from '$lib/switcher/switcher.svelte'
import Sidebar from '$lib/sidebar/sidebar.svelte'
import { PUBLIC_BASE_URL, PUBLIC_APP_NAME } from '$env/static/public';
import { APIRequest } from '$lib/utils/request.js'
import { onMount, tick } from 'svelte'
import { page } from '$app/stores';
import { store } from '$lib/store/store.js'
import View from '$lib/view/view.svelte'
import Sync from '$lib/sync/sync.svelte'


let ready = true;

function viewReady() {
    ready = true;
}

let root;

let isMobile = false;

onMount(() => {
    checkHealth()
    let width = window.innerWidth;
    let sm = width < 768
    if(sm) {
        /*
        document.body.style.height = `${window.innerHeight}px`
        root.style.height = `${window.innerHeight}px`
        isMobile = true
        */
    const doc = document.documentElement
    doc.style.setProperty('--doc-height', `${window.innerHeight}px`)
    }
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

$: menuToggled = $store.menuToggled

function collapse() {
    store.toggleMenu()
}

</script>

<Sync />


{#if !down}



<div class="root" class:fixed={isMobile} bind:this={root}>

    <div class="container">

        <div class="inner-container grd" class:show={menuToggled}>
            <Switcher />
            <Sidebar />
        </div>

        <div class="content" class:slide-in={menuToggled}>
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
    position: absolute;
    height: 100%;
    width: 100%;
    display: grid;
    grid-template-columns: 100%;
    grid-template-rows: 100%;
    overflow: hidden;
}

.fixed {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
}

.container {
    place-self: stretch;
    width: 100%;
    height: 100%;
    justify-self: center;
    align-self: start;
    display: grid;
    grid-template-rows: auto;
    grid-template-columns: [sidebar] 304px [content] 1fr;
    overflow: hidden;
}

.inner-container {
    display: grid;
    grid-template-rows: auto;
    grid-template-columns: [switcher] 64px [sidebar] 240px;
    overflow: hidden;
}

.content {
    place-self: stretch;
    width: 100%;
    height: 100vh;
    display: grid;
    grid-template-rows: auto;
    grid-template-columns: auto;
    overflow: hidden;
    left: 0;
    background-color: var(--bg);
}

.slide-in {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 304px;
}



.theme-switcher {
    position: fixed;
    bottom: 0;
    right: 0;
    padding: 1rem;
    z-index: 10000;
}



@media screen and (max-width: 768px) {
    .container {
    }

    .inner-container {
    }
    .show {
        display: grid;
    }

}

</style>
