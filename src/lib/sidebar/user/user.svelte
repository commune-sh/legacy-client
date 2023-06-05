<script>
import { PUBLIC_BASE_URL } from '$env/static/public';
import { page } from '$app/stores';
import { store } from '$lib/store/store.js'

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

$: isSpace = $page.params.space !== undefined && $page.params.space !== null &&
    $page.params.space !== ''

let logout = () => {
    store.logout()
    if(!isSpace) {
        //location.replace('/')
    }
}

</script>

<section class="user">

{#if active && !authenticated}
<div class="grd">
    <div class="grd-c">
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

</section>

<style>
.user {
    border-top: 1px solid var(--border-1);
    display: grid;
}

.btn {
    width: 220px;
    cursor: pointer;
    border-radius: 60px;
    border: 0px;
    padding: 10px;
    font-weight: bold;
    background-color: var(--primary);
    color: white;
}
.btn:hover {
    background-color: var(--primary);
}
</style>
