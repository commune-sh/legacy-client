<script>
import { logo }  from '../../assets/logo.js'
import { onMount, createEventDispatcher } from 'svelte'
import { PUBLIC_BASE_URL } from '$env/static/public';
import { store } from '../../store/store.js'

import { APIRequest } from '../../utils/request.js'

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


<div class="b" >
    <div class="">
    </div>
    <div class="grd">
        <div class="bi grd-c fl-co">
            <div class="ts grd">
                <div class="l-c grd grd-c">
                    <div class="l-c-i grd-c">
                        {@html logo}
                    </div>
                </div>
            </div>
            <div class="ts">
                {#if usernameWarning}
                    <div class="invalid">Username can't be empty</div>
                {:else if passwordWarning}
                    <div class="invalid">Password must be 8 characters long</div>
                {:else if showInvalid}
                    <div class="invalid">Invalid Username or Password</div>
                {/if}
            </div>
            <div class="mt3 pb2">
                <input bind:this={usernameInput}
                on:keyup={ukey}
                on:keydown={rlw}
                type="text" placeholder="Username or Email" />
            </div>
            <div class="pb3">
                <input bind:this={passwordInput}
                on:keyup={pkey}
                on:keydown={plw}
                type="password" placeholder="Password" />
            </div>
            <div class="pb4 fl">
                <div class="">
                    <button on:click={login} disabled={busy}>Login</button>
                </div>
                <div class="fl-o">
                </div>
                <div class="sm grd">
                    <a class="grd-c" href="" on:click={resetPass}>Forgot Password?</a>
                </div>
            </div>
            <div class="ts">
            </div>
        </div>
    </div>
    <div class="grd">
        <div class="grd-c">
            <button on:click={signup}>Sign Up</button>
        </div>
    </div>
</div>

<style>
.b {
    display: grid;
    grid-template-columns: auto;
    grid-template-rows: [header] 40px [content] 1fr [footer] 40px;
    place-self: stretch;
    height: 100%;
}

.bi {
    width: 400px;
        padding: 2rem;
}

.ts {
    height: 60px;
}

input {
    padding: 12px;
    width: 100%;
    font-size: 17px;
}

input:focus {
        outline: 1px solid var(--primary);
}


.invalid {
    padding: 1rem;
    background-color: var(--primary);;
    outline: 1px solid var(--primary);
    border-radius: 3px;
    text-align: center;
}

@media screen and (max-width: 600px) {
    .bi {
        width: 100%;
    }
}
.l-c {
    height: 38px;
    width: 38px;
    background-color: var(--logo-bg);
    border-radius: 6px;
    transition: 0.1s;
}

.l-c-a {
    background-color: var(--primary);
}


.l-c-i {
    height: 20px;
    width: 20px;
    fill: var(--logo-shade-1);
}

.l-c-t {
    fill: var(--logo-shade-2);
}

</style>
