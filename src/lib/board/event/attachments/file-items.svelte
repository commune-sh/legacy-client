<script>
import { PUBLIC_MEDIA_URL } from '$env/static/public'
import { formatFileSize, downloadFile } from '$lib/utils/utils.js'
import { download as downloadicon } from '$lib/assets/icons.js'
export let files;
export let isChat = false;

function size(file) {
    return formatFileSize(file.size)
}

function download(file) {
    downloadFile(`${PUBLIC_MEDIA_URL}/${file.key}`, file.name)
}

</script>

<div class="files mh3">
    {#each files as file}
        <div class="file-item mb2 fl" on:click={download(file)}>
            <div class="fl-co mr3">
                <div class="name">
                    {file.name}
                </div>
                <div class="fl">
                    <div class="size grd-c">
                        {file.type}
                    </div>
                    <div class="ml1 size grd-c">
                        - {size(file)}
                    </div>
                </div>
            </div>
            <div class="ico-s grd-c fic do">
                {@html downloadicon}
            </div>
        </div>
    {/each}
</div>

<style>
.files {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
}
.file-item {
    background-color: var(--shade-3);
    border-radius: 5px;
    padding: 0.25rem 0.5rem;
    display: grid;
    grid-template-columns: auto 1fr auto;
    cursor: pointer;
}

.file-item:hover .do {
    fill: white;
}

.file-item:hover .name {
    color: var(--primary);
}

.fic {
    width: 14px;
    height: 14px;
}

.name {
    max-width: 400px;
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    word-break: break-word;
    font-size: 13px;
}
.size {
    font-size: 11px;
    font-weight: 500;
    color: var(--text-light);
}
</style>
