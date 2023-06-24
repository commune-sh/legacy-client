<script>
import { onMount, createEventDispatcher } from 'svelte'
import { PUBLIC_API_URL, PUBLIC_APP_NAME } from '$env/static/public';
import { store } from '$lib/store/store.js'
import { eye, eyeoff } from '$lib/assets/icons.js'
import { APIRequest } from '$lib/utils/request.js'

$: down = $store.down

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
        url: `${PUBLIC_API_URL}/account/login`,
        body: {
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

            let accounts = localStorage.getItem('accounts')
            if(!accounts) {
                let accounts = []
                accounts.push({
                    username: resp.credentials.username,
                    email: resp.credentials.email,
                    display_name: resp.credentials.display_name,
                    avatar_url: resp.credentials.avatar_url,
                    token: resp.access_token,
                })
                localStorage.setItem('accounts', JSON.stringify(accounts))
            }


            const cookieValue = `${encodeURIComponent(resp.access_token)}; expires=Fri, 31 Dec 9999 23:59:59 GMT; path=/`;
            document.cookie = `token=${cookieValue}`;
            store.saveCredentials(resp.credentials)
            //store.saveRooms(resp.rooms)
            store.saveSpaces(resp.spaces)
            store.isAuthenticated()
            dispatch('authenticated', true)
            store.spacesFetched()
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
                <div class="title grd-c">Log In</div>
            </div>
            <div class="mt4 pb2" class:warn={usernameWarning || showInvalid}>
                <span class="label">username or email</span>
                {#if usernameWarning}
                    <span class="sm ml2">Username can't be empty</span>
                {/if}
                {#if showInvalid}
                    <span class="sm ml2">Invalid Username or Password</span>
                {/if}
                {#if passwordWarning}
                    <span class="sm ml2">Password must be 8 characters long</span>
                {/if}
            </div>
            <div class="mt1 pb2">
                <input bind:this={usernameInput}
                disabled={down}
                on:keyup={ukey}
                on:keydown={rlw}
                type="text" placeholder="" />
            </div>
            <div class="mt3 pb2 label">
                password
            </div>
            <div class="passc">
                <input bind:this={passwordInput}
                disabled={down}
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
            <div class="mt3">
                <span class="href sm" on:click={resetPass}>Forgot Password?</span>
            </div>
            <div class="loginc mt4">
                <button class="login" on:click={login} disabled={busy || down}>
                    {busy ? 'Logging in...' : 'Log In'}
                </button>
                {#if busy}
                    <div class="spinner">
                        <div class="sloader"></div>
                    </div>
                {/if}
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

.bi {
    width: 450px;
}

.ts {
    height: 60px;
}

.warn {
    color: red;
}

input {
    padding: 12px;
    width: 100%;
    font-size: 17px;
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


.loginc {
    position: relative;
}

.spinner {
    position: absolute;
    top: 9px;
    right: 9px;
}

@media screen and (max-width: 550px) {
    .bi {
        width: 100%;
    }
}

</style>
