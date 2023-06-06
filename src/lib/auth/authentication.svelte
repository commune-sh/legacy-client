<script>
import { onMount, onDestroy } from 'svelte'
import { APIRequest } from '$lib/utils/request.js'
import { PUBLIC_BASE_URL } from '$env/static/public';
import Login from './login.svelte'
import { close } from '$lib/assets/icons.js'
import { page } from '$app/stores';
import Signup from './signup.svelte'
import Password from './password.svelte'
import { store } from '$lib/store/store.js'

let active = false;


onMount(() => {

    const token = localStorage.getItem('access_token')
    if(token) {
        syncCreds(token)
    } else {
        store.verifiedSession(true)
    }

});

onDestroy(() => {
});

let syncCreds = (token) => {
    if(token) {

        APIRequest({
            url: `${PUBLIC_BASE_URL}/account/session`,
        })
          .then(resp => {

            console.log('Response:', resp);
            if(resp?.valid && resp?.credentials) {
                store.saveCredentials(resp.credentials)
                store.saveRooms(resp.rooms)
                store.saveSpaces(resp.spaces)
                store.isAuthenticated()
                store.verifiedSession(true)
            } else {
                //localStorage.removeItem('access_token')
            }

          })
          .catch(error => {
            console.error('Error:', error);
          });
    }
}


let kill =() => {
    active = false;
    store.stopAuthenticating()
}

$: authenticating = $store.authenticating

$: if(authenticating) {
    active = true
} else {
    active = false
}

$: if(active) {
    document.addEventListener('keydown', escape)
    //document.body.style.overflowY = 'hidden'
    //document.body.style.marginRight = '10px'
} else {
    document.removeEventListener('keydown', escape)
    //document.body.style.overflowY = 'scroll'
    //document.body.style.marginRight = '0px'
    store.stopAuthenticating()
    mode = "login"
}

function escape(e) {
    if(e.key == 'Escape') {
        //kill()
    }
}



export let mode = "login";

$: loginMode = mode === "login";
$: signupMode = mode === "signup";
$: passwordMode = mode === "pass";

function toggleMode() {
    if (loginMode) {
        mode = "signup";
    } else if (signupMode) {
        mode = "login";
    } else if (passwordMode) {
        mode = "login";
    }
}
function passMode() {
    mode = "pass";
}

function loggedin() {
    store.startRefreshingFeed()
    kill()
}

function created() {
    store.startRefreshingFeed()
    kill()
}

</script>


{#if active}
<div class="mask grd" 
    on:click|self={kill}>

    <div class="modal grd-c">

        <div class="hed fl">
            <div class="c-ico grd-c pa2" on:click={kill}>
                {@html close}
            </div>
        </div>

        {#if loginMode}
            <Login 
                on:signup={toggleMode} 
                on:authenticated={loggedin}
                on:resetPass={passMode}/>
        {:else if signupMode}
            <Signup on:created={created} on:login={toggleMode}/>
        {:else if passwordMode}
            <Password on:kill={toggleMode}/>
        {/if}

    </div>

</div>
{/if}

<style>
</style>
