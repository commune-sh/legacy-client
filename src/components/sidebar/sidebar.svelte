<script>
import { logo } from '/src/assets/logo.js'
import Auth from '../auth/auth.svelte'
import { page } from '$app/stores';
import RoomList from './room-list/room-list.svelte'

export let data;


import { goto } from '$app/navigation';

function switchto() {
    goto(`/music/test`, {
        noscroll: true,
    })
}

function switcht() {
    goto(`/music`, {
        noscroll: true,
    })
}

$: children = data?.state?.children

</script>

<div class="sidebar">
    <div class="header fl">
        <div class="">
        </div>
    </div>
    <div class="content fl-co">

        <div class="">
            <RoomList children={children} />
        </div>
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
    grid-template-rows: [search] 64px [content] auto [auth] 64px;
    border-right: 1px solid var(--border-1);
}

.content {
    padding: 1rem;
}
</style>
