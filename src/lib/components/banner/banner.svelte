<script>
import { getPresignedURL, uploadAttachment } from '$lib/utils/request.js'
import { createEventDispatcher } from 'svelte'
import { addImage, trash } from '$lib/assets/icons.js'

const dispatch = createEventDispatcher()

export let banner;

$: exists = banner != undefined && banner.length > 0

let fileInput;
let uploading = false;

let build = async (e) => {
    console.log("attaching....")
    uploading = true


    for(let i =0 ; i < e.target.files.length ; i++) {

        const file = e.target.files[i]

        if (file.size > 8388608) {
            break
        }

        if(file.type.includes('image')) {
            var image = new Image();
            image.src = URL.createObjectURL(file)
            image.onload = () => {
                file.info = {}
                file.info.h = image.height
                file.info.w = image.width
                image.remove()
                URL.revokeObjectURL(image.src);

                let width = image.width;
                let height = image.height;

                let scaleFactor = 1;

                if (width > height) {
                    scaleFactor = 400 / height;
                    width *= scaleFactor;
                    height = 400;
                } else {
                    scaleFactor = 400 / width;
                    height *= scaleFactor;
                    width = 400;
                }

                const canvas = document.createElement('canvas');
                canvas.width = 400;
                canvas.height = 400;

                const offsetX = (width - 400) / 2;
                const offsetY = (height - 400) / 2;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(image, -offsetX, -offsetY, width, height);


                canvas.toBlob(async function(blob) {
                    banner = URL.createObjectURL(blob);

                    const extension = file.name.split('.').pop();
                    const presignedURL = await getPresignedURL(extension);
                    await uploadAttachment(blob, presignedURL.url);

                    dispatch('uploaded', presignedURL.key )
                    uploading = false

                }, 'image/jpeg', 0.8);

            }

        }

    }

}

function select() {
    fileInput.click()
}

function remove() {
    banner = null
    dispatch('removed')
}

</script>

<div class="c grd" on:click={select}
    class:op={uploading}
    style="background-image: url({banner})">

    <div class="grd-c ico-s">
        {@html addImage}
    </div>

{#if uploading}
        <div class="ms grd">
            <div class="loader grd-c">
            </div>
        </div>
{/if}

{#if exists}
<div class="trash" on:click|stopPropagation={remove}>
    <div class="ico-s grd-c">
        {@html trash}
    </div>
</div>
{/if}

<input 
    type="file" 
    accept="image/*"
    name="banner"
    bind:this={fileInput} 
    on:change={build} 
    hidden 
>
</div>

<style>

.op {
    opacity: 0.3;
}
.c {
    position: relative;
    background: var(--bg);
    border-radius: 7px;
    cursor: pointer;
    background-size: cover;
    background-position: center center;
    background-repeat: no-repeat;
}

.ms {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    padding-left: 0.5rem;
}
.op {
    opacity: 0.3;
}
.op:hover {
    opacity: 0.3;
    outline: none;
}
.loader {
    border-top: 2px solid var(--primary);
    border-right: 2px solid var(--primary);
    border-bottom: 2px solid var(--primary);
    border-left: 2px solid transparent;
    height: 20px;
    width: 20px;
}
.trash {
    position: absolute;
    right: 0;
    bottom: 0;
    border-radius: 50%;
    background-color:var(--primary);
    height: 30px;
    width: 30px;
    display: grid;
    cursor: pointer;
}
.ico-s {
    fill: white;
    height: 18px;
    width: 18px;
}
.trash:hover{
    background-color:var(--primary);
}
.trash:hover .ico-s{
    opacity: 1;
}

</style>
