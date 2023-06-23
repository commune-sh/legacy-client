<script>
import { onMount, createEventDispatcher, tick } from 'svelte'
import { store } from '$lib/store/store.js'
import { close } from '$lib/assets/icons.js'
import { verifyEmail, verifyCode } from '$lib/utils/request.js'
import { v4 as uuidv4 } from 'uuid';

import validator from 'validator';

const dispatch = createEventDispatcher()


let kill =() => {
    $store.startAccountVerification = false

}

async function focusEmailInput() {
    await tick()
    emailInput?.focus()
}

async function focusCodeInput() {
    await tick()
    codeInput?.focus()
}


$: active = $store.startAccountVerification 

$: if(active) {
    focusEmailInput()
}

let busy = false;

let verified = false;

let emailInput;
let emailWarning = false;

let codeInput;
let codeWarning = false;

let session;

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

async function start() {
    session = uuidv4();
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
    if(codeInput) {
        codeInput.value = ''
    }
    busy = true

    const res = await verifyEmail({
        email: emailInput.value,
        session: session,
    })

    if(res?.sent) {
        code_sent = true
        lockResend = true
        focusCodeInput()
        startCountdown()
    }
    busy = false
}

let verifying = false;
async function verify() {
    verifying = true
    const res = await verifyCode({
        email: emailInput.value,
        session: session,
        code: codeInput.value,
    })
    console.log(res)
    if(res?.error || res?.valid == false) {
        codeWarning = true
        codeInput.focus()
        return
    }

    if(res?.valid) {
        store.accountVerified(emailInput.value)
        verified = true
        verifying = false
        //kill()
    }
}

$: buttonText = code_sent ? 'Resend Code' : busy ? 'Sending...' : 'Send Code'
</script>

{#if active}
<div class="mask grd" 
    on:click|self|stopPropagation={kill}>
    <div class="modal grd-c grd pa3">

        {#if !verified}

        <div class="fl-co">
            <div class="fl">
                <div class="label fl-o grd-c">
                    Verify your account
                </div>
                    <div class="c-ico grd-c" on:click={kill}>
                        {@html close}
                </div>
            </div>
            <div class="mt4">
                Add an email address to your account to verify it.
            </div>
            <div class="mt3 fl">
                <div class="rel fl-o">
                    <input bind:this={emailInput}
                    class:red={emailWarning}
                    disabled={lockResend}
                    type="text" placeholder="your@email.com" />
                    {#if busy}
                        <div class="spinner">
                            <div class="sloader"></div>
                        </div>
                    {/if}
                </div>
                <div class="rel ml3 grd-c h100 pa1">
                    <button class="h100" 
                        disabled={busy || lockResend}
                        on:click={start}>
                            {buttonText}
                        {#if lockResend}
                            <span class="ml1">({count})</span>
                        {/if}
                    </button>
                </div>
            </div>
            {#if emailWarning}
                <div class="mt3">
                    <span class="sm">That email doesn't look right</span>
                </div>
            {/if}

            {#if code_sent}

                <div class="mt3 fl">
                    <div class="rel fl-o">
                        <input bind:this={codeInput}
                        class:red={codeWarning}
                        type="text" placeholder="your code" />
                        {#if verifying}
                            <div class="spinner">
                                <div class="sloader"></div>
                            </div>
                        {/if}
                    </div>
                    <div class="ml3 grd-c h100 pa1">
                        <button class="h100" on:click={verify}>
                            {verifying ? 'Verifying...' : 'Verify Code'}
                        </button>
                    </div>
                </div>
                {#if codeWarning}
                    <div class="mt3">
                        <span class="sm">That code could not be verified.</span>
                    </div>
                {/if}


            {/if}

        </div>

        {:else}

            <div class="pv3 fl-co">
                <div class="">
                    Your account was successfully verified.
                </div>
                <div class="mt4">
                    <button on:click={kill}>Ok</button>
                </div>
            </div>

        {/if}

    </div>
</div>
{/if}


<style>
.mask {
    transition: 0.3s;
    position: fixed;
    z-index: 1000;
    width: 100%;
    height: 100%;
    background-color: var(--mask);
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
}

.modal {
    transition: 0.2s;
    box-shadow: 0 30px 60px rgba(0,0,0,.1);
    background: var(--modal);
    border-radius: 7px;
    width: 500px;
}

.red {
    outline: 1px solid red;
}

input { 
    width: 100%;
    padding: 0.5rem;
    height: 100%;
}
.spinner {
    position: absolute;
    top: 9px;
    right: 9px;
}

.sloader {
    border-top: 2px solid var(--primary);
    border-right: 2px solid var(--primary);
    border-bottom: 2px solid var(--primary);
}
</style>

