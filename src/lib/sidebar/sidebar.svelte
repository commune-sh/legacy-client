<script>
import Header from './header/header.svelte'
import User from './user/user.svelte'
import { page } from '$app/stores';
import RoomList from './room-list/room-list.svelte'
import { store } from '$lib/store/store.js'
import SkeletonSidebar from '$lib/skeleton/skeleton-sidebar.svelte'
import IndexSidebar from '$lib/sidebar/index/index.svelte'
import { createStateEvent } from '$lib/utils/request.js'

$: state = $store?.states[$page?.params?.space]
$: space_exists = $store?.states[$page?.params?.space]?.exists != false

$: ready = state != undefined && $store.stateReady

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
            alias: state?.space?.is_profile ? `${$page.params.space}`:`general`,
            title: state?.space?.name ? state?.space?.name : state?.space?.alias,
            avatar: state?.space?.avatar,
            header: state?.space?.header,
            name: state?.space?.name,
            topic: state?.space?.topic,
            room_id: state?.room_id,
            type: state?.space?.type,
            general: true,
            topics: state?.space?.topics,
            banned: state?.banned,
            power_levels: state?.space?.power_levels,
        }
    ]

    if(children?.length > 0) {
        children.forEach(child => {
            let title = `${$page.params.space}/${child.alias}`
            if(child.topic) {
                title = `${title} - ${child.topic}`
            }
            child.title = `${title}`
            items.push(child)
        })
    }

    const roomOrderIndexMap = new Map();

    let room_order = state?.space?.settings?.room_order

    if(room_order?.length == items.length) {
        room_order.forEach((element, index) => {
            roomOrderIndexMap.set(element.room_id, index);
        });
        items.sort((a, b) => {
            const indexA = roomOrderIndexMap.get(a.room_id);
            const indexB = roomOrderIndexMap.get(b.room_id);
            return indexA - indexB;
        })
    }

    if(!room_order) {
        let order = []
        items.forEach(item => {
            order.push({
                room_id: item.room_id,
                alias: item.alias
            })
        })
        store.updateSpaceRoomOrder($page.params.space, order)
    }

    return items
}

$: items = buildItems(state)

function moveUp(e) {
    const index = e.detail;
    if(index === 0) return
    let rooms = state?.space?.settings?.room_order
    const temp = rooms[e.detail];
    rooms[index] = rooms[index - 1];
    rooms[index - 1] = temp;
    items = buildItems(state)
}

function moveDown(e) {
    const index = e.detail;
    if(index == items.length -1) return
    let rooms = state?.space?.settings?.room_order
    const temp = rooms[e.detail];
    rooms[index] = rooms[index + 1];
    rooms[index + 1] = temp;
    items = buildItems(state)
}

async function setOrder() {
    let settings = state?.space?.settings
    let order = []
    items.forEach(item => {
        order.push({
            room_id: item.room_id,
            alias: item.alias
        })
    })
    settings.room_order = order

    const res = await createStateEvent({
        room_id: state?.room_id,
        event_type: 'room.settings',
        content: settings
    })
    console.log(res)
}

</script>

<div class="sidebar">
    <Header state={state} ready={ready}/>

    <div class="content fl-co sel-no">
        {#if isNotSpace}
            <IndexSidebar />

        {:else if !exists}

        {:else if !ready}
            <SkeletonSidebar />


        {:else if exists}

            {#if isNotIndex && items?.length > 0}
                <div class="items">
                    <RoomList 
                        on:set-order={setOrder}
                        on:move-up={moveUp}
                        on:move-down={moveDown}
                        items={items} />
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
    grid-template-rows: [header] auto [content] 1fr [user] 56px;
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
::-webkit-scrollbar-track {
    background: transparent;
    transition: 0.1s;
}

.items:hover::-webkit-scrollbar-thumb {
    background: var(--scrollbar-thumb);
}
.items:hover::-webkit-scrollbar-track {
}
</style>
