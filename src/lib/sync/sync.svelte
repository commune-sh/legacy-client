<script>
import { PUBLIC_BASE_URL, PUBLIC_APP_NAME } from '$env/static/public';
import { APIRequest } from '$lib/utils/request.js'
import { onMount, tick } from 'svelte'
import { page } from '$app/stores';
import { store } from '$lib/store/store.js'

let lastSpace = null

$: if($page?.params?.space !== lastSpace && $page?.params?.space) {
    fetchSpaceState()
}

onMount(() => {
    fetchDefaultSpaces()
})

function fetchDefaultSpaces() {

    let opt = {
      url: `${PUBLIC_BASE_URL}/default_spaces`,
      method: 'GET',
    }

    APIRequest(opt)
    .then(resp => {
        if(resp) {
            console.log(resp)
            store.saveSpaces(resp.spaces)
        }
    })
}


function fetchSpaceState() {

    let opt = {
      url: `${PUBLIC_BASE_URL}/${$page?.params?.space}/state`,
      method: 'GET',
    }

    APIRequest(opt)
    .then(resp => {
        if(resp?.state) {
            console.log(resp)
            store.addSpaceState($page?.params?.space, resp.state)
            lastSpace = $page?.params?.space
        } else {
            console.log(resp)
        }
    })
}

$: space = $page.params?.space
$: room = $page.params?.room
$: post = $page.params?.post

$: if($page?.params) {
    store.addPageState($page)
    store.addSpacePath($page?.params?.space, {
        pathname: $page?.url?.pathname,
        params: $page?.params,
        rooms: {}
    })
}

$: if(room) {
    let path = `/`
    if(post) {
        path = `/post/${post}`
    }
    store.addSpaceRoomPath(space, room, path)
}

$: if(space && !room) {
    let path = `/`
    if(post) {
        path = `/post/${post}`
    }
    store.addSpaceRoomPath(space, 'general', path)
}

</script>
