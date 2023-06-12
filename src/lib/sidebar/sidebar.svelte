<script>
import Header from './header/header.svelte'
import User from './user/user.svelte'
import { page } from '$app/stores';
import RoomList from './room-list/room-list.svelte'
import { store } from '$lib/store/store.js'
import SkeletonSidebar from '$lib/skeleton/skeleton-sidebar.svelte'

$: state = $store?.states[$page?.params?.space]

$: ready = state != undefined

$: children = state?.children

$: isNotIndex = $page.params.space || $page.params.room
$: isIndex = $page?.url?.pathname === '/'
$: isNotSpace = $page?.params?.space == undefined || $page?.params?.space == null

$: isStaticRoute = $store.staticRoutes.some(r => r.path === $page?.url?.pathname);
$: staticRoute = $store.staticRoutes.find(r => r.path === $page?.url?.pathname);

$: exists = $store?.states[$page?.params?.space]?.room_id != undefined

function buildItems(state) {
    if(!state && !state?.room_id) {
        return []
    }
    let items = [
        {
            alias: `general`,
            avatar: state?.space?.avatar,
            header: state?.space?.header,
            name: state?.space?.name,
            topic: state?.space?.topic,
            room_id: state?.room_id,
            type: state?.space?.type,
            general: true,
            topics: state?.space?.topics,
        }
    ]

    if(children?.length > 0) {
        children.forEach(child => {
            items.push(child)
        })
    }
    return items
}

$: items = buildItems(state)

</script>

<div class="sidebar">
    <Header state={state} ready={ready}/>

    <div class="content fl-co">
        {#if isNotSpace}

        {:else if !ready}
            <SkeletonSidebar />

        {:else if !exists}

        {:else if exists}

            {#if isNotIndex}
                <div class="items">
                    <RoomList items={items} />
                </div>
            {/if}

        {/if}



    </div>
    <User/>
</div>

<style>
.sidebar {
    display: grid;
    grid-template-columns: auto;
    grid-template-rows: [search] 48px [content] auto [user] 56px;
    border-right: 1px solid var(--border-1);
    background-color: var(--bg);
    overflow: hidden;
}

.content {
    overflow: hidden;
}
.items {
    padding: 0.5rem;
    overflow-y: auto;
}

::-webkit-scrollbar {
    width: 3px;
}
::-webkit-scrollbar-thumb {
    background: transparent;
    transition: 0.1s;
}
::-webkit-scrollbar-thumb:hover {
    background: var(--scrollbar-track);
}

.items:hover::-webkit-scrollbar-thumb {
    background: var(--scrollbar-thumb);
}
</style>
