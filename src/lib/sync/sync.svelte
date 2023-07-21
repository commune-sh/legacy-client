<script>
import { PUBLIC_API_URL, PUBLIC_APP_NAME } from '$env/static/public';
import { APIRequest, getAPIEndpoint } from '$lib/utils/request.js'
import { onMount, tick } from 'svelte'
import { page } from '$app/stores';
import { store } from '$lib/store/store.js'
//import Matrix from '$lib/matrix/matrix.svelte'

$: down = $store.down

$: authenticated = $store?.authenticated && 
    $store?.credentials != null
    $store?.credentials?.access_token?.length > 0
$: active = $store.verifiedSession

let lastSpace = null

$: if($page?.params?.space !== lastSpace && $page?.params?.space && !down) {
    fetchSpaceState()
}

$: if(authenticated){
    fetchPowerLevels()
}


$: isdomain = $page?.params?.domain != null && 
    $page?.params?.domain?.length > 0


onMount(() => {
})

let defaultSpacesFetched = false

$: if(!down && !authenticated && active && !defaultSpacesFetched) {
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
            store.saveDefaultSpaces(resp.spaces)
            store.stateReady()
            store.spacesFetched()
            defaultSpacesFetched = true
        }
    })
}


async function fetchSpaceState() {

    let opt = {
      url: `${PUBLIC_API_URL}/${$page?.params?.space}/state`,
      method: 'GET',
    }

    let isDomain = $page?.params?.domain != null && $page?.params?.domain?.length > 0

    if(isDomain) {

        const endpoint = await getAPIEndpoint($page.params?.domain)

        if(endpoint?.url) {
            opt.url = `${endpoint.url}/${$page.params?.space}/state`
            store.isFederated({
                endpoint: endpoint.url,
                media_url: endpoint.media_url
            })
        }
    }

    APIRequest(opt)
    .then(resp => {
        if(resp?.state) {
            store.addSpaceState($page?.params?.space, resp.state)
            lastSpace = $page?.params?.space
            store.stateReady()
            if(authenticated){
                fetchPowerLevels()
            }
        } else {
            store.stateReady()
        }
    })
}

async function fetchPowerLevels() {

    let opt = {
      url: `${PUBLIC_API_URL}/${$page?.params?.space}/power_levels`,
      method: 'GET',
    }

    APIRequest(opt)
    .then(resp => {
        if(resp?.power_levels) {
            store.savePowerLevels(resp.power_levels)
        }
    })
}

$: domain = $page.params?.domain
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

$: if(authenticated) {
    //console.log("setting up events sync")
    //SyncEvents()
}

function SyncEvents() {
    const token = $store?.credentials?.access_token
    const url = `${PUBLIC_API_URL}/sync?token=${token}`
    const eventSource = new EventSource(url);
    eventSource.onmessage = function(event) {
        if(event.data) {
          console.log('Received event:', JSON.parse(event.data));
        }
    };

}

</script>

