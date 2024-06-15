<script>
import { onMount, onDestroy } from 'svelte'
import { close, earth, lock } from '$lib/assets/icons.js'
import { createSpace } from '$lib/utils/request.js'
import { PUBLIC_API_URL, PUBLIC_BASE_URL } from '$env/static/public';
import { goto } from '$app/navigation';
import { page } from '$app/stores';
import { tick } from 'svelte'
import { store } from '$lib/store/store.js'
import Avatar from '$lib/components/avatar/avatar.svelte'
import Toggle from '$lib/components/toggle/toggle.svelte'

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
    usernameWarning = false;
    busy = false;
    showError = false;
    error = null;

}

onMount(() => {
})

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
    if(name == null || name.length < 1){
        nameInput.focus()
        return
    }
    if(isPublic) {
        if(username == null || username.length < 1){
            usernameInput.focus()
            return
        }
    }

    busy = true

    let space = {
        name: name,
        topic: topic,
    }
    if(isPublic) {
        space.username = username
    }

    if(!isPublic) {
        space.private = true
    }

    if(avatar) {
        space.avatar_url = avatar
    }

    const res = await createSpace(space)

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
        error = res.error
    }
}
let showError = false;
let error;

let isPublic = true;

function togglePublic() {
    isPublic = !isPublic
    if(!isPublic) {
        username = null
    }
}

let avatar = null;
function avatarUploaded(e) {
    avatar = e.detail
}
function avatarRemoved(e) {
    avatar = null
}

</script>

{#if active}
<div class="mask grd" 
    on:click|self={kill}>

    <div class="modal grd-c grd">
        <div class="create grd-c sel-no">

            <div class="title grd-c pt3 ph3 mv2">
                    Create Space
            </div>

            <div class="con fl-co">

                <div class="mt3 pb2">
                    <Avatar 
                        on:removed={avatarRemoved}
                        on:uploaded={avatarUploaded}/>
                </div>

                <div class="pb2">
                    <span class="label">Name</span>
                </div>
                <div class="mt1 pb2">
                    <input bind:this={nameInput}
                    bind:value={name}
                    disabled={busy}
                    type="text" placeholder="My community" />
                </div>

                <div class="mt3 pb2">
                    <div class="">
                        <div class="pit fl ph3 pv2 mb1" 
                            on:click={togglePublic}
                            class:active={isPublic}>
                            <div class="grd-c mr3">
                                <div class="ico-s grd-c">
                                    {@html earth}
                                </div>
                            </div>
                            <div class="fl-co">
                                <div class="ti">
                                    Public
                                </div>
                                <div class="mt2 des">
                                    Open space for that anyone can view and join
                                </div>
                            </div>
                        </div>
                        <div class="pit fl ph3 pv2"
                            on:click={togglePublic}
                            class:active={!isPublic}>
                            <div class="grd-c mr3">
                                <div class="ico-s grd-c">
                                    {@html lock}
                                </div>
                            </div>
                            <div class="fl-co">
                                <div class="ti">
                                        Private
                                </div>
                                <div class="mt2 des">
                                    Invite only space that is not visible to others
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {#if isPublic}
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
                <div class="mt1 preview pb1">
                        {PUBLIC_BASE_URL}/{username ? username : 'mycommunity'}
                </div>
                {/if}

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
                <div class="ln mv3 warn">
                    {error}
                </div>
                {/if}

                <div class="createc mt3 pb2">
                        <button on:click={create} disabled={busy}>
                            {busy ? 'Creating Space...' : 'Create Space'}
                        </button>
                {#if busy}
                    <div class="spinner">
                        <div class="sloader"></div>
                    </div>
                {/if}
                </div>
            </div>

        </div>

            <div class="c-ico close" on:click={kill}>
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

.ln {
    line-height: 1.5;
}
.preview {
    font-size: small;
    color: var(--text-light);
}
.ti {
    font-weight: 500;
}
.pit {
    border: 1px solid var(--border-1);
    border-radius: 5px;
    cursor: pointer;
}
.pit:hover {
    border: 1px solid var(--shade-3);
}
.des {
    font-size: 13px;
    color: var(--text-light);
}
.active {
    border: 1px solid var(--primary);
}
.active:hover {
    border: 1px solid var(--primary);
}
</style>
