<script>
import { onMount, onDestroy, createEventDispatcher } from 'svelte'
import { add } from '$lib/assets/icons.js'
import { PUBLIC_BASE_URL, PUBLIC_APP_NAME } from '$env/static/public';
import { APIRequest } from '$lib/utils/request.js'

const dispatch = createEventDispatcher()

let fileInput;
let files = [];

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
    dispatch('attached', files)
    files = []

    /*
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
    */
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

</script>

<div class="c-ico" on:click={upload}>
    {@html add}
    <input 
        type="file" 
        accept="image/*"
        name="images"
        bind:this={fileInput} 
        on:change={build} 
        hidden 
        multiple
    >
</div>

<style>
</style>
