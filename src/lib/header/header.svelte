<script>
import { PUBLIC_API_URL, PUBLIC_APP_NAME } from '$env/static/public';
import { joinSpace, joinRoom } from '$lib/utils/request.js'
import { validAge } from '$lib/utils/time.js'
import { onMount, createEventDispatcher } from 'svelte'
import { page } from '$app/stores';
import { goto } from '$app/navigation';
import { store } from '$lib/store/store.js'
import { menu, addLine, hash, users} from '$lib/assets/icons.js'
import Search from '$lib/search/search.svelte'
import BoardList from './board-list.svelte'
import DefaultIndexList from './default-index-list.svelte'
import IndexList from './index-list.svelte'
import BoardInfo from './board-info.svelte'
import { newMD } from '$lib/composer/md/md.js'
import ToggleView from './toggle-view/toggle-view.svelte'


let md = newMD()
md.disable("image")

$: authenticated = $store?.authenticated && 
    $store?.credentials != null
    $store?.credentials?.access_token?.length > 0

const dispatch = createEventDispatcher()


$: state = $store?.states[$page?.params?.space]

$: ready = state != undefined

export let type = 'space';

export let isBoard = false;

$: exists = state != undefined && state?.room_id != undefined


export let editing = false;


$: space = $page.params.space

export let isStatic = false;
export let name = '';

function goToSpace() {
    goto(`/${$page.params.space}`)
}

function newPost() {
    if(!authenticated) {
        store.startAuthenticating("login")
        return
    }

    if(requiresVerification && !senderVerified && !isOwner) {
        $store.showVerificationAlert = true
        return
    }
    dispatch('newPost', room_id)
}


$: isIndex = $page.url.pathname == '/'
$: indexPost = !isSpace && isPost

$: authDone = $store.verifiedSession

$: isAll = $page?.url?.pathname == `/all`

$: indexText = isAll ? `All posts` : authenticated ? `Your feed` : `What's new`


function sortItems(state) {
    if(!state && !state?.room_id) {
        return []
    }
    let items = [
        {
            path: undefined,
            general: true,
            name: state?.space?.is_profile ? `${state?.space?.alias}'s Space`:`general`,
            alias: ``,
            fullpath: `/${$page.params.space}`,
            room_id: state?.room_id,
            topic: state?.space?.topic,
            topics: JSON.parse(state?.space?.topics),
            restrictions: state?.space?.restrictions,
            avatar: state?.space?.avatar,
            is_profile: state?.space?.is_profile,
            type: state?.space?.type,
            view: state?.space?.type,
            pinned_events: state.space?.pinned_events != undefined ? JSON.parse(state.space?.pinned_events) : null
        }
    ]
    if(state?.children?.length > 0) {
        state?.children.forEach(child => {
            items.push({
                path: child?.alias,
                name: child?.name,
                alias: child?.alias,
                fullpath: `/${$page.params.space}/${child?.alias}`,
                room_id: child?.room_id,
                topic: child?.topic,
                topics: JSON.parse(child?.topics),
                avatar: child?.avatar,
                is_profile: state?.space?.is_profile,
                type: child?.type,
                view: child?.type,
                restrictions: child.restrictions,
                pinned_events: child?.pinned_events != undefined ? JSON.parse(child?.pinned_events) : null,
            })
        })
    }
    return items
}

$: items = sortItems(state)

$: selected = items?.filter(x => x?.path === $page?.params?.room)[0]

$: room_id = selected?.room_id
$: space_room_id = state?.room_id

$: isSpaceRoom = room_id === space_room_id

$: isProfile = state?.space?.is_profile 

$: isOwner = state?.owner?.user_id === $store?.credentials?.matrix_user_id

$: viewQuery = $page.url.searchParams.get('view')
$: chatView = viewQuery === 'chat'

$: isChat = selected?.type === 'chat' || chatView


$: ownProfile = isProfile && isOwner

//$: joinedRoom = $store?.rooms?.includes(room_id)

/*
$: joinedRoom = () => {
    if(room_id == state?.room_id) {
        return true
    }
    return state?.children?.find(x => x?.room_id === room_id)?.joined
}
*/

$: spaceJoined = state?.space?.is_profile ? 
    $store?.rooms.find(x => x === room_id) != null :
    $store?.spaces.find(x => x?.room_id === space_room_id) != null 


$: joinedSpace = authenticated && spaceJoined

$: joinedRoom = authenticated && 
    $store?.rooms.find(x => x === room_id) != null 


$: joined = joinedSpace && joinedRoom

$: following = isProfile && !ownProfile && joinedRoom
//$: spaceRoomJoined = $store?.rooms?.includes(space_room_id)

$: menuToggled = $store?.menuToggled

function toggleMenu() {
    let el = document.querySelector('.space-container')
    if(!menuToggled) {
        let width = el.clientWidth
        el.style.width = `${width}px`
    } else {
        el.style.width = `auto`
    }
    store.toggleMenu()
}

let busy = false;

async function join() {
    if(!authenticated) {
        store.startAuthenticating("login")
        return
    }
    busy = true
    if(!joinedSpace) {
        const resp = await joinSpace(state?.room_id);
        if(resp && resp.space) {
            console.log(resp)
            store.addSpace(resp.space)
            store.addRoom(resp.space.room_id)
            store.updateRoomJoinStatus($page.params.space, room_id)
        }
    } 

    if(!isSpaceRoom) {
        const resp = await joinRoom(room_id);
        if(resp && resp?.joined && resp.room_id) {
            console.log(resp)
            store.addRoom(resp.room_id)
            store.updateRoomJoinStatus($page.params.space, room_id)
        }
    }
    busy = false
}

$: isStaticRoute = $store.staticRoutes.some(r => r.path === $page?.url?.pathname);
$: staticRoute = $store.staticRoutes.find(r => r.path === $page?.url?.pathname);

$: isMobile = window.innerWidth <= 768
$: isSpace = $page?.params?.space != undefined
$: isPost = $page?.params?.post != undefined
$: isRoom = $page?.params?.room != undefined


$: pinned_events = selected?.pinned_events


$: normalText = isProfile ? 'Follow' : 'Join'
$: busyText = isProfile ? 'Following' : 'Joining'

$: buttonText = busy ? busyText : normalText

$: requiresVerification = selected?.restrictions?.verified || false
$: requiresSenderAge = selected?.restrictions?.age || 0

$: senderVerified = authenticated && $store.credentials?.verified

$: senderAge = $store?.credentials?.age

$: ageIsOk = validAge(senderAge, requiresSenderAge)

function signup() {
    store.startAuthenticating("signup")
}

$: isDomain = $page.params.domain !== undefined && 
    $page.params.domain !== 'undefined' && 
    $page.params.domain?.length > 0

$: newItems = $store?.notifications?.some(n => !n.read);

$: description = selected?.topic ? selected?.topic : selected?.name ?
selected?.name : selected?.alias ? selected?.alias : null

function toggleUsers() {
    let su = localStorage.getItem('show_users')
    if(su) {
        localStorage.removeItem('show_users')
    } else {
        localStorage.setItem('show_users', 'true')
    }
    $store.showRoomUsers = !$store.showRoomUsers
}

</script>

<svelte:head>
    {#if description}
    <meta name="description" content={description}>
    {/if}
</svelte:head>

<div class="header">
    <div class="container fl">

        <div class="menu grd" on:click={toggleMenu}>
            <div class="mi c-ico grd-c">
                {@html menu}
            </div>
            {#if newItems}
                <div class="dot">
                </div>
            {/if}
        </div>

        <div class="ovf mr3 sel-no" class:ns={!isSpace || isProfile}>

            {#if isSpace && !isProfile}
            <ToggleView 
                on:toggle-view />
            {/if}

            <div class="name grd-c fl">
            {#if (isIndex || indexPost || isAll)}

                {#if authDone && authenticated}
                        <IndexList />
                {:else if authDone && !authenticated}
                        <DefaultIndexList />
                {/if}

            {:else if (isDomain && !isSpace)}
                <span class="ml2"><a href={`https://${$page.params.domain}`}
                        target="_blank">{$page.params.domain}</a></span>
            {:else if (!ready && !isStaticRoute)}
            {:else}

                {#if isStaticRoute && staticRoute}
                    <span class="n ml2">{staticRoute.name}</span>
                {:else if isStatic && name}
                    <span class="n ml2">{name}</span>
                {:else if selected}

                        <BoardList item={selected} items={items}/>
                        <BoardInfo item={selected} />

                        {#if $page.params.topic}
                            <div class="ico-s hash grd-c ml2">
                                {@html hash}
                            </div>
                            <div class="n grd-c">
                                {$page.params.topic}
                            </div>
                        {/if}
                {/if}
            {/if}

            </div>

            <div class="topic grd-c sel">
                {#if selected?.topic && !isPost}
                    {@html md.render(selected?.topic)}
                {/if}
            </div>


                <div class="tools grd-c fl">
                    {#if isChat}
                    <div class="ml3 users ico-s grd-c"
                        class:active={$store.showRoomUsers}
                        on:click={toggleUsers}>
                            {@html users}
                        </div>
                    {/if}
                    <Search />
                </div>

                {#if $store.verifiedSession && space && exists && isBoard}
                    {#if (joined && !isProfile) || ownProfile}
                    <div class="grd-c">
                        {#if !editing}
                        <button class="new-post light ml3" on:click={newPost}>New Post</button>
                            <div class="new-post-alt c-ico" on:click={newPost}>
                                {@html addLine}
                            </div>
                        {/if}
                    </div>
                    {:else if authenticated && (!joined)}
                    <div class="grd-c">
                        <button class="light ml3" 
                            disabled={busy}
                            on:click={join}>
                            {buttonText}
                        </button>
                    </div>
                    {/if}
                {/if}
            {#if $store.verifiedSession && !authenticated}
                <div class="grd-c ml2 signup">
                    <button class="ph2 pv2" on:click={signup}>Sign Up</button>
                </div>
            {/if}
        </div>
    </div>
</div>

<style>
.header {
    border-bottom: 1px solid var(--border-1);
    background-color: var(--bg);
    display: grid;
    grid-template-columns: auto;
    grid-template-rows: auto;
    overflow: hidden;
}

.container {
    display: grid;
    grid-template-columns: auto;
    grid-template-rows: auto;
    overflow: hidden;
}

.dne {
    border-bottom: none;
}
.menu {
    display: none;
    cursor: pointer;
    position: relative;
}

.name {
    padding-left: 0.5rem;
    padding-right: 1rem;
}

.n {
    cursor: pointer;
    font-weight: 500;
    font-size: 1rem;
}

.new-post-alt {
    background-color: var(--primary);
    border-radius: 50%;
    padding: 1rem;
    z-index: 1000;
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    display: none;
}

.c-ico {
    fill: white;
    opacity: 0.9;
}

.c-ico:hover {
    opacity: 1;
}

.signup {
    display: none;
}

.mi {
}

@media screen and (max-width: 768px) {
    .container {
        grid-template-columns: 48px auto;
    }
    .menu {
        display: grid;
    }
    .mi {
        fill: var(--hamburger);
    }
    .name {
        padding-left: 0;
    }
    .new-post {
        display: none;
    }
    .new-post-alt {
        display: block;
    }
    .signup {
        display: block;
    }
    .topic {
    }
}
.slash {
    font-weight: 500;
    opacity: 0.5;
    margin-right: 0.75rem;
    margin-left: 0.75rem;
}

.topic {
    color: var(--text-light);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    overflow-wrap: break-word;
    margin-right: 0.5rem;
    font-size: 13px;
    line-height: normal;
    max-width: 100%;
    justify-self: start;
    align-self: center;
}

div :global(p) {
    display: inline;
}

@media screen and (max-width: 1020px) {
}
a, a:link, a:visited, a:active {
    text-decoration: none;
    color: var(--text);
}

.hash {
    height: 16px;
    width: 16px;
}
.dot {
    right: 8px;
    top: 8px;
}
.ovf {
    overflow: hidden;
    display: grid;
    grid-template-columns: auto auto 1fr auto auto;
    grid-template-rows: auto;
}
.bb {
    grid-template-columns: auto auto 1fr auto auto;
}
.ns {
    grid-template-columns: auto 1fr auto auto;
}
.users{
    cursor: pointer;
}
.users:hover {
    opacity: 0.8;
    fill: var(--text-1);
}
.active {
    opacity: 1;
    fill: var(--text-1);
}
</style>
