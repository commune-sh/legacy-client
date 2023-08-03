<script>
import { createEventDispatcher } from 'svelte'
import { discuss, chat } from '$lib/assets/icons.js'
import { store } from '$lib/store/store.js'
import { page } from '$app/stores';
import { goto } from '$app/navigation';

$: state = $store?.states[$page?.params?.space]
$: roomID = isRoom ? state?.children?.find(r => r?.alias ===
    $page?.params?.room)?.room_id : isSpace ? state?.room_id : null
$: isSpace = $page?.params?.space !== undefined 
$: isRoom = $page?.params?.room !== undefined 
$: defaultView = isRoom ? state?.children?.find(r => r?.alias ===
    $page?.params?.room)?.type : isSpace ? state?.space?.type : null


$: view = $store.roomViews[roomID]
$: query = $page.url.search
$: queries = $page.url.searchParams

$: queryExists = $page.url.search.length > 0
$: viewQuery = $page.url.searchParams.get('view')

$: chatView = viewQuery === 'chat'
$: boardView = viewQuery === 'board'

$: if(viewQuery) {
    saveRoomView()
}

function saveRoomView() {
    let url = `/${$page.params.space}${$page.url.search}`
    if($page.params.room) {
        url = `/${$page.params.space}/${$page.params.room}${$page.url.search}`
    }
    $store.roomViews[roomID] = url
}

function toggle() {
    if(!viewQuery && defaultView === 'board') {
        let url = `/${$page.params?.space}?view=chat`
        if($page.params.room) {
            url = `/${$page.params?.space}/${$page.params?.room}?view=chat`
        }
        $store.roomViews[roomID] = url
        goto(url, {
            noscroll: true,
        })
        return
    }
    if(!viewQuery && defaultView === 'chat') {
        let url = `/${$page.params?.space}?view=board`
        if($page.params.room) {
            url = `/${$page.params?.space}/${$page.params?.room}?view=board`
        }
        $store.roomViews[roomID] = url
        goto(url, {
            noscroll: true,
        })
        return
    }
    if(chatView && defaultView === 'board') {
        let url = `/${$page.params.space}`
        if($page.params.room) {
            url = `/${$page.params.space}/${$page.params.room}`
        }
        $store.roomViews[roomID] = url
        goto(url, {
            noscroll: true,
        })
        return
    }
    if(boardView && defaultView === 'chat') {
        let url = `/${$page.params.space}`
        if($page.params.room) {
            url = `/${$page.params.space}/${$page.params.room}`
        }
        $store.roomViews[roomID] = url
        goto(url, {
            noscroll: true,
        })
        return
    }
}
/*
function toggle() {
    console.log(defaultView)
    if (view === 'board') {
        $store.roomViews[roomID] = 'chat'
    } else if(view === 'chat') {
        $store.roomViews[roomID] = 'board'
    }
    //dispatch('toggle-view', view)
}
*/

$: isBoard = (defaultView === 'board' && !viewQuery) ||  viewQuery == 'board'
$: isChat = (defaultView === 'chat' && !viewQuery) ||  viewQuery == 'chat'

</script>

<div class="toggle-view" on:click={toggle}>
    <div class="toggle grd-c">
        <div class="di ico-s ic grd-c" class:active={isBoard}>
            {@html discuss}
        </div>
        <div class="ch ico-s ic grd-c" class:active={isChat}>
            {@html chat}
        </div>
    </div>
</div>

<style>
.toggle-view {
    display: grid;
    margin-left: 1rem;
    margin-right: 0.5rem;
}
.toggle {
    border-radius: 5px;
    background: var(--shade-3);
    display: grid;
    grid-template-columns: auto auto;
    cursor: pointer;
}
.active {
    background: var(--primary);
    fill: white;
    transition: 0.1s;
}

.ic {
    border-radius: 5px;
    height: 14px;
    width: 14px;
    padding: 0.25rem 0.5rem 0.25rem 0.5rem;
}
.di {
}
.ch {
}
</style>
