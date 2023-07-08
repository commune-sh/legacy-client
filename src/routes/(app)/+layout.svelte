<script>
import '/static/css/main.css'
import Authentication from '$lib/auth/authentication.svelte'
import Switcher from '$lib/switcher/switcher.svelte'
import Sidebar from '$lib/sidebar/sidebar.svelte'
import { PUBLIC_API_URL, PUBLIC_APP_NAME, PUBLIC_INDEX, PUBLIC_META_DESCRIPTION } from '$env/static/public';
import { APIRequest } from '$lib/utils/request.js'
import { onMount, tick } from 'svelte'
import { page } from '$app/stores';
import { store } from '$lib/store/store.js'
import View from '$lib/view/view.svelte'
import Sync from '$lib/sync/sync.svelte'
import Health from '$lib/sync/health.svelte'
import Down from '$lib/errors/down.svelte'
import CreateSpace from '$lib/space/create-space.svelte'
import Modal from '$lib/modal/modal.svelte'
import Alert from '$lib/alert/alert.svelte'
import About from '$lib/about/about.svelte'
import DiscoverSpaces from '$lib/discover/discover.svelte'

$: isIndex = $page?.url.pathname === '/'

$: if(isIndex) {
    document.title = `${PUBLIC_APP_NAME}`
}

let showIndex = PUBLIC_INDEX === 'true'


let ready = true

function viewReady() {
    ready = true;
}

let root;


$: down = $store.down



$: menuToggled = $store.menuToggled

function collapse() {
    store.toggleMenu()
}

$: isStaticRoute = $store.staticRoutes.filter(r =>
$page.url.pathname.startsWith(r.path))?.length > 0



$: if(isStaticRoute) {
    ready = true
}

function switchToIndex() {
    showIndex = true
}

$: authenticated = $store?.authenticated && 
    $store?.credentials != null
    $store?.credentials?.access_token?.length > 0

let EmojiPicker;
let SpaceSettings;
let RoomSettings;
let VerificationAlert;
let Verification;
let UserSettings;

/*
$: if(authenticated && $store.loadEmojiPicker) {
    import('$lib/emoji/emoji-picker.svelte').then(m => {
        EmojiPicker = m.default
    })
}
*/

$: if(authenticated) {

    import('$lib/emoji/emoji-picker.svelte').then(m => {
        EmojiPicker = m.default
    })

    import('$lib/space/settings/settings.svelte').then(m => {
        SpaceSettings = m.default
    })
    import('$lib/room/settings/settings.svelte').then(m => {
        RoomSettings = m.default
    })
    import('$lib/verification/alert.svelte').then(m => {
        VerificationAlert = m.default
    })
    import('$lib/verification/verification.svelte').then(m => {
        Verification = m.default
    })
    import('$lib/user/settings/settings.svelte').then(m => {
        UserSettings = m.default
    })
}

</script>
<svelte:head>
{#if isIndex}
    <meta name="description" content={PUBLIC_META_DESCRIPTION}>
{/if}
</svelte:head>

{#if authenticated && EmojiPicker}
    <EmojiPicker />
{/if}

{#if authenticated && SpaceSettings}
    <SpaceSettings />
{/if}

{#if authenticated && RoomSettings}
    <RoomSettings />
{/if}

{#if authenticated && VerificationAlert}
    <VerificationAlert />
{/if}

{#if authenticated && UserSettings}
    <UserSettings />
{/if}


{#if authenticated && Verification}
    <Verification />
{/if}



<Sync />
<Health />

<Modal />
<Alert />
<About />
<DiscoverSpaces />

{#if (!down && isIndex && showIndex) || (!down && !isIndex)}


{#if menuToggled}
<div class="maskcontent" on:click={collapse}>
</div>
{/if}

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

    <CreateSpace />



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
    grid-template-columns: [sidebar] 298px [content] 1fr;
    overflow: hidden;
}

.inner-container {
    display: grid;
    grid-template-rows: auto;
    grid-template-columns: [switcher] 58px [sidebar] 240px;
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
    left: 298px;
}


.maskcontent {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 298px;
    height: 100%;
    z-index: 10000;
    width: 100vw;
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
