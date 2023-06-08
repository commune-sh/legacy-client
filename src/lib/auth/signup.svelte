<script>
import { onMount, createEventDispatcher } from 'svelte'
import { PUBLIC_API_URL, PUBLIC_APP_NAME } from '$env/static/public';
import { store } from '$lib/store/store.js'
import { debounce } from '$lib/utils/utils.js'
import { eye, eyeoff } from '$lib/assets/icons.js'
import { APIRequest } from '$lib/utils/request.js'

import validator from 'validator';


$: down = $store.down

$: signupDisabled = $store.features?.registration_enabled === false

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


$: busy = signupDisabled || false;

let emailWarning = false;
let usernameWarning = false;
let passwordWarning = false;

let showInvalid = false;


function create() {
    if(emailInput.value.length < 1){
        //emailWarning = true
        emailInput.focus()
        return
    }

    let validEmail = validator.isEmail(emailInput?.value)
    if(!validEmail) {
        emailWarning = true
        emailInput.focus()
        return
    }
    emailWarning = false


    if(usernameInput.value.length < 3){
        usernameWarning = true
        usernameInput.focus()
        return
    }

    if(passwordInput.value.length < 8) {
        passwordWarning = true
        passwordInput.focus()
        return
    }


    busy = true

    APIRequest({
        url: `${PUBLIC_API_URL}/account`,
        body: {
            email: emailInput.value, 
            username: usernameInput.value, 
            password: passwordInput.value,
        }
    })
      .then(resp => {

        console.log('Response:', resp);

        if(resp?.created === true) {
            localStorage.setItem('access_token', resp.access_token)
            const cookieValue = `${encodeURIComponent(resp.access_token)}; expires=Fri, 31 Dec 9999 23:59:59 GMT; path=/`;
            document.cookie = `token=${cookieValue}`;
            store.saveCredentials(resp.credentials)
            store.saveRooms(resp.rooms)
            store.saveSpaces(resp.spaces)
            store.isAuthenticated()
            dispatch('created', true)
        }

        busy = false
      })
      .catch(error => {
        console.error('Error:', error);
        busy = false
      });
}


let availableWarning = false;

function validateUsername() {
    debounce(usernameAvailable, 500)
}


function usernameAvailable() {
    const username = usernameInput?.value
    if(username.length == 0) return
    APIRequest({
        url: `${PUBLIC_API_URL}/account/username/${username}`,
        method: 'GET',
    })
      .then(resp => {

        console.log('Response:', resp);

        if(resp?.available == false) {
            availableWarning = true
        } else {
            availableWarning = false
            usernameWarning = false
        }

      })
      .catch(error => {
        console.error('Error:', error);
      });
}


function rlw() {
    if(usernameInput.value.length > 2) {
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
            create()
        }
    }

}

let showPass = false

function togglePass() {
    showPass = !showPass
    if(showPass) {
        passwordInput.type = 'text'
    } else {
        passwordInput.type = 'password'
    }
    passwordInput.focus()
}

</script>



<div class="container" >
    <div class="inner grd">
        <div class="bi grd-c fl-co">
            <div class="grd">
                <div class="title grd-c">Sign Up</div>
            </div>
            {#if signupDisabled}
                <div class="grd-c mt4 mb3 warn">
                    Signup is currently disabled
                </div>
            {/if}
            <div class="mt3 pb2" class:warn={emailWarning}>
                <span class="label">email</span>
                {#if emailWarning}
                    <span class="sm ml2">That email doesn't look right</span>
                {/if}
            </div>
            <div class="mt1 pb2">
                <input bind:this={emailInput}
                disabled={down || busy}
                class:red={emailWarning}
                type="text" placeholder="" />
            </div>
            <div class="mt3 pb2" class:warn={availableWarning || usernameWarning}>
                <span class="label">username</span>
                {#if availableWarning}
                    <span class="sm ml2">That username is not available</span>
                {/if}
                {#if usernameWarning}
                    <span class="sm ml2">Username needs to be longer</span>
                {/if}
            </div>
            <div class="mt1 pb2">
                <input bind:this={usernameInput}
                disabled={down || busy}
                class:red={availableWarning || usernameWarning}
                on:keyup={ukey}
                on:keydown={rlw}
                on:keyup={validateUsername}
                type="text" placeholder="" />
            </div>
            <div class="mt3 pb2" class:warn={passwordWarning}>
                <span class="label">password</span>
                {#if passwordWarning}
                    <span class="sm ml2">Password needs to be longer</span>
                {/if}
            </div>
            <div class="passc pb2">
                <input bind:this={passwordInput}
                disabled={down || busy}
                class:red={passwordWarning}
                on:keyup={pkey}
                on:keydown={plw}
                type="password" />
                <div class="showpass ico" 
                    class:col={showPass}
                    on:click={togglePass}>
                    {#if showPass}
                        {@html eye}
                    {:else}
                        {@html eyeoff}
                    {/if}
                </div>
            </div>
            <div class="createc mt4">
                <button class="create" on:click={create} disabled={busy || down}>
                    {busy && !signupDisabled ? 'Creating Account...' : 'Create Account'}
                </button>
                {#if busy && !signupDisabled}
                    <div class="spinner">
                        <div class="sloader"></div>
                    </div>
                {/if}
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
    color: red;
}

input {
    padding: 12px;
    width: 100%;
    font-size: 17px;
}


.red {
    outline: 1px solid red;
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


.createc {
    position: relative;
}

.spinner {
    position: absolute;
    top: 9px;
    right: 9px;
}

.passc {
    position: relative;
}
.showpass {
    position: absolute;
    right: 10px;
    top: 12px;
    cursor: pointer;
    height: 22px;
    width: 22px;
    fill: var(--text-2);
}
.col {
    fill: var(--primary);
}

@media screen and (max-width: 550px) {
    .bi {
        width: 100%;
    }
}

</style>
