<script>
import { onMount, onDestroy } from 'svelte'
import { close } from '$lib/assets/icons.js'
import { createSpace } from '$lib/utils/request.js'
import { PUBLIC_API_URL } from '$env/static/public';
import { goto } from '$app/navigation';
import { page } from '$app/stores';
import { tick } from 'svelte'
import { store } from '$lib/store/store.js'

let active = false;

let kill =() => {
    if(busy) {
        return
    }
    active = false;
    store.toggleCreateSpace()
    name = null;
    username = null;
    topic = null;

}

$: if($store.creatingSpace) {
    active = true
    focusNameInput()
}

async function focusNameInput() {
    await tick()
    nameInput.focus()
}

async function focusUsernameInput() {
    await tick()
    usernameInput.focus()
}

let busy = false;

let nameInput;
let name;

let usernameInput;
let username;


let topicInput;
let topic;


function validateUsername(e) {
    const letters = /^[0-9a-zA-Z]+$/;
    if(!e.key.match(letters)){
        e.preventDefault()
    }
}

let usernameWarning = false;

async function create() {
    busy = true
    if(name == null || name.length < 1){
        nameInput.focus()
        return
    }
    if(username == null || username.length < 1){
        usernameInput.focus()
        return
    }
    const res = await createSpace({
        name: name,
        username: username,
        topic: topic
    })
    console.log(res)
    if(res?.exists) {
        busy = false
        usernameWarning = true
        focusUsernameInput()
    }
    if(res?.success && res?.space?.alias) {
        store.addSpace(res.space)
        store.addRoom(res.space.room_id)
        goto(`/${res.space.alias}`)
        busy = false
        kill()
    }
    if(res?.error) {
        busy = false
        showError = true
    }
}
let showError = false;

</script>

{#if active}
<div class="mask grd" 
    on:click|self={kill}>

    <div class="modal grd-c grd">
        <div class="create grd-c">

            <div class="title grd-c pt3 ph3 mv2">
                    Create Space
            </div>

            <div class="con fl-co">
                <div class="mt3 pb2">
                    <span class="label">Name</span>
                </div>
                <div class="mt1 pb2">
                    <input bind:this={nameInput}
                    bind:value={name}
                    disabled={busy}
                    type="text" placeholder="My community" />
                </div>
                <div class="mt3 pb2" class:warn={usernameWarning}>
                    <span class="label">Username</span>
                    {#if usernameWarning}
                        <span class="sm ml2">That username is not available</span>
                    {/if}
                </div>
                <div class="mt1 pb2">
                    <input bind:this={usernameInput}
                    bind:value={username}
                    on:keypress={validateUsername}
                    disabled={busy}
                    type="text" placeholder="mycommunity" />
                </div>
                <div class="mt3 pb2">
                    <span class="label">topic</span>
                </div>
                <div class="mt1 pb2">
                    <textarea bind:this={topicInput}
                    bind:value={topic}
                    disabled={busy}
                    placeholder="About my community."></textarea>
                </div>

                {#if showError}
                <div class="mv3 warn">
                    There was an error. Your space could not be created.
                </div>
                {/if}

                <div class="createc mt3 pb2">
                        <button on:click={create} disabled={busy}>
                            {busy ? 'Creating...' : 'Create'}
                        </button>
                {#if busy}
                    <div class="spinner">
                        <div class="sloader"></div>
                    </div>
                {/if}
                </div>
            </div>

        </div>

            <div class="c-ico close">
                {@html close}
            </div>
    </div>

</div>
{/if}

<style>
.create {
    width: 500px;
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr auto;
    position: relative;
}

.title {

}

input {
    padding: 12px;
    width: 100%;
}

textarea {
    padding: 12px;
    width: 100%;
    height: 100px;
}

button {
    width: 100%;
    height: 40px;
}

.createc {
    position: relative;
}

.spinner {
    position: absolute;
    top: 9px;
    right: 9px;
}
.close  {
    display: none;
    position: absolute;
    top: 1rem;
    left: 1rem;
}

.c-ico {
    height: 30px;
    width: 30px;
}

.con {
    padding-right: 2rem;
    padding-left: 2rem;
    padding-bottom: 2rem;
}

@media screen and (max-width: 550px) {
    .close  {
        display: block;
    }
    .create {
        width: 100%;
    }
    .con {
        padding-right: 1rem;
        padding-left: 1rem;
        padding-bottom: 1rem;
    }

}

.warn {
    color: red;
}

</style>
