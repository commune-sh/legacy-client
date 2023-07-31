<script>
import { tick, onMount, onDestroy, createEventDispatcher } from 'svelte'
import { Editor } from '@tiptap/core'
import Placeholder from '@tiptap/extension-placeholder'
import StarterKit from '@tiptap/starter-kit'
import EmojiList from '$lib/composer/emoji-list.svelte'
import { Extension } from "@tiptap/core";
import { Emoji } from './tiptap/emoji.ts'


const dispatch = createEventDispatcher()




let editor;
let composer;
export let isChat = false;
export let room_alias = null;

export let initFocus = true;

let shortcode;
let emojiListActive = false;

const PreventEnter = Extension.create({
  addKeyboardShortcuts() {
    return {
      'Enter': () => emojiListActive ? true : false
    }
  },
})

let position = {
    from: 0,
    to: 0
}
onMount(() => {
    editor = new Editor({
        element: composer,
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder: `What's on your mind?`,
            }),
            PreventEnter,
            Emoji
        ],
        editorProps: {
            handleKeyDown: handleKeyDown,
            attributes: {
                class: "Editor"
            }
        },
        content: '',
        onTransaction: () => {
            editor = editor
            position = {
                from: editor.state.selection.from,
                to: editor.state.selection.to
            }
            dispatch('update', {
                //html: editor.getHTML(),
                text: editor.state.doc.textContent,
                position: {
                    from: editor.state.selection.from,
                    to: editor.state.selection.to
                }
            })
            const to = editor.state.selection.to
            const from = editor.state.selection.to - shortcode?.length + 1
            const pt = editor.state.doc.textContent.substring(0, to)
            const emp = /:(\s*[a-zA-Z]+)\s*$/;

            const isSpace = pt.substring(pt.length - 1) === " "

            if (emp.test(pt) && !isSpace) {
                let et = pt.match(emp)[0];
                et = et.substring(1);
                shortcode = et;
                emojiListActive = true
            } else {
                emojiListActive = false
                shortcode = null;
            }
        },
    })
    if(initFocus) {
        focusEditor()
    }
})

function handleKeyDown(view, e) {
    if(e.code === 'Enter') {
        return false
    }
}

export function insertText(text) {
    emojiListActive = false
    console.log("inserting", text)
    editor.commands.insertContent({type: "text", text: text})
}


export function focus() {
    focusEditor()
}

async function focusEditor() {
    await tick()
    editor.view.focus()
}

onDestroy(() => {
        if (editor) {
      editor.destroy()
    }
})

export function insertEmoji(e) {
    console.log("adding emoji", e)
    if(e.name && e.url) {
        editor.commands.setImage({src: e.url})
        editor.commands.insertContent({type: "text", text: ` `})
        return
    }
    editor.commands.insertContent({type: "text", text: `${e} `})
}

function addEmoji(e) {
    emojiListActive = false
    editor.commands.deleteRange({
        from: position.to - shortcode.length - 1,
        to: position.to
    })

    if(e.detail.name && e.detail.url) {
        editor.commands.setImage({src: e.detail.url})
        editor.commands.insertContent({type: "text", text: ` `})
        return
    }
    editor.commands.insertContent({type: "text", text: `${e.detail} `})
}

</script>
{emojiListActive}

{#if emojiListActive && shortcode}
    <EmojiList 
        room_alias={room_alias}
        isChat={false}
        target={composer}
        reply={false}
        on:selected={addEmoji} 
        shortcode={shortcode} />
{/if}

<section class="editor" 
    on:click={focus}>
    <div class="container" 
        bind:this={composer}>
        </div>
</section>

<style>
.editor {
    display: grid;
    grid-template-columns: auto;
    grid-template-rows: 1fr auto;
    cursor: text;
    overflow-y: scroll;
    min-height: 150px;
    max-height: 450px;
    padding-left: 1rem;
    padding-right: 1rem;
    margin-right: 1.5rem;
}

::-webkit-scrollbar {
    width: 4px;
}

::-webkit-scrollbar-track {
    background: var(--bg);
}


div :global(.ProseMirror p.is-editor-empty:first-child::before) {
  color: var(--placeholder-color);
  content: attr(data-placeholder);
  float: left;
  height: 0;
  pointer-events: none;
}

div :global(.Editor) {
    font-size: 16px;
}
div :global(.Editor p) {
    line-height: 1.6;
}

div :global(.Editor img) {
    height: 20px;
    width: 20px;
    object-fit: contain;
    vertical-align: text-bottom;
}
</style>
