<script>
import { PUBLIC_API_URL, PUBLIC_APP_NAME } from '$env/static/public';
import { joinSpace, joinRoom } from '$lib/utils/request.js'
import { onMount, createEventDispatcher } from 'svelte'
import { page } from '$app/stores';
import { goto } from '$app/navigation';
import { store } from '$lib/store/store.js'
import {menu} from '$lib/assets/icons.js'

$: authenticated = $store?.authenticated && 
    $store?.credentials != null
    $store?.credentials?.access_token?.length > 0

const dispatch = createEventDispatcher()


$: state = $store?.states[$page?.params?.space]

export let type = 'space';
export let exists;


export let editing = false;


$: space = $page.params.space

export let isStatic = false;
export let name = '';

function goToSpace() {
    goto(`/${$page.params.space}`)
}

function newPost() {
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
            name: `general`,
            room_id: state?.room_id,
        }
    ]
    if(state?.children?.length > 0) {
        state?.children.forEach(child => {
            items.push({
                path: child?.alias,
                name: child?.name,
                room_id: child?.room_id,
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

$: joinedRoom = $store?.rooms?.includes(room_id)
$: joinedSpace = $store?.spaces.find(x => x?.room_id === space_room_id) != null 
$: joined = joinedSpace && joinedRoom
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
    console.log("joining")
    busy = true
    if(!joinedSpace) {
        const resp = await joinSpace(space);
        if(resp && resp.space) {
            console.log(resp)
            store.addSpace(resp.space)
            store.addRoom(resp.space.room_id)
        }
    } 

    if(!isSpaceRoom) {
        const resp = await joinRoom(room_id);
        if(resp && resp?.joined && resp.room_id) {
            console.log(resp)
            store.addRoom(resp.room_id)
        }
    }
    busy = false
}

$: isStaticRoute = $store.staticRoutes.some(r => r.path === $page?.url?.pathname);
$: staticRoute = $store.staticRoutes.find(r => r.path === $page?.url?.pathname);

</script>


<div class="header">
    <div class="container fl">
            <div class="menu c-ico grd-c" on:click={toggleMenu}>
                {@html menu}
            </div>

        <div class="fl mr3">

            <div class="name grd-c">
                {#if isStaticRoute && staticRoute}
                    <span class="n">{staticRoute.name}</span>
                {:else if isStatic && name}
                    <span class="n">{name}</span>
                {:else if isIndex}
                    {#if authDone}
                    <span class="n">{indexText}</span>
                    {/if}
                {:else if selected}
                    <span class="n" on:click={goToSpace}>{selected?.name}</span>
                {/if}
            </div>
            <div class="fl-o"></div>
            <div class="grd-c">
                {#if authenticated && space}
                    {#if joined}
                        {#if !editing}
                        <button class="light" on:click={newPost}>New Post</button>
                        {/if}
                    {:else}
                        <button class="light" 
                            disabled={busy}
                            on:click={join}>
                            {#if busy}
                                Joining...
                            {:else}
                                Join
                            {/if}
                        </button>
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

@media screen and (max-width: 768px) {
    .container {
        grid-template-columns: 48px auto;
    }
    .menu {
        display: block;
    }
    .menu {
        display: block;
    }
    .name {
        padding-left: 0.5rem;
    }
}
</style>
