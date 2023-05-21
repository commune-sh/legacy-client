<script>
import { onMount, onDestroy } from 'svelte'
import { APIRequest } from '../../utils/request.js'
import { PUBLIC_BASE_URL } from '$env/static/public';
import Login from './login.svelte'
import { close } from '../../assets/icons.js'
import { page } from '$app/stores';
import Signup from './signup.svelte'
import Password from './password.svelte'
import { store } from '../../store/store.js'

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

</script>


{#if active}
<div class="mask grd" 
    on:click|self={kill}>

    <div class="modal grd-c">

        <div class="hed fl">
            <div class="c-ico grd-c pa2" on:click={kill}>
                    {@html close}
            </div>
            <div class="fl-o">
            </div>
        </div>

        {#if loginMode}
            <Login 
                on:signup={toggleMode} 
                on:authenticated={loggedin}
                on:resetPass={passMode}/>
        {:else if signupMode}
            <Signup on:login={toggleMode}/>
        {:else if passwordMode}
            <Password on:kill={toggleMode}/>
        {/if}

    </div>

</div>
{/if}

<style>
.mask {
    position: fixed;
    z-index: 10000;
    width: 100%;
    height: 100%;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    overflow-y: hidden;
    background-color: var(--mask);
}

.modal {
    z-index: 11000;
    background-color: var(--modal);
    border-radius: 9px;
    width: 550px;
    height: 650px;
    display: grid;
    grid-template-columns: auto;
    grid-template-rows: [header] auto [content] 1fr;
}


</style>
