<script>
import { PUBLIC_API_URL, PUBLIC_APP_NAME } from '$env/static/public';
import { APIRequest } from '$lib/utils/request.js'
import { onMount, tick } from 'svelte'
import { page } from '$app/stores';
import { store } from '$lib/store/store.js'

$: down = $store.down

$: authenticated = $store?.authenticated && 
    $store?.credentials != null
    $store?.credentials?.access_token?.length > 0
$: active = $store.verifiedSession

let lastSpace = null

$: if($page?.params?.space !== lastSpace && $page?.params?.space && !down) {
    fetchSpaceState()
}


$: isdomain = $page?.params?.domain != null && 
    $page?.params?.domain?.length > 0

$: if(isdomain) {
    console.log("domaain is", $page?.params?.domain)
}

onMount(() => {
})

$: if(!down && !authenticated && active) {
    fetchDefaultSpaces()
}

function fetchDefaultSpaces() {

    let opt = {
      url: `${PUBLIC_API_URL}/default_spaces`,
      method: 'GET',
    }


    APIRequest(opt)
    .then(resp => {
        if(resp) {
            store.saveSpaces(resp.spaces)
        }
    })
}


function fetchSpaceState() {

    let opt = {
      url: `${PUBLIC_API_URL}/${$page?.params?.space}/state`,
      method: 'GET',
    }

    let isDomain = $page?.params?.domain != null && $page?.params?.domain?.length > 0

    /*
    if(isDomain) {
        opt.url = `${page.params.domain}/${$page?.params?.space}/state`
    }
    */

    APIRequest(opt)
    .then(resp => {
        if(resp?.state) {
            store.addSpaceState($page?.params?.space, resp.state)
            lastSpace = $page?.params?.space
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
