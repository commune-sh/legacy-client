<script>
import { PUBLIC_API_URL, PUBLIC_APP_NAME } from '$env/static/public';
import { APIRequest } from '$lib/utils/request.js'
import { onMount, tick } from 'svelte'
import { store } from '$lib/store/store.js'

onMount(() => {
    checkHealth(true)
})


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
    })
}

</script>
