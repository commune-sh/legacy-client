<script>
import { store } from '$lib/store/store.js'
import { back } from '$lib/assets/icons.js'
import { onMount, onDestroy, tick } from 'svelte'
import { debounce } from '$lib/utils/utils.js'
import { getGIFs, searchGIFs } from '$lib/utils/request.js'

$: service = $store.features?.gif?.service

$: name = `${service.charAt(0).toUpperCase()}${service.slice(1)}`

$: placeholder = `Search ${name} GIFs`

let searchInput;
let query;

$: queryExists = query != null && query != undefined && query != ''

function filterGIFs() {
    debounce(startSearch, 500)
}

function startSearch() {
    if(queryExists) {
        loaded = false
        categoryMode = true;
        fetchGIFs()
    }
}


$: noGIFs = $store.gif == null

$: categories = $store.gif?.categories

onMount(() => {
    searchInput.focus()
    if(noGIFs) {
        fetchCategories()
    } else {
        loaded = true;
    }
})

let loaded = false;

async function fetchCategories() {
    const res = await getGIFs()
    if(res?.tags) {
        $store.gif = {
            categories: res.tags,
            gifs: [],
        }
        loaded = true;
    }
}

let categoryMode = false;

function loadCategory(item) {
    loaded = false
    categoryMode = true;

    query = item.searchterm

    fetchGIFs()
}

let gifs = [];

let next;

async function fetchGIFs() {
    const res = await searchGIFs(query)
    if(res?.results) {
        gifs = [...res.results]
        if(res.next) {
            next = res.next
        }
        loaded = true;
    }
}

function killFilter() {
    query = ''
    categoryMode = false;
    searchInput.focus()
    gifs = []
    gifs = gifs
}

function chooseItem(item) {
    item.view = $store.emojiPicker.isChat ? 'chat' : 'board'
    store.killEmojiPicker()
    killFilter()
    $store.selectedGIF = item
}

</script>


<div class="header fl">
    {#if queryExists}
        <div class="mt1 c-ico grd-c mh2" on:click={killFilter}>
            {@html back}
        </div>
    {/if}

    <div class="search pt3 pr3 pb2 fl-o" class:pl3={!queryExists}>
        <input bind:this={searchInput} 
            bind:value={query}
            on:keydown={filterGIFs}
            placeholder={placeholder} />
    </div>

</div>

{#if !loaded}
    <div class="grd">
        <div class="loader grd-c">
        </div>
    </div>
{/if}


{#if loaded && categories && !categoryMode}
<div class="gifs">

    <div class="categories pa2">
        {#each categories as item}
            <div class="category" on:click={() => loadCategory(item)}>
                <div class="cimg" style="background: url({item.image})">
                </div>
                <div class="lab">
                    {item.searchterm}
                </div>
            </div>
        {/each}
    </div>

</div>


{/if}

{#if loaded && gifs && categoryMode}
    <div class="categories pa2">
        {#each gifs as item}
            <div class="category" on:click={() => chooseItem(item)}>
                <div class="cimg img" 
                    style="background-image: url({item.media_formats.tinygif.url})">
                </div>
            </div>
        {/each}
    </div>

{/if}


<style>

.gifs {
    overflow: hidden;
    padding-bottom: 1rem;
}

.categories {
    display: grid;
    grid-template-columns: repeat(2, 1fr); 
    grid-gap: 1rem;
    overflow-y: auto;
    height: 100%;
}

.category {
    height: 100px;
    background: var(--shade-3);
    cursor: pointer;
    position: relative;
}

.cimg {
    opacity: 0.8;
    width: 100%;
    height: 100%;
    transition: 0.1s;
    border-radius: 5px;
    background-repeat: no-repeat;
    background-size: cover;
    background-position: center;
}

.img {
    opacity: 1;
}

.img:hover {
    opacity: 0.8;
}

.category:hover .cimg{
    opacity: 1;
}

.header {
    border-bottom: 2px solid var(--border-1);
}

input {
    width: 100%;
    padding: 0.5rem;
    font-size: 14px;
}

.lab {
    position: absolute;
    left: 0;
    bottom: 0;
    margin-left: 0.25rem;
    margin-bottom: 0.25rem;
    padding: 0.25rem 0.5rem;
    background: var(--shade-3);
    border-radius: 4px;
    font-weight: 500;
    font-size: small;
    display: inline-block;
}

.c-ico {
    height: 24px;
    width: 24px;
}
.c-ico:hover {
    fill: white;
}
</style>
