<script>
import { PUBLIC_MEDIA_URL, PUBLIC_APP_NAME } from '$env/static/public';
import { onMount, tick, createEventDispatcher} from 'svelte'
import { addImage } from '$lib/assets/icons.js'
import { goto } from '$app/navigation';
import { debounce } from '$lib/utils/utils.js'
import { store } from '$lib/store/store.js'
import { page } from '$app/stores';
import Avatar from '$lib/components/avatar/avatar.svelte'
import Banner from '$lib/components/banner/banner.svelte'
import Select from '$lib/components/select/select.svelte'
import { createStateEvent } from '$lib/utils/request.js'
const dispatch = createEventDispatcher()

export let room_id;

$: state = $store?.states[$page?.params?.space]

$: room = state?.children?.find(c => c.room_id == room_id)
$: roomID = room?.room_id

let nameInput;
let name;

let topicInput;
let topic;

let current = {name: '', topic: ''};

onMount(() => {
    name = room?.name;
    topic = room?.topic;
    current.name = name;
    current.topic = topic;
    nameInput.focus();
})

let busy = false;

function validate(e) {
    const letters = /^[0-9a-zA-Z-]+$/;
    if(!e.key.match(letters)){
        e.preventDefault()
    }

}

let lengthWarning = false;
let nameWarning = false;

function check(e) {
    let index = state?.children?.findIndex(x => x.alias == nameInput.value)
    if(index > -1) {
        nameWarning = true
    } else {
        nameWarning = false
    }
    if(nameInput.value.length > 0) {
        lengthWarning = false
    }
}

async function save() {
    if(nameWarning) {
        nameInput.focus()
        return
    }

    busy = true

    if(nameInput.value == '') {
        lengthWarning = true
        nameInput.focus()
        busy = false
        return
    }

    store.updateSpaceRoomInfo($page.params.space, roomID, {
        name: nameInput.value,
        topic: topicInput.value,
    })

    if(name != current.name) {
        const res = await createStateEvent({
            room_id: roomID,
            event_type: 'm.room.name',
            content: {
                name: nameInput.value,
            }
        })
        console.log(res)
        current.name = nameInput.value
    }
    if(topic != current.topic) {
        const resp = await createStateEvent({
            room_id: roomID,
            event_type: 'm.room.topic',
            content: {
                topic: topicInput.value,
            }
        })
        console.log(resp)
        current.topic = topicInput.value
    }
    updateRestrictions()
    busy = false
    dispatch('kill')
}

async function avatarUploaded(e) {
    console.log("avatar uploaded! ", e.detail)
    store.updateSpaceRoomAvatar($page.params.space, roomID, e.detail)
    const res = await createStateEvent({
        room_id: roomID,
        event_type: 'm.room.avatar',
        content: {
            url: e.detail,
        }
    })

    console.log(res)
}

async function bannerUploaded(e) {
    console.log("banner uploaded! ", e.detail)
    store.updateSpaceRoomHeader($page.params.space, roomID, e.detail)
    const res = await createStateEvent({
        room_id: roomID,
        event_type: 'm.room.header',
        content: {
            url: e.detail,
        }
    })

    console.log(res)
}


$: avatar = room?.avatar ?
`${PUBLIC_MEDIA_URL}/${room?.avatar}` : null


$: header = room?.header ?
`${PUBLIC_MEDIA_URL}/${room?.header}` : null

async function avatarRemoved() {
    console.log("hmm")
    avatar = null
    store.updateSpaceRoomAvatar($page.params.space, roomID, null)
    const res = await createStateEvent({
        room_id: roomID,
        event_type: 'm.room.avatar',
        content: {
            url: ``
        }
    })
    console.log(res)
}
async function bannerRemoved() {
    console.log("hmm")
    avatar = null
    store.updateSpaceRoomHeader($page.params.space, roomID, null)
    const res = await createStateEvent({
        room_id: roomID,
        event_type: 'm.room.header',
        content: {
            url: ``
        }
    })
    console.log(res)
}

$: roomType = room?.type

async function changeRoomType(e) {
    console.log(e.detail)
    store.updateSpaceRoomType($page.params.space, roomID, e.detail)
    const res = await createStateEvent({
        room_id: roomID,
        event_type: 'm.space.type',
        content: {
            type: e.detail
        }
    })
    console.log(res)
}

let roomTypes = [
    {value: 'board', text: 'board'},
    {value: 'chat', text: 'chat'},
]


$: restrictions = room?.restrictions
$: require_verification = restrictions?.verified || false
$: sender_age = restrictions?.age || 0

let verifiedInput;

async function updateRestrictions(e) {

    if(verifiedInput.checked == require_verification && sender_age == ageInput.value) {
        return
    }

    let restrictions = {
        verified: verifiedInput?.checked,
        age: ageInput.value,
    }

    store.updateSpaceRestrictions($page.params.space, restrictions)
    const res = await createStateEvent({
        room_id: roomID,
        event_type: 'm.restrict_events_to',
        content: {
            verified: verifiedInput?.checked,
            age: ageInput?.value,
        }
    })
    console.log(res)
}

let ageInput;

function handleInput() {
    debounce(updateRestrictions, 250)
}

async function removeBoard() {
    goto(`/${$page.params.space}`)
    store.removeSpaceRoom($page.params.space, roomID)
    dispatch('kill')
    const res = await createStateEvent({
        room_id: state?.room_id,
        state_key: roomID,
        event_type: 'm.space.child',
        content: {}
    })
    console.log(res)
    const resp = await createStateEvent({
        room_id: roomID,
        state_key: state?.room_id,
        event_type: 'm.space.parent',
        content: {}
    })
    console.log(resp)
}

let indexInput;
$: doNotIndex = room?.do_not_index

async function updateIndex(e) {

    if(indexInput.checked == doNotIndex) {
        return
    }

    store.updateSpaceRoomDoNotIndex($page.params.space, roomID, indexInput.checked)
    const res = await createStateEvent({
        room_id: roomID,
        event_type: 'm.room.do_not_index',
        content: {
            do_not_index: indexInput.checked,
        }
    })
    console.log(res)
}

</script>

<div class="sco grd-c">

    <div class="banner grd ph3 pb3">
        <Avatar avatar={avatar} 
            on:removed={avatarRemoved}
            on:uploaded={avatarUploaded}/>

        <Banner banner={header} 
            on:removed={bannerRemoved}
            on:uploaded={bannerUploaded}/>
    </div>

    <div class="pa3 grd-c fl-co">

        <div class="pb2">
            <span class="label">name</span>
        </div>

        <div class="mt1 pb2">
            <input bind:this={nameInput}
            class:warn={nameWarning}
            on:input={check}
            on:keydown={validate}
            bind:value={name}
            type="text" placeholder={room.alias} />
        </div>
        {#if nameWarning}
            <div class="mt1 pb2 red">
                A board with that name already exists.
            </div>
        {/if}
        {#if lengthWarning}
            <div class="mt1 pb2 red">
                Board name can't be empty.
            </div>
        {/if}

        <div class="mt3 pb2">
            <span class="label">topic</span>
        </div>
        <div class="mt1 pb2">
            <textarea bind:this={topicInput}
            bind:value={topic}
            placeholder="topic"></textarea>
        </div>

        <div class="mt3 pb2">
            <span class="label">space type</span>
        </div>
        <div class="mt1 pb2">
            <Select items={roomTypes} 
                value={roomType} 
                on:change={changeRoomType} />
        </div>

        <div class="mt3 pb2">
            <span class="label">restrictions</span>
        </div>
        <div class="mt1 pb2">
            <div class="fl">
                <div class="grd-c mr2 fl-o">
                    <label for="ver">
                        Restrict space to users with verified email.
                    </label>
                </div>
                <div class="grd-c">
                    <input id="ver" type="checkbox" 
                        bind:this={verifiedInput}
                        checked={require_verification}
                        on:change={updateRestrictions}
                        bind:value={require_verification} />
                </div>
            </div>
        </div>

        <div class="mt1 pb2">
            <div class="fl">
                <div class="grd-c mr2 fl-o">
                    Require user accounts to be at least this old (in days)
                </div>
                <div class="grd-c">
                    <input id="age" type="number" 
                        bind:this={ageInput}
                        value={sender_age}
                        placeholder="0"
                        on:input={handleInput}
                        on:change={updateRestrictions} />
                </div>
            </div>
        </div>

        <div class="mt3 pb2">
            <span class="label">index</span>
        </div>
        <div class="mt1 pb2">
            <div class="fl">
                <div class="grd-c mr2 fl-o">
                    <label for="ver">
                        Hide posts from the {PUBLIC_APP_NAME} frontpage
                    </label>
                </div>
                <div class="grd-c">
                    <input id="ver" type="checkbox" 
                        bind:this={indexInput}
                        checked={doNotIndex}
                        on:change={updateIndex}
                        bind:value={doNotIndex} />
                </div>
            </div>
        </div>


        <div class="mt3 fl">
            <div class="grd-c">
                <button class="sbut" disabled={busy} on:click={removeBoard}>
                    Remove board
                </button>
            </div>
            <div class="grd-c fl-o">
            </div>
            <div class="grd-c">
                <button class="pa2" disabled={busy} on:click={save}>
                    Save settings
                </button>
            </div>
        </div>
    </div>
</div>

<style>

.sco {
    background: var(--modal);
    width: 100%;
    border-radius: 7px;
}

.header {
    background: var(--bg);
    border-radius: 7px;
    cursor: pointer;
}
.header:hover .c-ico {
    opacity: 1;
}

.banner {
    height: 100%;
    display: grid;
    grid-template-columns: auto 1fr;
    grid-column-gap: 1rem;
}


input, textarea {
    padding: 0.5rem;
    width: 100%;
}

textarea {
    height: 100px;
}

#age {
    width: 70px;
    padding: 0.25rem;
}

#ver {
    padding: 0;
    width: auto;
    cursor: pointer;
}

@media (max-width: 1020px) {
}
.warn {
    outline: 1px solid red;
}
.red {
    color: red;
    font-size: 500;
}
</style>

