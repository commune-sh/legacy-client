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
    usernameInput.focus();
});

function signup() {
    dispatch('signup', true)
}

function resetPass() {
    dispatch('resetPass', true)
}

let usernameInput;
let passwordInput;


let busy = false;

let usernameWarning = false;
let passwordWarning = false;

let showInvalid = false;

function login() {

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
                <div class="title grd-c">Log In</div>
            </div>
                {#if passwordWarning}
                    <div class="invalid">Password must be 8 characters long</div>
                {:else if showInvalid}
                    <div class="invalid">Invalid Username or Password</div>
                {/if}
            <div class="mt4 pb2" class:warn={usernameWarning || showInvalid}>
                <span class="label">username or email</span>
                {#if usernameWarning}
                    <span class="sm"> - <i>Username can't be empty</i></span>
                {/if}
            </div>
            <div class="mt1 pb2">
                <input bind:this={usernameInput}
                on:keyup={ukey}
                on:keydown={rlw}
                type="text" placeholder="" />
            </div>
            <div class="mt3 pb2 label">
                password
            </div>
            <div class="">
                <input bind:this={passwordInput}
                on:keyup={pkey}
                on:keydown={plw}
                type="password" />
            </div>
            <div class="mt3">
                <span class="href sm" on:click={resetPass}>Forgot Password?</span>
            </div>
            <div class="mt4">
                <button class="login" on:click={login} disabled={busy}>Login</button>
            </div>
            <div class="mt3">
                <span class="href sm" on:click={signup}>Need an account? Sign
                    up!</span>
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

.login {
    width: 100%;
    height: 40px;
}

.title {
    font-size: 1.3rem;
    font-weight: bold;
    color: var(--text-1);
}

.bi {
    width: 450px;
}

.ts {
    height: 60px;
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
