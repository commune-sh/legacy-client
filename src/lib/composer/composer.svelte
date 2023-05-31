<script>
import { tick, onMount, onDestroy, createEventDispatcher } from 'svelte'
import Editor from '$lib/editor/editor.svelte'
import { add, send } from '$lib/assets/icons.js'
import { PUBLIC_BASE_URL, PUBLIC_APP_NAME } from '$env/static/public';
import { APIRequest } from '$lib/utils/request.js'


const dispatch = createEventDispatcher()


let editor;

onMount(() => {
})

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
</script>

<section class="composer">
    <div class="editor-area">
        <Editor on:change={updateContent}/>
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
    overflow-y: hidden;
}

.composer {
    max-height: 280px;
}

.tools {
    padding: 1rem;
}
.c-ico {
    height: 22px;
    width: 22px;
}
</style>
