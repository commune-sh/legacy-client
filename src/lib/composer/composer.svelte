<script>
import { tick, onMount, onDestroy, createEventDispatcher } from 'svelte'
import { eye, send, close } from '$lib/assets/icons.js'
import { PUBLIC_BASE_URL, PUBLIC_APP_NAME } from '$env/static/public';
import { APIRequest, getPresignedURL, uploadAttachment, savePost } from '$lib/utils/request.js'
import MarkdownIt from 'markdown-it'
import MarkdownItEmoji from 'markdown-it-emoji'
import autosize from '$lib/vendor/autosize/autosize'
import { store } from '$lib/store/store.js'
import Attach from './attachments/attach.svelte'
import Attachments from './attachments/attachments.svelte'
import tippy from 'tippy.js';


export let roomID;
export let placeholder = `What's on your mind?`;
export let replyTo;
export let threadEvent;
export let reply = false;

$: stateKey = !reply ? roomID : roomID + replyTo?.event_id

$: state = $store.editorStates[stateKey]

const dispatch = createEventDispatcher()

function kill() {
    if(busy) {
        return
    }
    dispatch('kill')
    reset()
}


let editor;
let ready = false;

let md;

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
        store.addEditorState({
            room_id: stateKey,
            state: {
                title: '',
                body: '',
                focus: null,
                cursor: 0,
                scroll: 0,
            }

        })

        if(!reply) {
            autosize(titleInput)
        }
        autosize(bodyInput)

        if(!reply) {
            focusTitleInput()
        }
        if(reply) {
            focusBodyInput()
        }

    }


    bodyInput.addEventListener('scroll', handleScroll);

    tippy(preview, {
        content: "Preview Markdown",
        placement: 'top',
        arrow: false,
        duration: 1,
    });

    md = new MarkdownIt({
      html: true,
      linkify: true,
      breaks: true,
      typographer: true
    });

    md.use(MarkdownItEmoji);
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
    if(titleInput.value.length === 0 && !reply) {
        focusTitleInput()
        return
    }
    if(reply && replyTo == null) {
        return
    }

    if(bodyInput.value.length === 0) {
        focusBodyInput()
        return
    }
    busy = true

    try {
        let items = []
        if(attachments) {
            uploading = true
            for (const file of attachments) {
                const extension = file.name.split('.').pop();
                const presignedURL = await getPresignedURL(extension);
                await uploadAttachment(file, presignedURL.url);
                let item = {
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    info: file.info,
                    key: presignedURL.key,
                }
                if(file.info) {
                    item.info = file.info
                }
                items.push(item)
            }
        }

        let post = {
            room_id: roomID,
            content: {
                msgtype: 'm.text',
                title: titleInput.value,
                body: bodyInput.value,
                formatted_body: md.render(bodyInput.value),
            },
        }

        if(reply) {
            post.in_thread = threadEvent
            post.is_reply = true
            post.content['m.relates_to'] = {
                event_id: threadEvent,
                'rel_type': 'm.thread',
                'm.in_reply_to': {
                    event_id: replyTo.event_id,
                }
            }
        }

        if(attachments && items.length > 0) {
            post.content.attachments = items
        }



        const res = await savePost(post);
        console.log(res)
        if(res?.success && res?.event) {
            dispatch('saved', res.event)
            busy = false
            kill()
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

function reset() {
    busy = false
    uploading = false
    bodyInput.value = ''
    attachments = []
    autosize.update(bodyInput)
    store.deleteEditorState(stateKey)
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
        title: titleInput.value || '',
        body: bodyInput.value,
        focus: titleFocused ? 'title' : bodyFocused ? 'body' : null,
        cursor: titleFocused ? titleInput.selectionStart : bodyFocused ? bodyInput.selectionStart : null,
        scroll: bodyInput?.scrollTop > 0 ? bodyInput.scrollTop : null,
    }

    store.updateEditorState({
        room_id: stateKey,
        state: state,
    })
}


function attachFiles(e) {
    e.detail.forEach(file => {
        store.addAttachment({
            room_id: stateKey,
            attachment: file,
        })
    })
}

function insertEmoji(textarea, emoji, sub) {
  // Get the current caret position in the textarea
  var caretPos = textarea.selectionStart;
  
  // Get the textarea's current value
  var currentValue = textarea.value;

  // Construct the updated value with the emoji inserted at the caret position
  var updatedValue = currentValue.substring(0, caretPos - sub) + emoji + currentValue.substring(caretPos);

  // Update the textarea's value with the updatedValue
  textarea.value = updatedValue;

  // Move the caret position after the inserted emoji
  textarea.selectionStart = caretPos + emoji.length;
  textarea.selectionEnd = caretPos + emoji.length;

  // Focus the textarea
  textarea.focus();
}

let emojiListActive = false;
let shortCode = '';

function trackCaret(e) {
  setTimeout(() => {
    const pt = bodyInput.value.substring(0, bodyInput.selectionStart);
    const pattern = /:\S{1,}$/;
    if (pattern.test(pt)) {
        let et = pt.match(pattern)[0];
        et = et.substring(1);
        shortCode = et;
        emojiListActive = true
    }
  }, 0);
}

$: attachments = $store.editorStates[stateKey]?.attachments
$: showAttachments = $store.editorStates[stateKey]?.attachments?.length > 0;

let preview;
let previewing = false;

function togglePreview() {
    previewing = !previewing
}

</script>

<section class="composer" 
    class:sf={showAttachments}
    class:rep={reply}>

    {#if reply && replyTo}
        <div class="reply-header">
            <div class="pa3">
                Replying to {replyTo.sender.display_name}
            </div>
            <div class="grd-c c-ico ph2 mr2" on:click={kill}>
                {@html close}
            </div>
        </div>
    {/if}

    <div class="editor-area">
        <div class="title-container" class:hide={reply}>
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
        <div class="body-container" 
            class:rp={reply}
            class:bs={busy} 
            on:click={focusBodyInput}>
                <textarea 
                    class="post-body"
                    class:sh={reply}
                    bind:this={bodyInput}
                    placeholder={placeholder}
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
        <Attachments uploading={uploading} roomID={stateKey}/>
    {/if}

    <div class="tools fl">
        <Attach busy={busy} on:attached={attachFiles}/>
        <div class="fl-o">
        </div>
        <div class="grd mr3">
            <div class:pact={previewing} 
                on:click={togglePreview} 
                bind:this={preview} 
                class="prev c-ico grd-c ph2">
                {@html eye}
            </div>
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
    position: relative;
}

.rep {
    border-top: 1px solid var(--border-1);
    grid-template-rows: auto 1fr auto;
    border-bottom: none;
    -webkit-box-shadow: 0px 20px 70px 30px rgba(0,0,0,0.1);
    -moz-box-shadow: 0px 20px 70px 30px rgba(0,0,0,0.1);
    box-shadow: 0px 20px 70px 30px rgba(0,0,0,0.1);
}

.reply-header {
    border-bottom: 1px solid var(--border-1);
    display: grid;
    grid-template-columns: 1fr auto;
}

.sf {
    grid-template-rows: 1fr auto auto;
}

.editor-area {
    display: grid;
    grid-template-rows: auto 1fr;
    overflow-y: hidden;
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

.rp {
    padding-right: calc(1rem - 6px);
    padding-top: 1rem;
    min-height: 100px;
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
    max-height: 400px;
    overflow-x: hidden;
}

.sh {
    max-height: 300px;
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
.prev {
    opacity: 0.4;
    transition: 0.1s;
}
.prev:hover {
    opacity: 0.8;
}
.pact {
    opacity: 1;
}

.hide {
    display: none;
}
</style>
