<script>
import { tick, onMount, onDestroy, createEventDispatcher } from 'svelte'
import { Editor } from '@tiptap/core'
import Placeholder from '@tiptap/extension-placeholder'
import StarterKit from '@tiptap/starter-kit'


const dispatch = createEventDispatcher()



let editor;
let composer;

onMount(() => {
    editor = new Editor({
      element: composer,
      extensions: [
        StarterKit,
        Placeholder.configure({
          placeholder: `What's on your mind?`,
        }),
      ],
      content: '',
      onTransaction: () => {
        // force re-render so `editor.isActive` works as expected
        editor = editor
            dispatch('change', {
                html: editor.getHTML(),
                text: editor.state.doc.textContent,
            })
      },
    })
    focus()
})

async function focus() {
    await tick()
    editor.view.focus()
}

onDestroy(() => {
        if (editor) {
      editor.destroy()
    }
})

</script>

<section class="editor" on:click={focus}>
        <div class="container"  bind:this={composer}>
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
}



:global(.ProseMirror p.is-editor-empty:first-child::before) {
  color: var(--placeholder-color);
  content: attr(data-placeholder);
  float: left;
  height: 0;
  pointer-events: none;
}
</style>
