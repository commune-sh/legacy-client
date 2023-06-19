<script>
import { PUBLIC_MEDIA_URL } from '$env/static/public';
import { onMount, tick} from 'svelte'
import { addImage } from '$lib/assets/icons.js'
import { store } from '$lib/store/store.js'
import { page } from '$app/stores';
import Avatar from '$lib/components/avatar/avatar.svelte'
import { createStateEvent } from '$lib/utils/request.js'

$: state = $store?.states[$page?.params?.space]
$: roomID = state.room_id

let nameInput;
let name;

let topicInput;
let topic;

onMount(() => {
    name = state?.space?.name;
    topic = state?.space?.topic;
    nameInput.focus();
})

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
}


$: avatar = state?.space?.avatar ?
`${PUBLIC_MEDIA_URL}/${state?.space?.avatar}` : null


</script>

<div class="sco grd-c">

    <div class="banner grd pa3">
        <Avatar avatar={avatar} 
            on:uploaded={avatarUploaded}/>

        <div class="header grd">
            <div class="grd-c c-ico">
                {@html addImage}
            </div>
        </div>
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
            <span class="label">description</span>
        </div>
        <div class="mt1 pb2">
            <textarea bind:this={topicInput}
            bind:value={topic}
            placeholder="description"></textarea>
        </div>

    </div>
</div>

<style>

.sco {
    background: var(--modal);
    width: 520px;
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

@media (max-width: 1020px) {
    .sco {
        width: 100%;
    }
}
</style>

