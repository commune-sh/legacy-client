<script>
import { PUBLIC_MEDIA_URL, PUBLIC_APP_NAME } from '$env/static/public';
import { onMount, tick, createEventDispatcher} from 'svelte'
import { addImage } from '$lib/assets/icons.js'
import { debounce } from '$lib/utils/utils.js'
import { store } from '$lib/store/store.js'
import { page } from '$app/stores';
import Avatar from '$lib/components/avatar/avatar.svelte'
import Banner from '$lib/components/banner/banner.svelte'
import Select from '$lib/components/select/select.svelte'
import { createStateEvent, updateAvatar } from '$lib/utils/request.js'

const dispatch = createEventDispatcher();

$: state = $store?.states[$page?.params?.space]
$: roomID = state?.room_id

$: isProfile = state?.space?.type == 'profile'

let nameInput;
let name;

let topicInput;
let topic;

let current = {name: '', topic: ''};

onMount(() => {
    name = state?.space?.name;
    topic = state?.space?.topic;
    current.name = name;
    current.topic = topic;
    nameInput.focus();
})

let busy = false;

async function save() {
    busy = true
    updateRestrictions()
    store.updateSpaceInfo($page.params.space, {
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
    busy = false
    dispatch('kill')
}

async function avatarUploaded(e) {
    console.log("avatar uploaded! ", e.detail)
    store.updateSpaceAvatar($page.params.space, e.detail)

    const res = await createStateEvent({
        room_id: roomID,
        event_type: 'm.room.avatar',
        content: {
            url: e.detail,
        }
    })
    console.log(res)

    if(isProfile) {
        $store.credentials.avatar_url = e.detail
        const resp = await updateAvatar({
            url: e.detail,
        })
        console.log(resp)
    }

}

async function bannerUploaded(e) {
    console.log("banner uploaded! ", e.detail)
    store.updateSpaceHeader($page.params.space, e.detail)
    const res = await createStateEvent({
        room_id: roomID,
        event_type: 'm.room.header',
        content: {
            url: e.detail,
        }
    })

    console.log(res)
}


$: avatar = state?.space?.avatar ?
`${PUBLIC_MEDIA_URL}/${state?.space?.avatar}` : null


$: header = state?.space?.header ?
`${PUBLIC_MEDIA_URL}/${state?.space?.header}` : null

async function avatarRemoved() {
    console.log("hmm")
    avatar = null
    store.updateSpaceAvatar($page.params.space, null)
    const res = await createStateEvent({
        room_id: roomID,
        event_type: 'm.room.avatar',
        content: {
            url: ``
        }
    })
    console.log(res)

    if(isProfile) {
        $store.credentials.avatar_url = null
        const resp = await updateAvatar({
            url: null,
        })
        console.log(resp)
    }

}
async function bannerRemoved() {
    console.log("hmm")
    avatar = null
    store.updateSpaceHeader($page.params.space, null)
    const res = await createStateEvent({
        room_id: roomID,
        event_type: 'm.room.header',
        content: {
            url: ``
        }
    })
    console.log(res)
}

$: roomType = state?.space?.type

async function changeRoomType(e) {
    console.log(e.detail)
    store.updateSpaceType($page.params.space, e.detail)
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


$: restrictions = state?.space?.restrictions
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

$: is_default = state?.is_default || false

let defaultInput;

async function updateDefault() {
    console.log(defaultInput.checked)
    store.updateSpaceDefault($page.params.space, defaultInput.checked)
    const res = await createStateEvent({
        room_id: roomID,
        event_type: 'm.space.default',
        content: {
            default: defaultInput.checked ? true : false
        }
    })
    console.log(res)
}

let indexInput;

$: doNotIndex = state?.space?.do_not_index

async function updateIndex(e) {

    if(indexInput.checked == doNotIndex) {
        return
    }

    store.updateSpaceDoNotIndex($page.params.space, indexInput.checked)
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
            bind:value={name}
            type="text" placeholder={$page.params?.space} />
        </div>

        <div class="mt3 pb2">
            <span class="label">topic</span>
        </div>
        <div class="mt1 pb2">
            <textarea bind:this={topicInput}
            bind:value={topic}
            placeholder="topic"></textarea>
        </div>

        {#if !isProfile}
        <div class="mt3 pb2">
            <span class="label">space type</span>
        </div>
        <div class="mt1 pb2">
            <Select items={roomTypes} 
                value={roomType} 
                on:change={changeRoomType} />
        </div>
        {/if}

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

        {#if $store.credentials?.admin}
        <div class="mt3 pb2">
            <span class="label">default</span>
        </div>
        <div class="mt1 pb2">
            <div class="fl">
                <div class="grd-c mr2 fl-o">
                    <label for="def">
                        Make this a default space on {PUBLIC_APP_NAME}
                    </label>
                </div>
                <div class="grd-c">
                    <input id="def" type="checkbox" 
                        bind:this={defaultInput}
                        checked={is_default}
                        on:change={updateDefault} />
                </div>
            </div>
        </div>
        {/if}

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
</style>

