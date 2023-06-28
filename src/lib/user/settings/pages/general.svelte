<script>
import { PUBLIC_MEDIA_URL, PUBLIC_APP_NAME } from '$env/static/public';
import { createEventDispatcher } from 'svelte'
import { onMount, tick} from 'svelte'
import { addImage } from '$lib/assets/icons.js'
import { debounce } from '$lib/utils/utils.js'
import { store } from '$lib/store/store.js'
import { page } from '$app/stores';
import Avatar from '$lib/components/avatar/avatar.svelte'
import { createStateEvent, updateAvatar, updateDisplayName } from '$lib/utils/request.js'

const dispatch = createEventDispatcher()

$: state = $store?.states[$page?.params?.space]

let nameInput;
let name;

let topicInput;
let topic;

let current = {name: '', topic: ''};

onMount(() => {
    name = $store.credentials?.display_name

    let sp = `@${$store.credentials?.username}`
    let s = $store.spaces.find(x => x.alias == sp)
    topic = s?.topic

    current.name = name;
    current.topic = topic;
    nameInput.focus();
})

let busy = false;

async function save() {
    busy = true
    let sp = `@${$store.credentials?.username}`
    store.updateSpaceInfo(sp, {
        name: nameInput.value,
        topic: topicInput.value,
    })
    $store.credentials.display_name = nameInput.value

    let s = $store.spaces.find(x => x.alias == sp)
    if(!s) {
        return
    }
    const roomID = s?.room_id

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

    const res = await updateDisplayName({
        display_name: nameInput.value,
    })
    console.log(res)


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
    busy = false
    dispatch('kill')
}


async function avatarUploaded(e) {
    console.log("avatar uploaded! ", e.detail)
    $store.credentials.avatar_url = e.detail
    const res = await updateAvatar({
        url: e.detail,
    })

    console.log(res)
    let sp = `@${$store.credentials?.username}`
    store.updateSpaceAvatar(sp, e.detail)
    const resp = await createStateEvent({
        room_id: $store?.credentials?.user_space_id,
        event_type: 'm.room.avatar',
        content: {
            url: e.detail,
        }
    })

    console.log(resp)
}


$: avatar = $store?.credentials?.avatar_url ?
`${PUBLIC_MEDIA_URL}/${$store?.credentials?.avatar_url}` : null


async function avatarRemoved() {
    avatar = null
    $store.credentials.avatar_url = null
    let sp = `@${$store.credentials?.username}`
    store.updateSpaceAvatar(sp, null)

    const resp = await updateAvatar({
        url: null,
    })
    console.log(resp)

    const res = await createStateEvent({
        room_id: $store?.credentials?.user_space_id,
        event_type: 'm.room.avatar',
        content: {
            url: ``
        }
    })
    console.log(res)
}
</script>

<div class="sco grd-c fl">

    <div class="banner grd ">
        <Avatar avatar={avatar} 
            on:removed={avatarRemoved}
            on:uploaded={avatarUploaded}/>

    </div>

    <div class="grd-c fl-co fl-o">

        <div class="pb2">
            <span class="label">display name</span>
        </div>

        <div class="mt1 pb2">
            <input bind:this={nameInput}
            bind:value={name}
            type="text" placeholder={$page.params?.space} />
        </div>

        <div class="mt3 pb2">
            <span class="label">about</span>
        </div>
        <div class="mt1 pb2">
            <textarea bind:this={topicInput}
            bind:value={topic}
            placeholder="topic"></textarea>
        </div>


        <div class="mt3 fl">
            <div class="grd-c">
            </div>
            <div class="grd-c fl-o">
            </div>
            <div class="grd-c">
                <button class="pa2" disabled={busy} on:click={save}>
                    Save Profile
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
</style>

