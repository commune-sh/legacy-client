<script>
import { PUBLIC_MATRIX_URL } from '$env/static/public';
import { APIRequest, getAPIEndpoint } from '$lib/utils/request.js'
import { onMount, tick } from 'svelte'
import { page } from '$app/stores';
import { browser } from '$app/environment';
import { store } from '$lib/store/store.js'

$: down = $store.down

$: authenticated = $store?.authenticated && 
    $store?.credentials != null
    $store?.credentials?.access_token?.length > 0
$: active = $store.verifiedSession


let sdk;
let sdkLoaded;

onMount(() => {
    import("matrix-js-sdk").then((module) => {
        sdk = module;
        sdkLoaded = true;
    });
})


async function start() {
    console.log("matrix loaded")
    console.log("starting matrix")


    let opts = {
        baseUrl: PUBLIC_MATRIX_URL,
        accessToken: "syt_dGVzdHVzZXI_bCgphcwnBeHcSsROFBvY_38TG6y",
        userId: "@testuser:localhost:8480"
    }

    if(browser) {
        let token = localStorage.getItem(`token`) 
        if(token) {
            opts.accessToken = token
        }
        let user_id = localStorage.getItem(`user_id`) 
        if(user_id) {
            opts.userId = user_id
        }
    }


    const matrixClient = sdk.createClient(opts);

    await matrixClient.startClient({ initialSyncLimit: 10 });

    let at = matrixClient.getAccessToken()
    let uid = matrixClient.getUserId()
    if(at && at.length > 0 && uid && uid.length > 0) {
        console.log("access token for user id")
        console.log(at, uid)
        localStorage.setItem(`token`, at)
        localStorage.setItem(`user_id`, uid)
    } else {
        console.log("no access token")
    }

}

$: if(sdk && sdkLoaded) {
    start()
}

</script>
