<script>
import { tick, onMount, onDestroy, createEventDispatcher } from 'svelte'
import Editor from '$lib/editor/editor.svelte'
import { add, send, close } from '$lib/assets/icons.js'
import { PUBLIC_BASE_URL, PUBLIC_APP_NAME } from '$env/static/public';
import { APIRequest } from '$lib/utils/request.js'
import autosize from 'autosize'


const dispatch = createEventDispatcher()

function kill() {
    dispatch('kill')
}

export let postRoomID;

let editor;

onMount(() => {
    autosize(titleInput)
    focusTitleInput()
})

async function focusTitleInput() {
    await tick()
    titleInput.focus()
}

let fileInput;
let files = [];

let items = [];

let tooLarge = false;

let build = (e) => {

    if(e.target.files.length > 13) {
        alert("That's too many attachments at once.")
        return
    }

    for(let i =0 ; i < e.target.files.length ; i++) {

        const file = e.target.files[i]

        if (file.size > 8388608) {
            files = []
            files = files
            tooLarge = true
            break
        }
        files = [...files, e.target.files[i]]

    }


    for(let i =0 ; i < files.length; i++) {

        var reader = new FileReader();
        const file = files[i]
        reader.readAsDataURL(file);

        reader.onload = e => {

            console.log(file)
            APIRequest({
                url: `${PUBLIC_BASE_URL}/media/presigned_url`,
                method: 'GET',
            }).then((res) => {
                console.log(res)
                if(res?.url) {
                    uploadFile(file, res.url)
                }
            });
        }
    }


    files = []
    fileInput.value = ''
}

function uploadFile(file, url) {
    fetch(url, {
    method: "PUT",
    body: file
  })
    .then(response => {
      if (response.ok) {
        console.log("File uploaded successfully!");
      } else {
        console.error("Error uploading file:", response.statusText);
      }
    })
    .catch(error => {
      console.error("Error uploading file:", error);
    });
}

function upload() {
    fileInput.click()
}

let content = null;

function updateContent(e) {
    content = e.detail
}
function createPost() {
    console.log(content)
}

let titleInput;

function handleEnter(e) {
    if(e.key === 'Enter') {
        e.preventDefault()
        if(titleInput.value.length > 0) {
            editor.focus()
        }
    }
}

</script>

<section class="composer">
    <div class="editor-area">
        <div class="title-container">
            <div class="">
            <textarea 
                class="post-title"
                bind:this={titleInput}
                placeholder="Title"
                maxlength="140"
                on:keydown={handleEnter}
            ></textarea>
            </div>
            <div class="c-ico ml2" on:click={kill}>
                {@html close}
            </div>
        </div>
        <Editor 
            bind:this={editor} 
            on:focusTitle={focusTitleInput}
            initFocus={false} 
            on:change={updateContent}/>
    </div>
    <div class="tools fl">
        <div class="c-ico" on:click={upload}>
            {@html add}
            <input 
                type="file" 
                name="images"
                bind:this={fileInput} 
                on:change={build} 
                hidden 
                multiple
            >
        </div>
        <div class="fl-o">
        </div>
        <div class="c-ico" on:click={createPost}>
            {@html send}
        </div>
    </div>
</section>

<style>
.composer {
    display: grid;
    grid-template-columns: auto;
    grid-template-rows: 1fr auto;
    border-bottom: 1px solid var(--border-1);
}

.editor-area {
    display: grid;
    grid-template-rows: auto 1fr;
    overflow-y: hidden;
}

.composer {
    max-height: 480px;
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
    padding-top: 1rem;
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
    height: 22px;
}
</style>
