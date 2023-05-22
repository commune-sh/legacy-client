<script>
import Header from './header/header.svelte'
import Auth from '../auth/auth.svelte'
import { page } from '$app/stores';
import RoomList from './room-list/room-list.svelte'

export let data;

export let exists;

import { goto } from '$app/navigation';

$: children = data?.state?.children

$: isNotIndex = $page.params.space || $page.params.room

function buildItems(d) {
    let items = [
        {
            alias: `general`,
            avatar: data?.state?.space?.avatar,
            header: data?.state?.space?.header,
            name: data?.state?.space?.name,
            topic: data?.state?.space?.topic,
            room_id: data?.state?.room_id,
            type: data?.state?.space?.type,
            general: true,
        }
    ]

    if(d?.state?.children?.length > 0) {
        d?.state?.children.forEach(child => {
            items.push(child)
        })
    }
    return items
}

$: items = buildItems(data)

$: if(items) {
    console.log("items are ", items)
}

</script>

<div class="sidebar">
    <Header data={data} />

    <div class="content fl-co">
        {#if exists}

            {#if isNotIndex}
                <div class="">
                    <RoomList items={items} />
                </div>
            {/if}

            <div class="">
            </div>

        {/if}


    </div>
    <div class="auth">
        <Auth/>
    </div>
</div>

<style>
.sidebar {
    height: 100vh;
    display: grid;
    grid-template-columns: auto;
    grid-template-rows: [search] 48px [content] auto [auth] 64px;
    border-right: 1px solid var(--border-1);
}

.content {
    padding: 0.5rem;
}
</style>
