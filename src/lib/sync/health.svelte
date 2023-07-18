<script>
import { PUBLIC_API_URL, PUBLIC_APP_NAME } from '$env/static/public';
import { APIRequest,getAPIEndpoint } from '$lib/utils/request.js'
import { onMount, tick } from 'svelte'
import { store } from '$lib/store/store.js'
import { page } from '$app/stores';

onMount(() => {
    checkHealth(true)
})

$: isDomain = $page?.params?.domain != null && 
    $page?.params?.domain?.length > 0


$: if(isDomain) {
    fetchFE()
}

async function fetchFE() {
        const endpoint = await getAPIEndpoint($page.params?.domain)

        if(endpoint?.url) {
            store.isFederated({
                endpoint: endpoint.url,
                media_url: endpoint.media_url
            })
        }
}


function checkHealth(init) {
    let url = `${PUBLIC_API_URL}/health_check`

    let opt = {
      url: url,
      method: 'GET',
    }

    APIRequest(opt)
    .then(resp => {
        if(resp == undefined) {
            if(init){
                store.setDownState(true)
            }
            store.setHealth(false)
        } else if(resp?.healthy == true) {
            store.setHealth(true)
            store.setDownState(false)
        }
        if(resp?.features) {
            store.setFeatures(resp.features)
        }
        if(resp?.restrictions) {
            store.setRestrictions(resp.restrictions)
        }
    })
}

</script>
