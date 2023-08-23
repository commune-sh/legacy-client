<script>
import { PUBLIC_BASE_URL } from '$env/static/public';
import { createEventDispatcher } from 'svelte'
import { close } from '$lib/assets/icons.js'
import { store } from '$lib/store/store.js'
import { browser } from '$app/environment';
import Event from '$lib/board/event/event.svelte'

const dispatch = createEventDispatcher()

let kill =() => {
    $store.embedPost = null
    copied = false
}


$: active = $store?.embedPost?.active && 
    $store?.embedPost?.event != null

$: slug = $store?.embedPost?.event?.slug

$: src = `${PUBLIC_BASE_URL}/p/${slug}/embed`

$: iframeCode = `<iframe src="${src}" 
    style="width: 500; height: 200; border: 0; overflow: hidden;" 
    scrolling="no" 
    frameborder="0" 
    allowTransparency="true" 
    sandbox="allow-forms allow-pointer-lock allow-popups allow-same-origin allow-scripts allow-modals"
    allow="encrypted-media">`

let codeInput;
let copied = false;

function copyCode() {
    if(browser) {
        codeInput.select();
        codeInput.setSelectionRange(0, 99999);
        document.execCommand("copy");
        copied = true
    }
}

</script>

{#if active}
<div class="mask grd" 
    on:click|self|stopPropagation={kill}>
    <div class="modal grd-c" >
        <div class="space-settings">
            <div class="header grd fl">
                <div class="emb grd-c ml3 fl-o">
                    Embed
                </div>
                    <div class="c-ico grd-c ph3" on:click={kill}>
                        {@html close}
                </div>
            </div>
            <div class="fl-co pa3">
                <div class="">
                    Embed this post on your website by copying the code below.
                    {#if copied}
                        <span class="copied label ml2">
                            Copied
                        </span>
                    {/if}
                </div>
                    <div class="copy mt3" on:click={copyCode}>
                        <textarea bind:this={codeInput} class="w100" rows="5" readonly>{iframeCode}</textarea>
                </div>
                <div class="event-co mt3">
                    <div class="event">
                        <Event 
                            isPost={true} 
                            embed={true} 
                            event={$store.embedPost?.event}  />
                    </div>
                </div>
            </div>
        </div>


    </div>
</div>
{/if}


<style>
.modal {
    width: 650px;
}
.space-settings {
    display: grid;
    grid-template-rows: 48px auto;
    display: grid;
    width: 100%;
}
textarea {
    font-size: small;
    font-family: monospace;
    cursor: copy;
}

.event-co {
    background: var(--bg);
    border-radius: 7px;
    width: 100%;
    border-radius: 5px;
    overflow: hidden;
}

.event {
    overflow-y: auto;
    max-height: 200px;
}

.copy {
    cursor: copy;
}

.emb {
    font-weight: 500;
}

.copied {
    background: var(--primary);
    border-radius: 5px;
    padding: 0.125rem 0.25rem;
    color: white;
}

@media (max-width: 700px) {
    .modal {
        width: 100%;
    }
}
</style>

