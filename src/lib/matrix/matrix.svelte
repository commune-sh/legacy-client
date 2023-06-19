<script>
import { PUBLIC_API_URL, PUBLIC_APP_NAME } from '$env/static/public';
import { APIRequest, getAPIEndpoint } from '$lib/utils/request.js'
import { onMount, tick } from 'svelte'
import { page } from '$app/stores';
import { store } from '$lib/store/store.js'

$: down = $store.down

$: authenticated = $store?.authenticated && 
    $store?.credentials != null
    $store?.credentials?.access_token?.length > 0
$: active = $store.verifiedSession


let sdk;
let sdkLoaded;

$: if(authenticated) {
    import("matrix-js-sdk").then((module) => {
        sdk = module;
        sdkLoaded = true;
    });
}

$: if(sdk && sdkLoaded) {
    console.log("matrix loaded")
    console.log("starting matrix")
    const matrixClient = sdk.createClient({
        baseUrl: "http://localhost:8008",
        accessToken: $store.credentials.matrix_access_token,
        userId: $store.credentials.matrix_user_id,
    });
    matrixClient.startClient();
}
</script>
