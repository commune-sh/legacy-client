<script>
import { PUBLIC_APP_NAME } from '$env/static/public';
import { down, up } from '$lib/assets/icons.js'
import { page } from '$app/stores';
import { store } from '$lib/store/store.js'
import SkeletonSpan from '$lib/skeleton/skeleton-span.svelte'
import Popup from '$lib/popup/popup.svelte'
import SpaceMenu from './space-menu.svelte'

$: state = $store?.states[$page?.params?.space]
export let ready;

$: name = state?.space?.name ? state.space.name : ``;

$: isStaticRoute = $store.staticRoutes.some(r => r.path === $page?.url?.pathname);
$: staticRoute = $store.staticRoutes.find(r => r.path === $page?.url?.pathname);
$: isNotSpace = $page?.params?.space == undefined || $page?.params?.space == null

$: isSpace = $page?.params?.space !== undefined && $page?.params?.space !== null

$: isIndex = $page?.url?.pathname === '/'

$: sender_id = $store.credentials?.matrix_user_id

$: isOwner = state?.owner === sender_id

let menuActive =  false;

function toggleMenu() {
    menuActive = !menuActive
}

let killed = () => {
    menuActive = false
}

let killPopup = () => {
    popup.kill()
}

let popup;
</script>

<div class="sidebar-header">

    {#if isSpace}
    <Popup
    bind:this={popup}
    trigger={"click"}
    offset={[8, 8]}
    shadow={`box-shadow: 0px 6px 15px -3px rgba(0,0,0,0.1);`}
    on:killed={killed}
    placement={"top-start"}>

        <div class="space fl pa2"
            slot="reference"
            class:active={menuActive}
            on:click={toggleMenu}>
            <div class="name in fl-o">
                {#if !ready}
                    <SkeletonSpan />
                {:else}

                        <b>{name}</b>
                {/if}
            </div>
            <div class="tools grd-c ico-s">
                {#if menuActive}
                    {@html up}
                {:else}
                    {@html down}
                {/if}
            </div>
        </div>


        


        <div class="component" slot="content">
            <SpaceMenu on:kill={killPopup}/>
        </div>

    </Popup>
    {:else}

        <div class="name in fl-o">
            {#if isStaticRoute}
                <b>{staticRoute.name}</b>
            {:else if isNotSpace}
                {PUBLIC_APP_NAME}
            {/if}
        </div>

    {/if}



</div>
<style>
.sidebar-header {
    display: grid;
    border-bottom: 1px solid var(--border-1);
    height: 48px;
    transition: 0.1s;
}

.space {
    cursor: pointer;
}

.space:hover {
    background: var(--hover-focus);
}

.space:hover .ico-s {
    opacity: 1;
}

.active {
    background: var(--hover-focus);
}

.in {
    justify-self: start;
    align-self: center;
}
</style>
