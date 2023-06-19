<script>
import { store } from '$lib/store/store.js'
import { goto } from '$app/navigation';
import { createStateEvent } from '$lib/utils/request.js'
import { page } from '$app/stores';
import { tick } from 'svelte'
import { addLine, pulse } from '$lib/assets/icons.js'

$: state = $store?.states[$page?.params?.space]

$: roomID = isRoom ? state?.children?.find(r => r?.alias ===
    $page?.params?.room)?.room_id : isSpace ? state?.room_id : null
$: isSpace = $page?.params?.space !== undefined 
$: isRoom = $page?.params?.room !== undefined 

export let alias;
export let topics;

let active = false;
let busy = false;

function activate() {
    if(active) {
        return;
    }
    active = true;
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
    let index = topics?.findIndex(x => x == nameInput.value)
    if(index > -1) {
        exists = true
    } else {
        exists = false
    }
}

let exists = false;

async function addRoom() {
    let newTopics = topics
    if(!newTopics) {
        newTopics = []
    }
    newTopics.push(nameInput.value)
    const res = await createStateEvent({
        room_id: roomID,
        event_type: 'm.room.topics',
        content: {
            topics: newTopics
        }
    })

    console.log(res)
    store.updateRoomTopics($page.params.space, alias, JSON.stringify(newTopics))

    let url = `/${$page.params.space}/topic/${nameInput.value}`
    if(isRoom) {
        url = `/${$page.params.space}/${$page.params.room}/topic/${nameInput.value}`
    }
    goto(url)

    kill()
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
}

</script>


{#if !active}
<div class="item op" class:ac={active} on:click={activate}>
    <div class="ico grd-c">
        {@html addLine}
    </div>

    <div class="sl pr2">
        Add Topic
    </div>
</div>
{/if}

{#if active}
<div class="item">
    <div class="ico grd-c op">
        {@html pulse}
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
        placeholder="my-topic" class="sl" />

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
    margin-left: 1.75rem;
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
    right: 0;
}

.sloader {
    width: 10px;
    height: 10px;
    border-top: 2px solid var(--primary);
    border-right: 2px solid var(--primary);
    border-bottom: 2px solid var(--primary);
}

</style>
