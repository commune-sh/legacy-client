<script>
import { onMount } from 'svelte'
import { store } from '../../store/store.js'

let authenticated = false

$: authenticated = $store?.authenticated && $store?.credentials


$: active = $store.verifiedSession


$: username = $store?.credentials?.username


let toggleFlow = () => {
    store.startAuthenticating()
}


let logout = () => {
    localStorage.removeItem('access_token')
    store.removeCredentials()
    store.isNotAuthenticated()
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
