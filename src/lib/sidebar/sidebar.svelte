<script>
import Header from './header/header.svelte'
import Auth from '../auth/auth.svelte'
import { page } from '$app/stores';
import RoomList from './room-list/room-list.svelte'
import { store } from '$lib/store/store.js'

$: state = $store?.states[$page?.params?.space]

$: children = state?.children

$: isNotIndex = $page.params.space || $page.params.room

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
    <Header state={state} />

    <div class="content fl-co">

            {#if isNotIndex}
                <div class="">
                    <RoomList items={items} />
                </div>
            {/if}

            <div class="">
            </div>


    </div>
    <div class="auth">
        <Auth/>
    </div>
</div>

<style>
.sidebar {
    height: 100%;
    display: grid;
    grid-template-columns: auto;
    grid-template-rows: [search] 48px [content] auto [auth] 64px;
    border-right: 1px solid var(--border-1);
    background-color: var(--bg);
}

.content {
    padding: 0.5rem;
}
</style>
