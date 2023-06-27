<script>
import { tick, onMount, onDestroy, createEventDispatcher } from 'svelte'
import { eye, send, close } from '$lib/assets/icons.js'
import { PUBLIC_BASE_URL, PUBLIC_APP_NAME } from '$env/static/public';
import { APIRequest, getPresignedURL, uploadAttachment, savePost,
    getLinkMetadata } from '$lib/utils/request.js'
import MarkdownIt from 'markdown-it'
import MarkdownItEmoji from 'markdown-it-emoji'
import MarkdownItLinkAttributes from 'markdown-it-link-attributes'
import autosize from '$lib/vendor/autosize/autosize'
import { store } from '$lib/store/store.js'
import Attach from './attachments/attach.svelte'
import InsertEmoji from './insert-emoji.svelte'
import Attachments from './attachments/attachments.svelte'
import Links from './links/links.svelte'
import EmojiList from './emoji-list.svelte'
import Event from '$lib/event/event.svelte'
import tippy from 'tippy.js';

import { v4 as uuidv4 } from 'uuid';

let id = uuidv4()

export let roomID;
export let placeholder = `What's on your mind?`;
export let replyTo;
export let threadEvent;
export let reply = false;
export let topic;

export let editing;
export let editingEvent;
export let editingReply;

$: stateKey = !reply ? roomID : roomID + threadEvent

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

    if(editing && editingEvent) {
        bodyInput.value = editingEvent?.content?.body
        titleInput.value = editingEvent?.content?.title
        autosize(titleInput)
        autosize(bodyInput)
        focusBodyInput()
    }

    if(state && !editing) {
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

    if(!state && !editing) {
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

    md = new MarkdownIt("zero", {
      html: true,
      linkify: true,
      breaks: true,
      typographer: true
    });

    let enable = ["normalize", "block", "inline", "linkify", "autolink", 'link', 'backticks', 'emphasis', "paragraph", "text", "newline"]
    md.enable(enable)

    md.linkify.set({ fuzzyEmail: false })

    md.linkify.add('/', {
        validate: function (text, pos, self) {
            var tail = text.slice(pos);

            if (!self.re.space) {
                self.re.space =  new RegExp(
                    '^([a-zA-Z0-9_]){1,15}(?!_)(?=$|' + self.re.src_ZPCc + ')'
                );
            }
            if (self.re.space.test(tail)) {
                if (pos >= 2 && tail[pos - 2] === '/') {
                    return false;
                }
                return tail.match(self.re.space)[0].length;
            }
            return 0;
        },

        normalize: function (match) {
            match.url = `${PUBLIC_BASE_URL}/` + match.url.replace(/^\//, '');
        }
    });


    md.linkify.add('@', {
        validate: function (text, pos, self) {
            var tail = text.slice(pos);

            if (!self.re.mention) {
                self.re.mention =  new RegExp(
                    '^([a-zA-Z0-9_]){1,15}(?!_)(?=$|' + self.re.src_ZPCc + ')'
                );
            }
            if (self.re.mention.test(tail)) {
                if (pos >= 2 && tail[pos - 2] === '@') {
                    return false;
                }
                return tail.match(self.re.mention)[0].length;
            }
            return 0;
        },

        normalize: function (match) {
            match.url = `${PUBLIC_BASE_URL}/@` + match.url.replace(/^@/, '');
        }
    });

    md.use(MarkdownItEmoji);
    md.use(MarkdownItLinkAttributes, [
        {
            matcher(href) {
                return href.includes('@')
            },
            attrs: {
                class: "mention"
            },
        },
        {
            matcher(href) {
                return href.match(/^https?:\/\//);
            },
            attrs: {
                class: "external",
                target: "_blank",
                rel: "noopener",
            },
        },
        {
            matcher(href) {
                return href.startsWith("/");
            },
            attrs: {
                class: "absolute-link",
            },
        },
        {
            matcher(href) {
                return href.startsWith("/blue/");
            },
            attrs: {
                class: "link-that-contains-the-word-blue",
            },
        },
    ]);

    if(replyTo) {
        lastReplyTo = replyTo
    }


    setupLinkPasteListener()
})

function setupLinkPasteListener() {
    bodyInput.addEventListener('paste', (e) => {
        //let expression = /(http|ftp|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/g
        const expression = /(https?:\/\/[^\s]+)/g;
        let regex = new RegExp(expression);
 
        let paste = (e.clipboardData || window.clipboardData).getData('text');
        let matches = paste.match(regex);
        if(matches && matches.length > 0) {
            for(let i=0;i<matches.length; i++) {
                if(i == 9) {
                    break
                }
                console.log(matches[i])

                processLink(matches[i]);
            }
        }
    }); 

}

async function processLink(href) {
    const res = await getLinkMetadata(href)
    console.log(res)
    if(res?.metadata?.title) {
        let link = {
            href: href,
            title: res.metadata.title,
        }
        if(res?.metadata?.image) {
            link.image = res.metadata.image
        }
        if(res?.metadata?.description) {
            link.description = res.metadata.description
        }
        if(res?.metadata?.author) {
            link.author = res.metadata.author
        }
        if(res?.metadata?.youtube_id) {
            link.youtube_id = res.metadata.youtube_id
        }
        store.addLink({
            room_id: stateKey,
            link: link,
        })
    }

}

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
        //focusTitleInput()
    }
}



let busy = false;
let uploading = false;

$: postText = uploading ? 'Uploading...' : busy ? 'Saving...' : 'Save'


async function createPost() {

    let title = titleInput.value
    let body = bodyInput.value

    if(links && links[0]?.title?.length > 0 && 
        links[0]?.description?.length > 0) {
        title = links[0].title
        body = links[0].description
    }

    if(title.length === 0 && !reply && !editingReply) {
        focusTitleInput()
        return
    }

    if(reply && replyTo == null) {
        return
    }

    if(body.length === 0) {
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
                if(file.type.startsWith('image')){
                    const thumbnailURL = await getPresignedURL(extension);
                    await uploadAttachment(file.thumbnail, thumbnailURL.url);
                    item.thumbnail = {
                        key: thumbnailURL.key,
                    }
                }
                /*
                if(file.type.startsWith('video')){
                    const previewURL = await getPresignedURL('jpeg');
                    await uploadAttachment(file.preview, previewURL.url);
                    item.preview = {
                        key: previewURL.key,
                    }
                }
                */
                if(file.info) {
                    item.info = file.info
                }
                items.push(item)
            }
        }

        let post = {
            room_id: roomID,
            type: 'space.board.post',
            content: {
                msgtype: 'post',
                title: title,
                body: body,
                //formatted_body: md.render(bodyInput.value),
            },
        }

        if(topic) {
            post.content['topic'] = topic
        }

        if(reply) {
            post.type = 'space.board.post.reply'
            post.in_thread = threadEvent
            post.is_reply = true
            post.replying_to = replyTo.event_id
            post.content['m.relates_to'] = {
                event_id: replyTo.event_id,
                'rel_type': 'm.nested_reply',
            }
        }

        if(editing) {
            post.editing = true
            post.content['m.new_content'] = {
                msgtype: 'm.text',
                title: titleInput.value,
                body: bodyInput.value,
            }
            post.content['m.relates_to'] = {
                event_id: editingEvent.event_id,
                'rel_type': 'm.replace',
            }
        }

        if(attachments && items.length > 0) {
            post.content.attachments = items
        }

        if(links && links.length > 0) {
            post.content.links = links
        }

        console.log("trying to save", post)

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

export async function focusBodyInput() {
    await tick()
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
    if(editing) {
        return
    }

    let state = {
        title: titleInput.value || '',
        body: bodyInput.value,
        focus: titleFocused ? 'title' : bodyFocused ? 'body' : null,
        cursor: titleFocused ? titleInput.selectionStart : bodyFocused ? bodyInput.selectionStart : null,
        scroll: bodyInput?.scrollTop > 0 ? bodyInput.scrollTop : null,
    }

    if(replyTo) {
        state.replyTo = replyTo
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

function handleTitlePaste(event) {
    const clipboardData = event.clipboardData || window.clipboardData;
    const pastedText = clipboardData.getData('text');
    if (pastedText.includes('\n')) {
        event.preventDefault(); 
    }
}


let emojiListActive = false;
let shortcode = '';

function bodyKeyDown(e) {
    if(e.key === 'Enter' && emojiListActive) {
        //e.preventDefault()
    }
     if (event.key === 'Escape' || event.key === 'Esc') {
    }
}

function addEmoji(e) {

    const emoji = e.detail + ` `

    const count = shortcode.length + 1;

    const caretPos = bodyInput.selectionEnd;
    const startPos = Math.max(0, caretPos - count);
    const value = bodyInput.value;
    const newValue = value.substring(0, startPos) + value.substring(caretPos);
    bodyInput.value = newValue;
    bodyInput.selectionEnd = startPos;


    let startPosition = bodyInput.selectionStart;
    let endPosition = bodyInput.selectionEnd;
    bodyInput.value = bodyInput.value.substring(0, startPosition) + emoji + bodyInput.value.substring(endPosition);

    let newCursorPosition = startPosition + emoji.length;
    bodyInput.setSelectionRange(newCursorPosition, newCursorPosition);
    killEmojiList()
    focusBodyInput()
}

function trackCaret(e) {
    setTimeout(() => {
        const pt = bodyInput.value.substring(0, bodyInput.selectionStart);
        const pattern = /:\S{2,}$/;
        //const pattern = /(?<=\s):(\S{2,})$/;
        //const pattern = /([ \n]?)[:](\S{2,})$/;

        if (pattern.test(pt)) {
            let et = pt.match(pattern)[0];
            et = et.substring(1);
            shortcode = et;
            emojiListActive = true
        } else{
            emojiListActive = false
            shortcode = '';
        }
    }, 0);
}

function killEmojiList() {
    emojiListActive = false
    shortcode = '';
}

function insertEmoji(e) {
    const emoji = e.detail
    let startPosition = bodyInput.selectionStart;
    let endPosition = bodyInput.selectionEnd;
    bodyInput.value = bodyInput.value.substring(0, startPosition) + emoji + bodyInput.value.substring(endPosition);

    let newCursorPosition = startPosition + emoji.length;
    bodyInput.setSelectionRange(newCursorPosition, newCursorPosition);
    //killEmojiList()
    focusBodyInput()
}

$: attachments = $store.editorStates[stateKey]?.attachments
$: showAttachments = $store.editorStates[stateKey]?.attachments?.length > 0;

$: links = $store.editorStates[stateKey]?.links
$: showLinks = $store.editorStates[stateKey]?.links?.length > 0;

let preview;
let previewing = false;

function togglePreview() {
    previewing = !previewing
    if(!previewing) {
        focusBodyInput()
    }
}

let lastReplyTo = null;
$: if(replyTo !== lastReplyTo) {
    lastReplyTo = replyTo
    focusBodyInput()
}


</script>

<section class="composer" 
    class:sf={showAttachments}
    class:rep={reply}>

    {#if reply && replyTo}
        <div class="reply-header">
            <div class="pa3 sm">
                <b>Replying</b>
            </div>
            <div class="grd-c c-ico ph2 mr2" on:click={kill}>
                {@html close}
            </div>
        </div>
        <Event event={replyTo} isReply={reply} interactive={false} />
    {/if}

    <div class="editor-area">
        <div class="title-container" class:hide={reply || editingReply}>
            <div class="">
                <textarea 
                    class="post-title"
                    bind:this={titleInput}
                    placeholder="Title"
                    maxlength="340"
                    on:paste={handleTitlePaste}
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
                    class:vis={previewing}
                    class:sh={reply}
                    bind:this={bodyInput}
                    placeholder={placeholder}
                    on:keydown={focusOnTitle}
                    on:keydown={updateContent}
                    on:keydown={trackCaret}
                    on:keydown={bodyKeyDown}
                    maxlength="2000"
                    on:input={updateContent}
                    on:click={updateContent}
                    on:focus={handleBodyFocus}
                    on:blur={handleBodyBlur}
                    disabled={busy}
                ></textarea>

            {#if previewing}
                <div class="preview">
                    <div class="markdown-c">
                        {@html md.render(bodyInput.value)}
                    </div>
                </div>
            {/if}
        </div>
    </div>

    {#if showAttachments}
        <Attachments uploading={uploading} roomID={stateKey}/>
    {/if}

    {#if showLinks}
        <Links uploading={uploading} roomID={stateKey}/>
    {/if}


    <div class="tools fl">
        <Attach busy={busy} on:attached={attachFiles}/>
        <InsertEmoji reply={reply} busy={busy} on:selected={insertEmoji}/>
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
        {#if editing}
            <div class="grd-c mr3 href" on:click={kill}>cancel</div>
        {/if}

        <button class="ph3" disabled={busy} on:click={createPost}>
            {postText}
        </button>

    </div>

    {#if emojiListActive && shortcode}
        <EmojiList 
            target={bodyInput}
            reply={reply}
            on:selected={addEmoji} 
            shortcode={shortcode} />
    {/if}
</section>

<style>

.composer {
    display: grid;
    grid-template-columns: auto;
    grid-template-rows: 1fr auto;
    border-bottom: 1px solid var(--border-1);
    position: relative;
    max-height: 514px;
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
    position: relative;
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
    position: relative;
}

.preview {
    margin-left: 1rem;
    margin-right: 1.5rem;

    font-size: 16px;
    background-color: var(--bg);
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    overflow: hidden;
    cursor: auto;
}

.markdown-c {
    padding-right: 1rem;
    overflow-y: auto;
    height: 100%;
}

.post-body {
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
    padding: 0.25rem 0.5rem;
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

.vis {
    visibility: hidden;
}

* {
    font-family: "Inter", "Twemoji", "Apple Color Emoji", "Segoe UI Emoji", "Arial", "Helvetica", sans-serif, "STIXGeneral", "Noto Color Emoji";
}

</style>
