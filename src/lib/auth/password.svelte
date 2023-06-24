<script>
import { onMount, createEventDispatcher, tick } from 'svelte'
import { goto } from '$app/navigation';
import { store } from '$lib/store/store.js'
import validator from 'validator';
import { eye, eyeoff } from '$lib/assets/icons.js'
import {passwordRecovery, verifyRecoverycode, resetPassword} from '$lib/utils/request.js'
import { v4 as uuidv4 } from 'uuid';

const dispatch = createEventDispatcher()
$: down = $store.down

onMount(() => {
    focusUsernameInput()
});

async function focusUsernameInput() {
    await tick()
    emailInput.focus()
}

async function focusCodeInput() {
    await tick()
    codeInput.focus()
}

async function focusPasswordInput() {
    await tick()
    passwordInput.focus()
}

function kill() {
    dispatch('kill', true)
}

let emailInput;
let email;
let emailWarning;

let busy = false;

let session;

let sent = false;

async function reset() {
    session = uuidv4();
    if(emailInput.value.length < 1){
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

    busy = true
    const res = await passwordRecovery({
        email: emailInput.value,
        session: session,
    })

    if(res?.sent) {
        sent = true
        focusCodeInput()
    }

    console.log(res)

    busy = false

}

function ekey(e) {
    if (e.key === 'Enter') {
        if(emailInput.value.length < 1){
            emailInput.focus()
            return
        } else {
            reset()
        }
    }

}

let codeInput;
let code;
let codeWarning;

let valid = false;
let newCode;

async function verify() {
    if(codeInput.value.length < 1){
        codeInput.focus()
        return
    }


    busy = true
    const res = await verifyRecoverycode({
        email: email,
        code: codeInput.value,
        session: session,
    })

    if(res?.valid && res?.code) {
        valid = true
        newCode = res.code
    }

    console.log(res)

    busy = false

}

$: if(valid && passwordInput) {
    focusPasswordInput()
}

let passwordInput;
let password;
let passwordWarning;

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

let success = false;

async function save() {

    busy = true
    const res = await resetPassword({
        email: email,
        code: newCode,
        session: session,
        password: passwordInput.value,
    })

    if(res?.success) {
        success = true
    }

    console.log(res)

    busy = false
}


</script>


<div class="container" >
    <div class="inner grd">
        <div class="bi grd-c fl-co">

        {#if !sent && !valid}

            <div class="grd">
                <div class="title grd-c">Reset Password</div>
            </div>
            <div class="mt3 pb2" class:warn={emailWarning}>
                <span class="label">email</span>
                {#if emailWarning}
                    <span class="sm ml2">That email doesn't look right</span>
                {/if}
            </div>
            <div class="mt1 pb2">
                <input bind:this={emailInput}
                disabled={down || busy}
                on:keyup={ekey}
                bind:value={email}
                class:red={emailWarning}
                type="text" placeholder="you@email.com" />
            </div>
            <div class="mt3 pb2 ln">
                We'll email you a code to confirm your identity.
            </div>
            <div class="loginc mt3">
                <button class="login" on:click={reset} disabled={busy || down}>
                    Send Code
                </button>
                {#if busy}
                    <div class="spinner">
                        <div class="sloader"></div>
                    </div>
                {/if}
            </div>

        {:else if sent && !valid}


            <div class="grd">
                <div class="title grd-c">Recover Password</div>
            </div>
            <div class="mt3 pb2" class:warn={codeWarning}>
                <span class="label">code</span>
                {#if codeWarning}
                    <span class="sm ml2">That code did not match</span>
                {/if}
            </div>
            <div class="mt1 pb2">
                <input bind:this={codeInput}
                disabled={down || busy}
                bind:value={code}
                class:red={codeWarning}
                type="text" placeholder="your code" />
            </div>
            <div class="mt3 pb2 ln">
                Enter the code you received in your email.
            </div>
            <div class="loginc mt3">
                <button class="login" on:click={verify} disabled={busy || down}>
                    Verify Code
                </button>
                {#if busy}
                    <div class="spinner">
                        <div class="sloader"></div>
                    </div>
                {/if}
            </div>

        {:else if valid && !success}

            <div class="grd">
                <div class="title grd-c">New Password</div>
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
            <div class="mt3 pb2 ln">
                Choose a new password.
            </div>
            <div class="loginc mt3">
                <button class="login" on:click={save} disabled={busy || down}>
                    Save
                </button>
                {#if busy}
                    <div class="spinner">
                        <div class="sloader"></div>
                    </div>
                {/if}
            </div>

        {:else if success}
            <div class="pb3">
                Your password was reset successfully.
            </div>
            <div class="pb2">
                <button class="login" on:click={kill}>
                    Login
                </button>
            </div>

        {/if}


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

.red {
    outline: 1px solid red;
}

</style>
