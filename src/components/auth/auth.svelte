<script>
import { onMount } from 'svelte'
import Flow from './flow.svelte'
import { APIRequest } from '../../utils/request.js'
import Config from '../../../config.json'
import { store } from '../../store/store.js'

let authenticated = false
let authenticating = false


let active = false;

$: username = $store?.credentials?.username

onMount(() =>{
    const token = localStorage.getItem('access_token')
    console.log('Token:', token)
    if(token) {
        syncCreds(token)
    } else {
        active = true
    }
})

let syncCreds = (token) => {
    if(token) {

        APIRequest({
            url: `${Config.baseURL}/account/session`,
        })
          .then(resp => {

            console.log('Response:', resp);
            if(resp?.valid && resp?.credentials) {
                store.saveCredentials(resp.credentials)
                success()
                active = true
            } else {
                localStorage.removeItem('access_token')
                active = true
            }

          })
          .catch(error => {
            console.error('Error:', error);
            active = true
          });
    }
}

let toggleFlow = () => {
    authenticating = !authenticating
}

let success = () => {
    //syncCreds()
    authenticated = true
    authenticating = false
}

let logout = () => {
    localStorage.removeItem('access_token')
    store.removeCredentials()
    authenticated = false
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

{#if authenticating}
    <Flow on:authenticated={success} on:kill={toggleFlow}/>
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
