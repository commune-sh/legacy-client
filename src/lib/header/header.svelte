<script>
import { PUBLIC_API_URL, PUBLIC_APP_NAME } from '$env/static/public';
import { joinSpace, joinRoom } from '$lib/utils/request.js'
import { validAge } from '$lib/utils/time.js'
import { onMount, createEventDispatcher } from 'svelte'
import { page } from '$app/stores';
import { goto } from '$app/navigation';
import { store } from '$lib/store/store.js'
import { menu, newChat} from '$lib/assets/icons.js'
import SkeletonSpan from '$lib/skeleton/skeleton-span.svelte'
import Search from '$lib/search/search.svelte'

$: authenticated = $store?.authenticated && 
    $store?.credentials != null
    $store?.credentials?.access_token?.length > 0

const dispatch = createEventDispatcher()


$: state = $store?.states[$page?.params?.space]

$: ready = state != undefined

export let type = 'space';

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


$: isIndex = !$page.params.space && !$page.params.room

$: authDone = $store.verifiedSession
$: indexText = authenticated ? `Your feed` : `What's new`


function sortItems(state) {
    if(!state && !state?.room_id) {
        return []
    }
    let items = [
        {
            path: undefined,
            name: state?.space?.is_profile ? `${state?.space?.alias}'s Space`:`general`,
            alias: ``,
            fullpath: `/${$page.params.space}`,
            room_id: state?.room_id,
            topic: state?.space?.topic,
            restrictions: state?.space?.restrictions,
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

$: isOwner = state?.owner === $store?.credentials?.matrix_user_id

$: ownProfile = isProfile && isOwner

//$: joinedRoom = $store?.rooms?.includes(room_id)

$: joinedRoom = () => {
    if(room_id == state?.room_id) {
        return true
    }
    return state?.children?.find(x => x?.room_id === room_id)?.joined
}

$: joinedSpace = authenticated && 
    $store?.spaces.find(x => x?.room_id === space_room_id) != null 

$: joined = joinedSpace && joinedRoom()

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
        const resp = await joinSpace(space);
        if(resp && resp.space) {
            console.log(resp)
            store.addSpace(resp.space)
            //store.addRoom(resp.space.room_id)
            store.updateRoomJoinStatus($page.params.space, room_id)
        }
    } 

    if(!isSpaceRoom) {
        const resp = await joinRoom(room_id);
        if(resp && resp?.joined && resp.room_id) {
            console.log(resp)
            //store.addRoom(resp.room_id)
            store.updateRoomJoinStatus($page.params.space, room_id)
        }
    }
    busy = false
}

$: isStaticRoute = $store.staticRoutes.some(r => r.path === $page?.url?.pathname);
$: staticRoute = $store.staticRoutes.find(r => r.path === $page?.url?.pathname);

$: isMobile = window.innerWidth <= 768
$: isPost = $page?.params?.post != undefined


$: pinned_events = selected?.pinned_events


$: normalText = isProfile ? 'Follow' : 'Join'
$: busyText = isProfile ? 'Following' : 'Joining'

$: buttonText = busy ? busyText : normalText

$: requiresVerification = selected?.restrictions?.verified || false
$: requiresSenderAge = selected?.restrictions?.age || 0

$: senderVerified = authenticated && $store.credentials?.verified

$: senderAge = $store?.credentials?.age

$: ageIsOk = validAge(senderAge, requiresSenderAge)

</script>


<div class="header">
    <div class="container fl">
            <div class="menu c-ico grd-c" on:click={toggleMenu}>
                {@html menu}
            </div>

        <div class="fl mr3">

            <div class="name grd-c fl">
            {#if isIndex}
                    {#if authDone}
                        <span class="n">{indexText}</span>
                    {/if}
            {:else if !ready}
                    <SkeletonSpan />
            {:else}

                {#if isStaticRoute && staticRoute}
                    <span class="n">{staticRoute.name}</span>
                {:else if isStatic && name}
                    <span class="n">{name}</span>
                {:else if selected}
                    {#if isMobile}
                        {#if $page.params.room}
                            <span class="n" on:click={goToSpace}>
                                {$page.params.space}
                            </span>
                            <span class="slash">/</span>
                            <span class="n">
                                {selected?.alias}
                            </span>
                        {:else}
                            <span class="n">
                                {$page.params.space}
                            </span>
                        {/if}
                    {:else}
                        <span class="n" on:click={goToSpace}>
                            {selected?.name}
                        </span>
                    {/if}
                        {#if $page.params.topic}
                            <span class="slash">/</span>
                            <span class="n">
                                {$page.params.topic}
                            </span>
                        {/if}
                {/if}
            {/if}

            </div>

            {#if selected?.topic && !isPost}
                <div class="topic grd-c">
                    {selected?.topic}
                </div>
            {/if}

            <div class="fl-o"></div>
            {#if $store.verifiedSession}
                <div class="grd-c">
                    <Search />
                </div>
            {/if}
            <div class="grd-c">
                {#if $store.verifiedSession && space && exists}
                    {#if (joined && !isProfile) || ownProfile}
                        {#if !editing}
                        <button class="new-post light" on:click={newPost}>New Post</button>
                            <div class="new-post-alt c-ico" on:click={newPost}>
                                {@html newChat}
                            </div>
                        {/if}
                    {/if}
                {/if}
            </div>
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
}

.container {
    display: grid;
    grid-template-columns: auto;
    grid-template-rows: auto;
}

.dne {
    border-bottom: none;
}
.menu {
    display: none;
}

.name {
    padding-left: 1rem;
    padding-right: 1rem;
}

.n {
    cursor: pointer;
    font-weight: bold;
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

@media screen and (max-width: 768px) {
    .container {
        grid-template-columns: 48px auto;
    }
    .menu {
        display: block;
        fill: var(--hamburger);
    }
    .menu {
        display: block;
    }
    .name {
        padding-left: 0.5rem;
    }
    .new-post {
        display: none;
    }
    .new-post-alt {
        display: block;
    }
}
.slash {
    font-weight: bold;
    opacity: 0.5;
    margin-right: 0.75rem;
    margin-left: 0.75rem;
}
.topic {
    color: var(--text-light);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-right: 0.5rem;
    font-size: 0.9rem;
    margin-top: 2px;
}
@media screen and (max-width: 1020px) {
    .topic {
        display: none;
    }
}
</style>
