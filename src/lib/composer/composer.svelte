<script>
import { tick, onMount, onDestroy, createEventDispatcher } from 'svelte'
import { add, send, close } from '$lib/assets/icons.js'
import { PUBLIC_BASE_URL, PUBLIC_APP_NAME } from '$env/static/public';
import { APIRequest, getPresignedURL, uploadAttachment, savePost } from '$lib/utils/request.js'
import { marked } from 'marked'
import autosize from '$lib/vendor/autosize/autosize'
import { store } from '$lib/store/store.js'
import Attach from './attachments/attach.svelte'
import Attachments from './attachments/attachments.svelte'


export let roomID;

$: state = $store.editorStates[roomID]

const dispatch = createEventDispatcher()

function kill() {
    if(busy) {
        return
    }
    dispatch('kill')
}


let editor;
let ready = false;

onMount(() => {

    if(state) {
        if(state?.title) {
            titleInput.value = state?.title
        }
        if(state?.body) {
            bodyInput.value = state?.body
        }
        autosize(titleInput)
        autosize(bodyInput)
        if(state.focus == 'body') {
            bodyInput.selectionStart = state.cursor;
            bodyInput.selectionEnd = state.cursor;
            focusBodyInput()
            if(state.scroll) {
                bodyInput.scrollTop = state.scroll
            }
        }
        if(state.focus == 'title') {
            titleInput.selectionStart = state.cursor;
            titleInput.selectionEnd = state.cursor;
            focusTitleInput()
        }
    }

    if(!state) {
        autosize(titleInput)
        autosize(bodyInput)
        focusTitleInput()

        store.addEditorState({
            room_id: roomID,
            state: {
                title: '',
                body: '',
                focus: null,
                cursor: 0,
                scroll: 0,
            }

        })
    }

    bodyInput.addEventListener('scroll', handleScroll);
})

onDestroy(() => {
    bodyInput.removeEventListener('scroll', handleScroll);
})

const handleScroll = () => {
    updateContent()
};

async function focusTitleInput() {
    await tick()
    titleInput.focus()
}
function focusOnTitle(e) {
    if(e.key === 'Backspace' && bodyInput.value === '') {
        e.preventDefault()
        focusTitleInput()
    }
}



let busy = false;
let uploading = false;

$: postText = uploading ? 'Uploading...' : busy ? 'Posting...' : 'Post'


async function createPost() {
    if(titleInput.value.length === 0) {
        focusTitleInput()
        return
    }
    if(bodyInput.value.length === 0) {
        focusBodyInput()
        return
    }
    //busy = true

    try {
        let items = []
        if(attachments) {
            busy = true
            uploading = true
            for (const file of attachments) {
                const extension = file.name.split('.').pop();
                const presignedURL = await getPresignedURL(extension);
                await uploadAttachment(file, presignedURL.url);
                items.push({
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    key: presignedURL.key,
                })
            }
        }

        let post = {
            room_id: roomID,
            content: {
                msgtype: 'm.text',
                title: titleInput.value,
                body: bodyInput.value,
                formatted_body: marked.parse(bodyInput.value),
            },
        }
        if(attachments && items.length > 0) {
            post.content.attachments = items
        }

        console.log("saving post ", post.content.formatted_body)
        return
        const res = await savePost(post);
        console.log(res)
        if(res?.success && res?.event) {
            dispatch('saved', res.event)
        }
    } catch (error) {
        console.error('Error:', error);
    }


    /*
    dispatch('create', {
        title: titleInput.value,
        body: bodyInput.value,
    })
    */
}

let titleInput;

function handleEnter(e) {
    if(e.key === 'Enter') {
        e.preventDefault()
        if(titleInput.value.length > 0) {
            //editor.focus()
            bodyInput.focus()
        }
    }
}

let bodyInput;

function focusBodyInput() {
    bodyInput.focus()
    updateContent()
}

let titleFocused = false;
let bodyFocused = false;

const handleTitleFocus = () => {
    titleFocused = true;
    updateContent()
};

const handleTitleBlur = () => {
    titleFocused = false;
};

const handleBodyFocus = () => {
    bodyFocused = true;
    updateContent()
};

const handleBodyBlur = () => {
    bodyFocused = false;
};

function updateContent() {
    let state = {
        title: titleInput.value,
        body: bodyInput.value,
        focus: titleFocused ? 'title' : bodyFocused ? 'body' : null,
        cursor: titleFocused ? titleInput.selectionStart : bodyFocused ? bodyInput.selectionStart : null,
        scroll: bodyInput?.scrollTop > 0 ? bodyInput.scrollTop : null,
    }

    store.updateEditorState({
        room_id: roomID,
        state: state,
    })
}


function attachFiles(e) {
    e.detail.forEach(file => {
        store.addAttachment({
            room_id: roomID,
            attachment: file,
        })
    })
}

function trackCaret(e) {
  setTimeout(() => {
    const cursorPosition = bodyInput.selectionStart;
    const content = bodyInput.value;
    const scp = content.substr(cursorPosition - 3, 1);
    const space = content.substr(cursorPosition - 4, 1);
    if(scp === ':' && space === ' ') {
        //console.log('emoji')
    }

  }, 0);
}

$: attachments = $store.editorStates[roomID]?.attachments
$: showAttachments = $store.editorStates[roomID]?.attachments?.length > 0;

</script>

<section class="composer" class:sf={showAttachments}>
    <div class="editor-area">
        <div class="title-container">
            <div class="">
                <textarea 
                    class="post-title"
                    bind:this={titleInput}
                    placeholder="Title"
                    maxlength="340"
                    on:keydown={handleEnter}
                    on:keydown={updateContent}
                    on:input={updateContent}
                    on:click={updateContent}
                    on:focus={handleTitleFocus}
                    on:blur={handleTitleBlur}
                    disabled={busy}
                ></textarea>
            </div>
            <div class="c-ico ml2 kill" on:click={kill}>
                {@html close}
            </div>
        </div>
        <div class="body-container" class:bs={busy} on:click={focusBodyInput}>
                <textarea 
                    class="post-body"
                    bind:this={bodyInput}
                    placeholder="What's on your mind?"
                    on:keydown={focusOnTitle}
                    on:keydown={updateContent}
                    on:keydown={trackCaret}
                    maxlength="2000"
                    on:input={updateContent}
                    on:click={updateContent}
                    on:focus={handleBodyFocus}
                    on:blur={handleBodyBlur}
                    disabled={busy}
                ></textarea>
        </div>
    </div>

    {#if showAttachments}
        <Attachments uploading={uploading} roomID={roomID}/>
    {/if}

    <div class="tools fl">
        <Attach busy={busy} on:attached={attachFiles}/>
        <div class="fl-o">
        </div>
        <button class="vb" disabled={busy} on:click={createPost}>
            <div class="ico-s">
                {@html send}
            </div>
            <div class="grd-c ph2">
                {postText}
            </div>
        </button>
    </div>
</section>

<style>
.composer {
    display: grid;
    grid-template-columns: auto;
    grid-template-rows: 1fr auto;
    border-bottom: 1px solid var(--border-1);
}
.sf {
    grid-template-rows: 1fr auto auto;
}

.editor-area {
    display: grid;
    grid-template-rows: auto 1fr;
    overflow-y: hidden;
    max-height: 480px;
}

.composer {
}

.tools {
    padding: 1rem;
}
.c-ico {
    height: 22px;
    width: 22px;
}

.title-container {
    padding-right: 1rem;
    padding-left: 1rem;
    display: grid;
    grid-template-columns: 1fr auto;
}

.post-title {
    background-color: transparent;
    border: none;
    font-size: 1.2rem;
    width: 100%;
    font-weight: bold;
    padding: 0;
    height: 42px;
    padding-top: 1rem;
    padding-bottom: 0.5rem;
}

.body-container {
    padding-right: 1.5rem;
    cursor: text;
    min-height: 140px;
}

.bs {
    cursor: auto;
}

.post-body {
    background-color: transparent;
    border: none;
    width: 100%;
    padding: 0;
    padding-left: 1rem;
    max-height: 200px;
    overflow-x: hidden;
}

.ex {
    font-size: small;
    color: var(--primary);
}

.kill {
    margin-top: 1rem;
}

button {
    padding: 0.25rem;
}
</style>
