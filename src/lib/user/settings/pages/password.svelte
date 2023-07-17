<script>
import { onMount, createEventDispatcher, tick } from 'svelte'
import { goto } from '$app/navigation';
import { store } from '$lib/store/store.js'
import validator from 'validator';
import { eye, eyeoff } from '$lib/assets/icons.js'
import {updatePassword} from '$lib/utils/request.js'
import { v4 as uuidv4 } from 'uuid';

const dispatch = createEventDispatcher()
$: down = $store.down

onMount(() => {
    focusPasswordInput()
});


async function focusPasswordInput() {
    await tick()
    passwordInput.focus()
}

async function focusNewPasswordInput() {
    await tick()
    newPasswordInput.focus()
}

function kill() {
    dispatch('kill', true)
}


let busy = false;


let sent = false;

let passwordInput;
let passwordWarning;

let newPasswordInput;
let newPasswordWarning;

let showPass = false
let showNewPass = false

function toggle() {
    showPass = !showPass
    if(showPass) {
        passwordInput.type = 'text'
        newPasswordInput.type = 'text'
    } else {
        passwordInput.type = 'password'
        newPasswordInput.type = 'password'
    }
}

function togglePass() {
    toggle()
    passwordInput.focus()
}

function toggleNewPass() {
    toggle()
    newPasswordInput.focus()
}

let success = false;

let matchWarning = false

async function save() {

    if(passwordInput.value == '') {
        focusPasswordInput()
        return
    }
    if(passwordInput.value.length < 8) {
        passwordWarning = true
        return
    } else {
        passwordWarning = false
    }

    if(newPasswordInput.value == '') {
        focusNewPasswordInput()
        return
    }
    if(newPasswordInput.value.length < 8) {
        newPasswordWarning = true
        return
    } else {
        newPasswordWarning = false
    }

    busy = true

    const res = await updatePassword({
        password: passwordInput.value,
        new: newPasswordInput.value,
    })

    if(res?.success) {
        success = true
        passwordInput.value = ''
        newPasswordInput.value = ''
    }

    console.log(res)

    busy = false
}


</script>


<div class="container" >
    <div class="inner grd">
        <div class="bi fl-co">

            <div class="mt3 pb2" class:warn={passwordWarning}>
                <span class="label">current password</span>
                {#if passwordWarning}
                    <span class="sm ml2">Password needs to be longer</span>
                {/if}
            </div>
            <div class="passc pb2">
                <input bind:this={passwordInput}
                class:red={passwordWarning}
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

            <div class="mt2 pb2" class:warn={newPasswordWarning}>
                <span class="label">new password</span>
                {#if newPasswordWarning}
                    <span class="sm ml2">Password needs to be longer</span>
                {/if}
            </div>
            <div class="passc pb2">
                <input bind:this={newPasswordInput}
                class:red={newPasswordWarning}
                type="password" />
                <div class="showpass ico" 
                    class:col={showPass}
                    on:click={toggleNewPass}>
                    {#if showPass}
                        {@html eye}
                    {:else}
                        {@html eyeoff}
                    {/if}
                </div>
            </div>

            <div class="loginc mt2">
                <button class="login" on:click={save} disabled={busy || down}>
                    Update Password
                </button>
                {#if busy}
                    <div class="spinner">
                        <div class="sloader"></div>
                    </div>
                {/if}
            </div>

            {#if success}
                <div class="mt3">
                    Your password has been updated.
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


.login {
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
    padding: 0.5rem;
    width: 100%;
}

.passc {
    position: relative;
}

.showpass {
    position: absolute;
    right: 10px;
    top: 10px;
    cursor: pointer;
    height: 18px;
    width: 18px;
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
