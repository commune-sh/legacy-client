<script>
import { PUBLIC_API_URL } from '$env/static/public';
import { onMount } from 'svelte'
import { getPresignedURL, uploadAttachment } from '$lib/utils/request.js'

let fileInput;
let uploading = false;


let build = async (e) => {
    uploading = true;

    const file = e.target.files[0]

    if (file.size > 3145728) {
        alert("That's too large. 3MB max.")
        uploading = false
        return
    }



}

function select() {
    fileInput.click()
}

</script>

<div class="fl-co">
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

    <div class="">
        <button class="ph3 pv2" on:click={select}>Upload Emoji</button>
        <input 
            type="file" 
            accept="image/*"
            bind:this={fileInput} 
            on:change={build} 
            hidden 
        >
    </div>

</div>

<style>
div {
    line-height: 1.5;
}
</style>
