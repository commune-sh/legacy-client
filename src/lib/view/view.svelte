<script>
import { PUBLIC_API_URL, PUBLIC_APP_NAME } from '$env/static/public';
import { APIRequest } from '$lib/utils/request.js'
import { onMount, tick, createEventDispatcher } from 'svelte'
import { page } from '$app/stores';
import { store } from '$lib/store/store.js'
import Chat from './chat/chat.svelte'
import Board from './board/board.svelte'

$: isIndex = $page?.url?.pathname === '/'
$: isSpace = $page?.params?.space !== undefined && $page?.params?.space !== null && $page?.params?.space !== '' 
$: isRoom = $page?.params?.room !== undefined && $page?.params?.room !== null && $page?.params?.room !== '' 
$: isPost = $page?.params?.post !== undefined && $page?.params?.post !== null && $page?.params?.post !== ''
$: state = $store?.states[$page?.params?.space]

$: selectedRoomType = isRoom ? state?.children?.find(r => r?.alias ===
    $page?.params?.room)?.type : isSpace ? state?.space?.type : null

$: isChat = selectedRoomType === 'chat'
$: isBoard = selectedRoomType === 'board'


const dispatch = createEventDispatcher()


</script>


<Board on:ready />



<style>

.mask {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 304px;
    height: 100%;
    z-index: 10000;
    width: 100vw;
}

.space-container {
    display: grid;
    grid-template-columns: auto;
    grid-template-columns: auto;
    overflow: hidden;
}

.inner-area {
    display: grid;
    grid-template-columns: auto;
    grid-template-rows: 48px auto;
    overflow: hidden;
}

.inner-content {
    overflow-y: auto;
    display: grid;
}

.post {
    grid-template-columns: 50% 50%;
}

.events {
    place-self: stretch;
    width: 100%;
    justify-self: center;
    align-self: start;
}

.ina {
    border-right: 1px solid var(--border-1);
}



@media screen and (max-width: 768px) {
    .post {
        grid-template-columns: auto;
    }
    .ina {
        display: none;
    }
}

</style>

