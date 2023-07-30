<script>
import {onMount} from 'svelte'
import { PUBLIC_MEDIA_URL } from '$env/static/public';
import { getPresignedURL, uploadAttachment } from '$lib/utils/request.js'
import { page } from '$app/stores';
import { store } from '$lib/store/store.js'
import { createStateEvent } from '$lib/utils/request.js'
import EmojiItem from './emoji-item.svelte'

$: state = $store?.states[$page?.params?.space]
$: roomID = state?.room_id

let fileInput;
let uploading = false;

let size = 0;
let dimensions = {width: 0, height: 0}
let exceeds_size = false;
let exceeds_dimensions = false;

let build = async (e) => {
    uploading = true;

    for(let i =0 ; i < e.target.files.length ; i++) {

        const file = e.target.files[i]
        size = file.size
        exceeds_size = file.size > 3145728

        if(exceeds_size) {
            continue
        }

        const extension = file.name.split('.').pop();
        const presignedURL = await getPresignedURL(extension);
        await uploadAttachment(file, presignedURL.url);
        console.log(presignedURL.key)

        let item = {
            name: file.name.split('.')[0],
            url: `${PUBLIC_MEDIA_URL}/${presignedURL.key}`
        }


        //store.addSpaceEmoji($page.params.space, item)
        items = [...items, item]

    } 

    let settings = state?.space?.settings
    settings.emoji = items
    const res = await createStateEvent({
        room_id: roomID,
        event_type: 'room.settings',
        content: settings
    })
    console.log(res)

    uploading = false

}

function select() {
    fileInput.click()
}

let items = [];

onMount(() => {
    items = state?.space?.settings?.emoji || []
})

$: reached_limit = items.length >= 50

function removeEmoji(e) {
    console.log("removing emoji", e.detail)
    items = items.filter(item => item.url !== e.detail)
    items = [...items]

    store.updateSpaceEmoji(items)

    let settings = state?.space?.settings
    settings.emoji = items
    createStateEvent({
        room_id: roomID,
        event_type: 'room.settings',
        content: settings
    })
}

function updateEmoji(e) {
    let ind = items.findIndex(item => item.url === e.detail.url)
    if(ind !== -1) {
        items[ind].name = e.detail.name
    }

    store.updateSpaceEmoji(items)

    let settings = state?.space?.settings
    settings.emoji = items
    createStateEvent({
        room_id: roomID,
        event_type: 'room.settings',
        content: settings
    })
}

</script>

<div class="emoji fl-co">
    <div>
    Add up to 50 custom emoji for this space. Members from all boards and
    chatrooms in this space will be able to use these emoji.
    </div>

    <div>
        Upload requirements
        <ul>
            <li>
                File types: PNG, JPG, GIF, SVG
            </li>
            <li>
                File size: 256KB
            </li>
            <li>
                Dimensions: 128x128
            </li>
            <li>
                Emoji name: 2-32 characters
            </li>
        </ul>
    </div>

    <div class="fl">
        <div class="fl-o">
            <button class="ph3 pv2" 
                disabled={uploading || reached_limit}
                on:click={select}>
                {uploading ? 'Uploading Emoji...' : 'Upload Emoji'}
            </button>
            <input 
                type="file" 
                accept="image/*"
                name="emoji"
                bind:this={fileInput} 
                on:change={build} 
                hidden 
                multiple
            >
        </div>
        <div class="">
            {#if uploading}
                <div class="spinner grd-c grd">
                    <div class="sloader grd-c"></div>
                </div>
            {/if}
        </div>
    </div>

    {#if exceeds_size || exceeds_dimensions}
        <div class="error mt3 pa3">
            {#if exceeds_size}
                File size exceeds 256KB
            {:else if exceeds_dimensions}
                File dimensions exceed 128x128
            {/if}
        </div>
    {/if}

    <div class="emojis mt4">
        <div class="items fl-co">
            <div class="lbls label mb3">
                <div class="">
                    image
                </div>
                <div class="">
                    name
                </div>
            </div>
            {#each items as item}

                <EmojiItem 
                    on:remove={removeEmoji} 
                    on:update={updateEmoji}
                    items={items.filter(i => i.url !== item.url)}
                    item={item} />

            {/each}
        </div>
    </div>

</div>

<style>
div {
    line-height: 1.5;
}
.error {
    outline: 1px solid var(--primary);
    border-radius: 5px;
}
.emoji {
    overflow: hidden;
}
.emojis {
    overflow: hidden;
}
.items {
    max-height: 400px;
    overflow-y: auto;
}
.sloader {
    border-top: 2px solid var(--primary);
    border-right: 2px solid var(--primary);
    border-bottom: 2px solid var(--primary);
    border-left: 2px solid transparent;
}

.lbls {
    display: grid;
    grid-template-columns: auto 1fr auto;
    grid-gap: 2rem;
}
</style>
