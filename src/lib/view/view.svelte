<script>
import { PUBLIC_API_URL, PUBLIC_APP_NAME } from '$env/static/public';
import { APIRequest } from '$lib/utils/request.js'
import { onMount, tick, createEventDispatcher } from 'svelte'
import { page } from '$app/stores';
import { store } from '$lib/store/store.js'
import Board from './board/board.svelte'
import Chat from './chat/chat.svelte'
import SkeletonBoardEvents from '$lib/skeleton/skeleton-board-events.svelte'
import Header from '$lib/header/header.svelte'
import NotFound from '$lib/errors/not-found.svelte'

$: isSpace = $page?.params?.space !== undefined && $page?.params?.space !== null && $page?.params?.space !== '' 
$: isRoom = $page?.params?.room !== undefined && $page?.params?.room !== null && $page?.params?.room !== '' 

$: state = $store?.states[$page?.params?.space]

$: roomID = isRoom ? state?.children?.find(r => r?.alias ===
    $page?.params?.room)?.room_id : isSpace ? state?.room_id : null

$: defaultView = isRoom ? state?.children?.find(r => r?.alias ===
    $page?.params?.room)?.type : isSpace ? state?.space?.type : null

$: isChat = defaultView === 'chat'
$: isBoard = defaultView === 'board'

$: isProfile = defaultView === 'profile'



$: ready = $store.stateReady

$: query = $page.url.search
$: queries = $page.url.searchParams

$: queryExists = $page.url.search.length > 0
$: viewQuery = $page.url.searchParams.get('view')

$: chatView = viewQuery === 'chat'
$: boardView = viewQuery === 'board'

$: showBoardView = (!viewQuery && isBoard) || boardView
$: showChatView = (!viewQuery && isChat) || chatView


$: space_exists = $store?.states[$page?.params?.space]?.exists != false

$: isRoom = $page.params?.room !== undefined && $page.params?.room !== null && $page.params?.room !== ''

$: room_exists = isRoom &&
    $store?.states[$page?.params?.space]?.children?.find(r => r?.alias ===
        $page?.params?.room) != null

</script>

{#if isSpace}
    {#if ready && space_exists}

        {#if isRoom && !room_exists}

            <NotFound />

        {:else if isProfile}
            <Board on:ready />
        {:else if showChatView}
            <Chat />
        {:else if showBoardView}
            <Board on:ready />
        {/if}
    {:else if ready && !space_exists}

        <NotFound />

    {:else}
        <div class="space-container">
            <div class="inner-area">
                <Header />
                <SkeletonBoardEvents />
            </div>
        </div>
    {/if}
{:else}
    <Board />
{/if}



<style>

.mask {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 298px;
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

</style>

