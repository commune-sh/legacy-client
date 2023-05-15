<script>
import { PUBLIC_BASE_URL } from '$env/static/public';
import { APIRequest } from '../../utils/request.js'
import { onMount } from 'svelte'
import { store } from '../../store/store.js'

let authenticated = false

$: authenticated = $store?.authenticated && 
    $store?.credentials != null
    $store?.credentials?.access_token?.length > 0


$: active = $store.verifiedSession


$: username = $store?.credentials?.username

$: if(authenticated && active) {
    //Sync()
    //SSE()
}

function SSE() {
    const token = $store?.credentials?.access_token
    console.log("token issss", $store.credentials)
    const url = `${PUBLIC_BASE_URL}/sse?token=${token}`
    const eventSource = new EventSource(url);
    eventSource.onmessage = function(event) {
        if(event.data) {
          console.log('Received event:', JSON.parse(event.data));
        }
    };

}


let toggleFlow = () => {
    store.startAuthenticating()
}


let logout = () => {
    store.logout()
}

</script>

{#if active && !authenticated}
<div class="grd">
    <div class="in grd-c">
            <button class="btn" on:click={toggleFlow}>Log in • Sign up</button>
    </div>
</div>
{/if}

{#if active && authenticated}

<div class="fl-co">
    <div class="">
        {username}
    </div>
    <div class="">
        <button class="btn" on:click={logout}>Log out</button>
    </div>
</div>
{/if}

<style>
.in {
}

.btn {
    width: 220px;
    cursor: pointer;
    border-radius: 60px;
    border: 0px;
    padding: 10px;
    font-weight: bold;
    font-family: monospace;
    background-color: var(--primary);
    color: white;
}
.btn:hover {
    background-color: var(--primary);
}
</style>
