<script>
import '/static/css/main.css'
import Authentication from '$lib/auth/authentication.svelte'
import Switcher from '$lib/switcher/switcher.svelte'
import Sidebar from '$lib/sidebar/sidebar.svelte'
import { PUBLIC_META_TITLE, PUBLIC_MEDIA_URL, PUBLIC_FAVICON, PUBLIC_META_IMAGE, PUBLIC_INDEX, PUBLIC_META_DESCRIPTION } from '$env/static/public';
import { onMount, tick } from 'svelte'
import { page } from '$app/stores';
import { store } from '$lib/store/store.js'
import Sync from '$lib/sync/sync.svelte'
import Health from '$lib/sync/health.svelte'
import Down from '$lib/errors/down.svelte'
import CreateSpace from '$lib/space/create-space.svelte'
import Modal from '$lib/modal/modal.svelte'
import Alert from '$lib/alert/alert.svelte'
import About from '$lib/about/about.svelte'
import DiscoverSpaces from '$lib/discover/discover.svelte'
import Gallery from '$lib/gallery/gallery.svelte'

export let data;

$: if(data?.state?.space) {
    store.addSpaceState($page.params?.space, data.state)
    store.stateReady()
}

$: isIndex = $page?.url.pathname === '/'
$: isSpace = $page?.params?.space !== undefined 
$: isPost = $page?.params?.post !== undefined

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


onMount(() => {
})

function setupSwipeGestures() {
}

let initialX = null;
let initialY = null;

function startTouch(e) {
    initialX = e.touches[0].clientX;
    initialY = e.touches[0].clientY;
};
 
function moveTouch(e) {
    if (initialX === null) {
        return;
    }
    if (initialY === null) {
        return;
    }
    let currentX = e.touches[0].clientX;
    let currentY = e.touches[0].clientY;

    let diffX = initialX - currentX;
    let diffY = initialY - currentY;
 
    if (Math.abs(diffX) > Math.abs(diffY)) {
        if (diffX > 0) {
            if(menuToggled) {
                collapse()
            }
        } else {
            if(!menuToggled) {
                store.toggleMenu()
            }
        }  
    }
 
    initialX = null;
    initialY = null;

    e.preventDefault();
};

$: spaceTitle = `${data?.space?.alias} - ${PUBLIC_META_TITLE}`

$: fb = data?.event?.content?.body ? `${data?.event?.content?.body.slice(0, 1000)}...` : ''

$: pb = data?.event?.content?.body?.length > 50 ? `${data?.event?.content?.body.slice(0, 50)}...` : ''

$: pt = data?.event?.content?.title ? data?.event?.content?.title :
    pb ? pb : ''

$: postTitle = pt ? `${pt} - ${PUBLIC_META_TITLE}` : PUBLIC_META_TITLE

$: title = isIndex ? PUBLIC_META_TITLE : isPost ? postTitle : isSpace ?
    spaceTitle : PUBLIC_META_TITLE

$: hasImage = data?.event?.content?.attachments?.length > 0 &&
    data?.event?.content?.attachments[0]?.type?.startsWith('image')

$: imageKey = hasImage ? data?.event?.content?.attachments[0]?.key : ''

$: imageSRC = `${PUBLIC_MEDIA_URL}/${imageKey}`

$: sender = data?.event?.sender?.display_name ?
data?.event?.sender?.display_name : data?.event?.sender?.username


</script>

<svelte:head>

    <title>{title}</title>
    {#if isPost && hasImage && imageSRC}
        <meta property="og:image" content={imageSRC} />
    {/if}
    {#if isPost && sender}
        <meta name="author" content={sender} />
    {/if}
    {#if !isSpace}
        <meta property="og:image" content={PUBLIC_META_IMAGE || PUBLIC_FAVICON} />
    {/if}
    {#if isPost && data?.event}
        <meta name="description" content={fb}>
    {/if}
    {#if isIndex}
        <meta name="description" content={PUBLIC_META_DESCRIPTION}>
    {/if}
</svelte:head>





<Sync />
<Health />

<Gallery />

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
        </div>

        <div class="content" class:slide-in={menuToggled}>
            {#if isStaticRoute}
                <slot></slot>
            {:else}
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
