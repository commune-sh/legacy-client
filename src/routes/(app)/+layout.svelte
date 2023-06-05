<script>
import Authentication from '$lib/auth/authentication.svelte'
import Switcher from '$lib/switcher/switcher.svelte'
import Sidebar from '$lib/sidebar/sidebar.svelte'
import { PUBLIC_BASE_URL, PUBLIC_APP_NAME, PUBLIC_INDEX } from '$env/static/public';
import { APIRequest } from '$lib/utils/request.js'
import { onMount, tick } from 'svelte'
import { page } from '$app/stores';
import { store } from '$lib/store/store.js'
import View from '$lib/view/view.svelte'
import Sync from '$lib/sync/sync.svelte'
import Health from '$lib/sync/health.svelte'
import Down from '$lib/errors/down.svelte'

let isIndex = $page?.route?.id === `/(app)`

let showIndex = PUBLIC_INDEX === 'true'
console.log("show index?", showIndex, isIndex)


let ready = false;

function viewReady() {
    ready = true;
}

let root;


onMount(() => {
})


$: down = $store.down



$: menuToggled = $store.menuToggled

function collapse() {
    store.toggleMenu()
}

$: isStaticRoute = $store.staticRoutes.some(r => r.path === $page?.url?.pathname);
$: staticRoute = $store.staticRoutes.find(r => r.path === $page?.url?.pathname);


$: if(isStaticRoute) {
    ready = true
}

function switchToIndex() {
    showIndex = true
}

</script>

<Sync />
<Health />


{#if (!down && isIndex && showIndex) || (!down && !isIndex)}



<div class="root" bind:this={root}>

    <div class="container">

        <div class="inner-container grd" class:show={menuToggled}>
            <Switcher />
            <Sidebar />
        </div>

        <div class="content" class:slide-in={menuToggled}>
            {#if isStaticRoute}
                <slot></slot>
            {:else}
                <View on:ready={viewReady} />
            {/if}
        </div>

    </div>


</div>




<Authentication />


{/if}


{#if (isIndex && showIndex) || (!isIndex)}
<section class="loading" class:hide={ready || down}>
    <section class="grd-c">
        <div class="loader"></div>
    </section>
</section>
{/if}


{#if down}
    <Down />
{/if}

{#if isIndex && !showIndex}
    <button on:click={switchToIndex}>Show Index</button>
{/if}

<style>

.loading {
    z-index: 3000;
    top: 0;
    bottom: 0;
    right: 0;
    left: 0;
    position: fixed;
    width: 100%;
    height: 100%;
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
    height: 100%;
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
    left: 0;
    padding: 1rem;
    z-index: 10000;
}



@media screen and (max-width: 768px) {
    .container {
        grid-template-columns: auto;
    }

    .inner-container {
        display: none;
    }
    .show {
        display: grid;
    }

}

</style>
