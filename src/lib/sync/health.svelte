<script>
import { PUBLIC_BASE_URL, PUBLIC_APP_NAME } from '$env/static/public';
import { APIRequest } from '$lib/utils/request.js'
import { onMount, tick } from 'svelte'
import { store } from '$lib/store/store.js'

onMount(() => {
    checkHealth()
})


function checkHealth() {
    let url = `${PUBLIC_BASE_URL}/health_check`

    let opt = {
      url: url,
      method: 'GET',
    }

    APIRequest(opt)
    .then(resp => {
        if(resp == undefined) {
            store.setDownState(true)
        }
    })
}

</script>
