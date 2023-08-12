<script>
import { onMount, createEventDispatcher } from 'svelte'
import { PUBLIC_APP_NAME, PUBLIC_MEDIA_URL } from '$env/static/public';
import { down, up } from '$lib/assets/icons.js'
import { page } from '$app/stores';
import { store } from '$lib/store/store.js'
import SkeletonSpan from '$lib/skeleton/skeleton-span.svelte'
import Popup from '$lib/popup/popup.svelte'
import SpaceMenu from './space-menu.svelte'
import tippy from 'tippy.js';

$: state = $store?.states[$page?.params?.space]
export let ready;

$: stateExists = !state?.error && state?.exists != false

$: name = state?.space?.name ? state?.space?.name : state?.space?.alias ?
    state?.space?.alias : null;

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

$: isProfile = state?.space?.is_profile



$: isDomain = $page.params.domain !== undefined && 
    $page.params.domain !== 'undefined' && 
    $page.params.domain?.length > 0

$: mediaURL = isDomain ? $store?.federated?.media_url : PUBLIC_MEDIA_URL


function findHeader(s) {

    let spaceHeader = s?.space?.header ?
    `${mediaURL}/${s?.space?.header}` : null

    if(isRoom && s?.children) {
        let ind = s?.children?.findIndex(r => r?.alias === $page?.params?.room)
        if(ind !== -1) {
            return s?.children[ind]?.header ?
            `${mediaURL}/${s?.children[ind]?.header}` : spaceHeader
        }
    } else {
        return spaceHeader
    }
}

function findAvatar(s) {

    let spaceAvatar = s?.space?.avatar ?
    `${mediaURL}/${s?.space?.avatar}` : null

    if(isRoom && s?.children) {
        let ind = s?.children?.findIndex(r => r?.alias === $page?.params?.room)
        if(ind !== -1) {
            return s?.children[ind]?.avatar ?
            `${mediaURL}/${s?.children[ind]?.avatar}` : spaceAvatar
        }
    } else {
        return spaceAvatar
    }
}

$: header = findHeader(state)
$: headerExists = header != null && header != undefined

$: avatar = findAvatar(state)
$: avatarExists = avatar != null && avatar != undefined

let el;

$: if(headerExists && header && el) {
    el.style.backgroundImage = `url(${header})`
} else if(el) {
    el.style.backgroundImage = `none`
}

let me;
let content;
let menu;
let active = false;

$: if(isSpace && me && content) {
    menu = tippy(me, {
        content: content,
        allowHTML: true,
        trigger: 'click',
        interactive: true,
        theme: 'notifications',
        placement: 'bottom-start',
        arrow: false,
        duration: 1,
        zIndex: 99999,
        onShown(i) {
            active = true
        },
        onHide(i) {
            active = false
        },
        onClickOutside(i) {
            active = false
        },
    });
}

function kill() {
    menu.hide()
}


</script>


{#if isSpace && stateExists}
<div class="menu" bind:this={content}>
    <SpaceMenu on:kill={kill}/>
</div>
{/if}

<div bind:this={el} class="sidebar-header" 
    class:header={headerExists}
    class:profile={isProfile && avatarExists}>
    <div class="con grd">

    {#if isSpace && stateExists}

            <div class="space fl"
                class:sp={authenticated && !headerExists}
                class:au={authenticated && headerExists}
                on:click|stopPropagation bind:this={me}
                class:acc={active && !headerExists}>

                <div class="name in fl-o" class:sh={headerExists}>
                    {#if !ready}
                        <div class="grd-c ml2">
                            <SkeletonSpan />
                        </div>
                    {:else}

                        <span class="nm" class:ish={headerExists}>{ name ? name : ``}</span>
                    {/if}
                </div>

                {#if authenticated}
                <div class="tools grd-c ico-s mh2">
                    {#if active}
                        {@html up}
                    {:else}
                        {@html down}
                    {/if}
                </div>
                {/if}

            </div>


            


    {:else}

        <div class="name in fl-o ml2">
            {#if isStaticRoute && staticRoute?.name != 'About'} 
                {staticRoute.name}
            {:else if isNotSpace}
                {PUBLIC_APP_NAME}
            {/if}
        </div>

    {/if}



    </div>

    {#if isProfile && avatar}
        <div class="profile-avatar"
            style="background-image: url({avatar})">
        </div>
    {/if}

</div>

<style>
.sidebar-header {
    display: grid;
    border-bottom: 1px solid var(--border-1);
    background-size: cover;
    background-position: center center;
    background-repeat: no-repeat;
    width: 100%;
    position: relative;
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
    font-weight: 500;
}

.header {
    height: 180px;
}

.profile {
    height: 180px;
}

.profile-avatar {
    height: 80px;
    width: 80px;
    position: absolute;
    left: 0.5rem;
    bottom: 0.5rem;
    border-radius: 14px;
    background-size: cover;
    background-position: center;
    box-shadow: 0px 4px 15px -3px rgba(0,0,0,0.4);
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

.acc {
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
    font-weight: 500;
}
.ish {
    background: var(--space-title);
}
</style>
