<script>
import { createEventDispatcher } from 'svelte'
import { page } from '$app/stores';
import { goto } from '$app/navigation';
import { store } from '../../store/store.js'
import {menu} from '../../assets/icons.js'

$: authenticated = $store?.authenticated && 
    $store?.credentials != null
    $store?.credentials?.access_token?.length > 0

const dispatch = createEventDispatcher()


$: state = $store?.states[$page?.params?.space]

export let type = 'space';

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

$: joined = $store?.rooms?.includes(room_id)

function toggleMenu() {
    store.toggleMenu()
}

</script>


<div class="header">
    <div class="container fl">
            <div class="menu c-ico grd-c" on:click={toggleMenu}>
                {@html menu}
            </div>

        <div class="fl">

            <div class="name grd-c">
                {#if isStatic && name}
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
            {#if joined}
                <div class="grd-c">
                    <button class="" on:click={newPost}>New Post</button>
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
}

.container {
    display: grid;
    grid-template-columns: 48px auto;
    grid-template-rows: auto;
}

.dne {
    border-bottom: none;
}
.menu {
    display: none;
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
