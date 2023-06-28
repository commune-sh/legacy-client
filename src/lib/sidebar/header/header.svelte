<script>
import { PUBLIC_APP_NAME, PUBLIC_MEDIA_URL } from '$env/static/public';
import { down, up } from '$lib/assets/icons.js'
import { page } from '$app/stores';
import { store } from '$lib/store/store.js'
import SkeletonSpan from '$lib/skeleton/skeleton-span.svelte'
import Popup from '$lib/popup/popup.svelte'
import SpaceMenu from './space-menu.svelte'

$: state = $store?.states[$page?.params?.space]
export let ready;

$: name = state?.space?.name ? state?.space?.name : state?.space?.alias;

$: isStaticRoute = $store.staticRoutes.some(r => r.path === $page?.url?.pathname);
$: staticRoute = $store.staticRoutes.find(r => r.path === $page?.url?.pathname);
$: isNotSpace = $page?.params?.space == undefined || $page?.params?.space == null

$: isSpace = $page?.params?.space !== undefined && $page?.params?.space !== null
$: isRoom = $page?.params?.room !== undefined && $page?.params?.room !== null

$: isIndex = $page?.url?.pathname === '/'

$: sender_id = $store.credentials?.matrix_user_id

$: isOwner = state?.owner === sender_id

$: authenticated = $store?.authenticated && 
    $store?.credentials != null
    $store?.credentials?.access_token?.length > 0


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


$: isDomain = $page.params.domain !== undefined && 
    $page.params.domain !== 'undefined' && 
    $page.params.domain?.length > 0

$: mediaURL = isDomain ? $store?.federated?.media_url : PUBLIC_MEDIA_URL


function findHeader(s) {

    let spaceHeader = s?.space?.header ?
    `${mediaURL}/${s?.space?.header}` : null

    if(isRoom) {
        let ind = s?.children?.findIndex(r => r?.alias === $page?.params?.room)
        if(ind !== -1) {
            return s?.children[ind]?.header ?
            `${mediaURL}/${s?.children[ind]?.header}` : spaceHeader
        }
    } else {
        return spaceHeader
    }
}

$: header = findHeader(state)

$: headerExists = header != null && header != undefined

let el;

$: if(headerExists && header && el) {
    el.style.backgroundImage = `url(${header})`
} else if(el) {
    el.style.backgroundImage = `none`
}

</script>

<div bind:this={el} class="sidebar-header" class:header={headerExists}>
    <div class="con grd">

    {#if isSpace}

        <Popup
        bind:this={popup}
        trigger={"click"}
        offset={[8, 8]}
        on:killed={killed}
        shadow={`0px 9px 15px -7px rgba(0,0,0,0.2)`}
        mask={true}
        disabled={!authenticated}
        placement={"bottom-start"}>

            <div class="space fl"
                class:sp={authenticated && !headerExists}
                class:au={authenticated && headerExists}
                slot="reference"
                class:active={menuActive}>

                <div class="name in fl-o" class:sh={headerExists}>
                    {#if !ready}
                        <div class="grd-c ml2">
                            <SkeletonSpan />
                        </div>
                    {:else}

                        <span class="nm" class:ish={headerExists}><b>{name}</b></span>
                    {/if}
                </div>

                {#if authenticated}
                <div class="tools grd-c ico-s mh2">
                    {#if menuActive}
                        {@html up}
                    {:else}
                        {@html down}
                    {/if}
                </div>
                {/if}

            </div>


            


            <div class="component" slot="content">
                <SpaceMenu on:kill={killPopup}/>
            </div>

        </Popup>

    {:else}

        <div class="name in fl-o ml2">
            {#if isStaticRoute}
                <b>{staticRoute.name}</b>
            {:else if isNotSpace}
                <b>{PUBLIC_APP_NAME}</b>
            {/if}
        </div>

    {/if}



    </div>

</div>

<style>
.sidebar-header {
    display: grid;
    border-bottom: 1px solid var(--border-1);
    background-size: cover;
    background-position: center center;
    background-repeat: no-repeat;
    overflow: hidden;
    width: 100%;
}

.con {
    height: 47px;
    overflow: hidden;
    width: 100%;
}

.name {
    overflow: hidden;
    width: 100%;
    line-height: normal;
}

.header {
    height: 180px;
}

.space {
    overflow: hidden;
    width: 100%;
}

.au {
    cursor: pointer;
}

.au:hover {
}

.sp {
    cursor: pointer;
}

.sp:hover {
    background: var(--hover-focus);
}

.space:hover .ico-s {
    opacity: 1;
}

.active {
}

.in {
    justify-self: start;
    align-self: center;
}
.sh {
    text-shadow: 1px 1px var(--bg);
}
.nm {
    padding: 0.25rem 0.5rem;
    margin-left: 0.25rem;
    background: transparent;
    display: inline-block;
    border-radius: 500px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: normal;
}
.ish {
    background: var(--space-title);
}
</style>
