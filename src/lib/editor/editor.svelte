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
            dispatch('change', { value: editor.getHTML() })
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
    <div class="editor-area">
        <div class="container"  bind:this={composer}>
        </div>
    </div>
    <div class="">
        tools
    </div>
</section>

<style>
.editor {
    display: grid;
    grid-template-columns: auto;
    grid-template-rows: 1fr auto;
    padding-right: 1rem;
    padding-left: 1rem;
    border-bottom: 1px solid var(--border-1);
    min-height: 150px;
    max-height: 350px;
    cursor: text;
}

.editor-area {
    overflow-y: scroll;
}

.composer {
    max-height: 200px;
}

:global(.ProseMirror p.is-editor-empty:first-child::before) {
  color: var(--placeholder-color);
  content: attr(data-placeholder);
  float: left;
  height: 0;
  pointer-events: none;
}
</style>
