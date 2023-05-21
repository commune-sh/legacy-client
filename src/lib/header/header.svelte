<script>
import { createEventDispatcher } from 'svelte'
import { page } from '$app/stores';
import { goto } from '$app/navigation';
import Logo from '$lib/logo/logo.svelte'
import { store } from '../../store/store.js'

$: authenticated = $store?.authenticated && 
    $store?.credentials != null
    $store?.credentials?.access_token?.length > 0

const dispatch = createEventDispatcher()

export let data;
$: state = data?.state
export let type = 'space';

export let ready = false;
export let exists;

$: space = $page.params.space

export let isStatic = false;
export let name = '';

function goToSpace() {
    goto(`/${$page.params.space}`)
}

function newPost() {
    dispatch('newPost')
}


$: isIndex = !$page.params.space && !$page.params.room

$: authDone = $store.verifiedSession
$: indexText = authenticated ? `Your feed` : `What's new`


function sortItems() {
    let items = [
        {
            path: undefined,
            name: `general`,
            room_id: data?.state?.room_id,
        }
    ]
    if(data?.state?.children?.length > 0) {
        data?.state?.children.forEach(child => {
            items.push({
                path: child?.alias,
                name: child?.name,
                room_id: child?.room_id,
            })
        })
    }
    return items
}

$: items = sortItems(data)

function findActive(x) {
    return items?.filter(item => {
        return item?.path === x
    })[0]
}

$: selected = findActive($page.params.room)

$: room_id = selected?.room_id


$: joined = $store?.rooms?.includes(room_id)

</script>


<div class="header" class:dne={!exists}>
    <div class="container fl">
            <div class="logo grd-c">
                <Logo />
            </div>
    {#if exists}
        {#if ready}
            <div class="menu grd-c">
            </div>
            <div class="name grd-c">
                {#if isStatic && name}
                    <span class="n">{name}</span>
                {:else if isIndex}
                    {#if authDone}
                    <span class="n">{indexText}</span>
                    {/if}
                {:else}
                    <span class="n" on:click={goToSpace}>{selected?.name}</span>
                {/if}
            </div>
            <div class="fl-o"></div>
            {#if joined}
                <div class="grd-c">
                    <button class="" on:click={newPost}>New Post</button>
                </div>
            {/if}
        {/if}
    {/if}
    </div>
</div>

<style>
.header {
    border-bottom: 1px solid var(--border-1);
    position: sticky;
    z-index: 1;
    top: 0;
    background-color: var(--bg);
    display: grid;
    grid-template-columns: auto;
    grid-template-rows: auto;
}
.dne {
    border-bottom: none;
}
.logo {
    display: none;
    padding-left: 0.5rem;
}

.menu {
    display: none;
    padding-left: 1rem;
}

@media screen and (max-width: 768px) {
    .header {
    }
    .logo {
        display: block;
    }
    .menu {
        display: block;
    }
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
</style>
