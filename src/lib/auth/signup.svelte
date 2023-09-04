<script>
import { onMount, createEventDispatcher, tick } from 'svelte'
import { PUBLIC_API_URL, PUBLIC_BASE_URL } from '$env/static/public';
import { store } from '$lib/store/store.js'
import { debounce } from '$lib/utils/utils.js'
import { eye, eyeoff } from '$lib/assets/icons.js'
import { APIRequest, validateEmail } from '$lib/utils/request.js'
import { sendCode, verifyEmail } from '$lib/utils/request.js'
import { v4 as uuidv4 } from 'uuid';
import jwtDecode from 'jwt-decode';

import validator from 'validator';

$: require_email = $store.features?.require_email


$: down = $store.down

$: signupDisabled = $store.features?.registration_enabled === false

const dispatch = createEventDispatcher()

let kill =() => {
    dispatch('kill', true)
}

let gloaded = false

onMount(() => {
    if(require_email && emailInput) {
        focusEmailInput()
    } else {
        focusUsernameInput()
    }

    const script = document.createElement('script');
    script.src = "https://accounts.google.com/gsi/client"
    //script.async = true;
    //script.defer = true;
    document.body.appendChild(script);
    gloaded = true
});

async function focusUsernameInput() {
    await tick()
    usernameInput.focus()
}

async function focusEmailInput() {
    await tick()
    emailInput.focus()
}

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
let provider_forbidden = false;

function validateUsername(e) {
    if (/[A-Z]/.test(e.key)) {
        const key = e.key.toLowerCase();
        e.preventDefault();
        usernameInput.value += key;
        return
    }

    const letters = /^[0-9a-zA-Z]+$/;
    if(!e.key.match(letters)){
        e.preventDefault()
    }
}

let showError = false;
let errorMsg;

let letterWarning;

let verified = false;

let session;
let verifying = false;

async function send() {
    session = uuidv4();
    if(signupDisabled) {
        return
    }

    if(emailInput.value.length < 1){
        emailInput.focus()
        return
    }

    emailWarning = false
    busy = true

    let validEmail = validator.isEmail(emailInput?.value)
    if(!validEmail) {
        busy = false
        emailWarning = true
        emailInput.focus()
        return
    }

    const res = await validateEmail(emailInput.value)
    console.log(res)
    if(res?.provider_forbidden) {
        busy = false
        provider_forbidden = true
        focusEmailInput()
        return
    }

    const resp = await sendCode({
        email: emailInput.value,
        session: session,
    })

    console.log(resp)
    if(resp?.sent) {
        code_sent = true
        lockResend = true
        focusCodeInput()
        startCountdown()
    }

    provider_forbidden = false
    busy = false
}

async function focusCodeInput() {
    await tick()
    codeInput?.focus()
}

let codeInput;
let code;
let codeWarning = false;

let code_sent = false;
let lockResend = false;


let count = 60

function startCountdown() {
    let interval = setInterval(() => {
        count--
        if(count < 1) {
            clearInterval(interval)
            lockResend = false
        }
    }, 1000)
}

async function verify() {

    if(codeInput.value.length < 1){
        codeInput.focus()
        return
    }

    verifying = true

    const res = await verifyEmail({
        email: emailInput.value,
        session: session,
        code: codeInput.value,
    })

    console.log(res)
    if(res.valid) {
        verified = true
        focusUsernameInput()
    } else {
        codeWarning = true
        codeInput.focus()
    }
}


async function create() {
    emailWarning = false

    if(signupDisabled) {
        return
    }

    if(usernameInput.value.length < 2){
        usernameWarning = true
        usernameInput.focus()
        return
    }

    const regex = /[a-zA-Z]/;
    const p = regex.test(usernameInput.value);
    if(!p) {
        letterWarning = true
        usernameInput.focus()
        return
    } else {
        letterWarning = false
    }

    if(passwordInput.value.length < 8) {
        passwordWarning = true
        passwordInput.focus()
        return
    }

    busy = true

    let body = {
        username: usernameInput.value, 
        password: passwordInput.value,
    }

    if(require_email && verified) {
        body.email = emailInput.value
        body.session = session
        body.code = code
    }

    APIRequest({
        url: `${PUBLIC_API_URL}/account`,
        body: body,
    })
      .then(resp => {

        console.log('Response:', resp);

        if(resp?.created === true) {
            localStorage.setItem('access_token', resp.access_token)
            const hostname = PUBLIC_BASE_URL.includes('http') ? 
                PUBLIC_BASE_URL.replace('http://', '') : 
                PUBLIC_BASE_URL.replace('https://', '')

            const cookieValue = `${encodeURIComponent(resp.access_token)}; expires=Fri, 31 Dec 9999 23:59:59 GMT; path=/; domain=.${hostname}`;
            document.cookie = `token=${cookieValue}`;
            store.saveCredentials(resp.credentials)
            store.saveRooms(resp.rooms)
            store.saveSpaces(resp.spaces)
            store.isAuthenticated()
            dispatch('created', true)
        } else if(!resp?.created && resp?.error){
            showError = true
            errorMsg = resp.error
        }
        if(resp?.provider_forbidden) {
            provider_forbidden = true
        }

        busy = false
      })
      .catch(error => {
        console.error('Error:', error);
        busy = false
      });
}


let availableWarning = false;

function checkAvailability() {
    debounce(usernameAvailable, 250)
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

window.handleGauth = (e) => {
    console.log(e)
    if(e?.credential) {
        const decoded = jwtDecode(e.credential);
        console.log(decoded)
    }
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

            {#if require_email}

            <div class="mt3 pb2" class:warn={emailWarning}>
                <span class="label">email</span>
                {#if emailWarning}
                    <span class="sm ml2">That email doesn't look right</span>
                {/if}
            </div>
            <div class="mt1 pb2">
                <input bind:this={emailInput}
                disabled={down || busy || verified}
                class:red={emailWarning}
                type="text" placeholder="" />
            </div>
                {#if provider_forbidden}
                <div class="mt2 pb2 warn pvd">
                    Please use a personal or work email.
                </div>
                {/if}
                {#if code_sent && !verified}

                    <div class="mt3 fl">
                        <div class="rel fl-o">
                            <input bind:this={codeInput}
                            bind:value={code}
                            class:red={codeWarning}
                            type="text" placeholder="your code" />
                            {#if verifying}
                                <div class="spinner">
                                    <div class="sloader"></div>
                                </div>
                            {/if}
                        </div>
                    </div>

                    {#if codeWarning}
                        <div class="mt3">
                            <span class="sm">That code could not be verified.</span>
                        </div>
                    {:else}
                        <div class="mt3">
                            <span class="sm">We sent you a code. Please check
                                your email.</span>
                        </div>
                    {/if}


                {/if}
                <div class="createc mt3">
                    {#if !verified}
                        {#if code_sent}
                            <button class="create" on:click={verify} 
                                disabled={busy || down}>
                                    Verify Code
                            </button>
                        {:else}
                            <button class="create" on:click={send} 
                                disabled={busy || down}>
                                Send Verification Code
                            </button>
                        {/if}
                    {/if}
                    {#if busy && !signupDisabled}
                        <div class="spinner">
                            <div class="sloader"></div>
                        </div>
                    {/if}
                </div>

            {/if}


            {#if !require_email || (require_email && verified)}
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
                on:keyup={checkAvailability}
                on:keypress={validateUsername}
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
            {#if showError && errorMsg}
                <div class="pt3 warn">
                    {errorMsg}
                </div>
            {/if}
            {#if letterWarning}
                <div class="pt3 warn">
                    Username should have at least one letter.
                </div>
            {/if}
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
            {/if}
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

.pvd {
    line-height: 1.5;
}

@media screen and (max-width: 550px) {
    .bi {
        width: 100%;
    }
}

.hide {
    visibility: none;
}

.discord {
    background: #5865f2;
}
</style>
