<script>
import { store } from '$lib/store/store.js'
import { goto } from '$app/navigation';
import { createSpaceRoom } from '$lib/utils/request.js'
import { page } from '$app/stores';
import { tick } from 'svelte'
import { addLine, discuss } from '$lib/assets/icons.js'

$: state = $store?.states[$page?.params?.space]

let active = false;
let busy = false;

function activate() {
    if(active) {
        return;
    }
    active = true;
    if(!$store.addingRoom) {
        $store.addingRoom = true
    }
}

let nameInput;
let name;

$: if(active) {
    focusNameInput();
}

async function focusNameInput() {
    await tick();
    nameInput.focus();
}

function validate(e) {
    if (event.key === 'Escape' || event.key === 'Esc') {
        kill()
        return
    }

    if(e.key == 'Enter' && !exists) {
        busy = true
        addRoom();
        return
    }

    const letters = /^[0-9a-zA-Z-]+$/;
    if(!e.key.match(letters)){
        e.preventDefault()
    }

}

function check(e) {
    let index = state?.children?.findIndex(x => x.alias == nameInput.value)
    if(index > -1) {
        exists = true
    } else {
        exists = false
    }
}

let exists = false;

async function addRoom() {
    const res = await createSpaceRoom({
        room_id: state.room_id,
        name: nameInput.value
    })
    console.log(res)
    if(res?.success && res?.room_id && res?.state) {
        store.addRoomToSpaceState($page.params.space, res.state)
        store.addRoom(res.room_id)
        goto(`/${$page.params.space}/${nameInput.value}`)
        kill()
    }
}

function blur() {
    if(nameInput.value == '') {
        kill()
    }
}

function kill() {
    active = false;
    busy = false;
    nameInput.value = '';
    name = '';
    exists = false;
    $store.addingRoom = false
}

$: if($store.addingRoom) {
    activate()
    focusNameInput()
}

</script>


{#if !active}
<div class="item op" class:ac={active} on:click={activate}>
    <div class="ico grd-c">
        {@html addLine}
    </div>

    <div class="sl pr2">
        <b>Add Board</b>
    </div>
</div>
{/if}

{#if active}
<div class="item it-ac">
    <div class="ico grd-c op">
        {@html discuss}
    </div>

        <input class:op={busy} type="text" 
        class:warn={exists}
        disabled={busy}
        on:keydown={validate}
        on:input={check}
        on:blur={blur}
        bind:this={nameInput}
        bind:value={name}
        spellcheck="false"
        placeholder="my-board" class="sl" />

    {#if busy}
        <div class="spinner">
            <div class="sloader"></div>
        </div>
    {/if}
</div>
{/if}

<style>
.item {
    cursor: pointer;
    display: grid;
    grid-template-columns: auto 1fr auto;
    height: 30px;
    border-radius: 4px;
    font-size: 14px;
    margin-bottom: 0.15rem;
    position: relative;
}

.it-ac {
    outline: 2px solid var(--primary);
}

.op {
    opacity: 0.5;
    transition: 0.1s;
}

.ac {
    cursor: auto;
    opacity: 1;
}

.item:hover {
    opacity: 1;
}

.ico {
    margin-right: 0.5rem;
    margin-left: 0.5rem;
    height: 14px;
    width: 14px;
}

.sl {
    padding-top: 2px;
    align-self: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: normal;
    color: var(--text-light);
}
input {
    padding: 0;
    font-size: 14px;
    border: none;
    background: transparent;
}
.warn {
    color: red;
}
.spinner {
    position: absolute;
    top: 9px;
    right: 4px;
}

.sloader {
    width: 10px;
    height: 10px;
    border-top: 2px solid var(--primary);
    border-right: 2px solid var(--primary);
    border-bottom: 2px solid var(--primary);
}

</style>
