<script>
import Search from '../../components/sidebar/search/search.svelte'
import Auth from '../auth/auth.svelte'
import { page } from '$app/stores';
import RoomList from './room-list/room-list.svelte'

export let data;


import { goto } from '$app/navigation';

$: children = data?.state?.children

$: isNotIndex = $page.params.space || $page.params.room

</script>

<div class="sidebar">
    <div class="header fl">
        <Search />
    </div>
    <div class="content fl-co">

        {#if isNotIndex}
        <div class="">
            <RoomList children={children} />
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
    height: 100vh;
    display: grid;
    grid-template-columns: auto;
    grid-template-rows: [search] 48px [content] auto [auth] 64px;
    border-right: 1px solid var(--border-1);
}

.content {
    padding: 1rem;
}
</style>
