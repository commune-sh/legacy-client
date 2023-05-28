<script>
import { onMount, createEventDispatcher } from 'svelte'
import { PUBLIC_BASE_URL } from '$env/static/public';
import { store } from '$lib/store/store.js'

import { APIRequest } from '$lib/utils/request.js'

const dispatch = createEventDispatcher()

let kill =() => {
    dispatch('kill', true)
}

onMount(() => {
    emailInput.focus();
});

function login() {
    dispatch('login', true)
}

let emailInput
let usernameInput;
let passwordInput;


let busy = false;

let usernameWarning = false;
let passwordWarning = false;

let showInvalid = false;

function create() {

    if(usernameInput.value.length < 1){
        usernameWarning = true
        usernameInput.focus()
        return
    }

    if(passwordInput.value.length < 8) {
        passwordInput.focus()
        return
    }


    busy = true

    APIRequest({
        url: `${PUBLIC_BASE_URL}/account/login`,
        data: {
            username: usernameInput.value, 
            password: passwordInput.value,
        }
    })
      .then(resp => {

        console.log('Response:', resp);

        if(resp?.authenticated == false) {
            showInvalid = true
            usernameInput.focus()
        } else if (resp?.authenticated == true && resp?.access_token && resp?.credentials) {
            localStorage.setItem('access_token', resp.access_token)
            const cookieValue = `${encodeURIComponent(resp.access_token)}; expires=Fri, 31 Dec 9999 23:59:59 GMT; path=/`;
            document.cookie = `token=${cookieValue}`;
            store.saveCredentials(resp.credentials)
            store.isAuthenticated()
            dispatch('authenticated', true)
        }

        busy = false
      })
      .catch(error => {
        console.error('Error:', error);
        busy = false
      });
}

function rlw() {
    if(usernameInput.value.length > 0) {
        usernameWarning = false
    }
}

function ukey(e) {
    if(usernameInput.value.length < 3) return
    if (e.key === 'Enter' && passwordInput.value.length <8) {
        passwordInput.focus()
    }

}

function plw() {
    if(passwordInput.value.length >= 8) {
        passwordWarning = false
    }
}

function pkey(e) {
    if (e.key === 'Enter') {
        if(passwordInput.value.length < 8){
            passwordWarning = true
            passwordInput.focus()
            return
        } else {
            login()
        }
    }

}

</script>


<div class="container" >
    <div class="inner grd">
        <div class="bi grd-c fl-co">
            <div class="grd">
                <div class="title grd-c">Sign Up</div>
            </div>
            <div class="mt3 pb2">
                <span class="label">email</span>
            </div>
            <div class="mt1 pb2">
                <input bind:this={emailInput}
                type="text" placeholder="" />
            </div>
            <div class="mt3 pb2">
                <span class="label">username</span>
            </div>
            <div class="mt1 pb2">
                <input bind:this={usernameInput}
                type="text" placeholder="" />
            </div>
            <div class="mt3 pb2 label">
                password
            </div>
            <div class="pb2">
                <input bind:this={passwordInput}
                on:keyup={pkey}
                on:keydown={plw}
                type="password" />
            </div>
            <div class="mt4">
                <button class="create" on:click={create} disabled={busy}>Create
                    Account</button>
            </div>
            <div class="mt3">
                <span class="href sm" on:click={login}>Already have an account?</span>
            </div>
        </div>

    </div>
</div>

<style>
.container {
    display: grid;
    grid-template-columns: auto;
    grid-template-rows: auto;
    place-self: stretch;
    height: 100%;
}

.inner {
    margin-right: 2rem;
    margin-left: 2rem;
    margin-bottom: 2rem;
}

.create {
    width: 100%;
    height: 40px;
}

.bi {
    width: 450px;
}

.warn {
    color: var(--primary);
}

input {
    padding: 12px;
    width: 100%;
    font-size: 17px;
}


.req {
    color: red;
    vertical-align: super;
    font-size: 0.7rem;
    margin-left: 0.25rem;
}

.ln {
    font-size: small;
}

.invalid {
    padding: 1rem;
    outline: 1px solid var(--primary);
    border-radius: 3px;
    text-align: center;
}

.label {
    font-size: small;
    font-weight: bold;
    text-transform: uppercase;
    color: var(--text-2);
}

@media screen and (max-width: 550px) {
    .bi {
        width: 100%;
    }
}

</style>
