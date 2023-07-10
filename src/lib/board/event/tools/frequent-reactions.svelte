<script>
import { text } from '$lib/assets/icons.js'
import { page } from '$app/stores';
import { tick, createEventDispatcher } from 'svelte'
import { store } from '$lib/store/store.js'

const dispatch = createEventDispatcher();

$: state = $store?.states[$page?.params?.space]
$: sender_id = $store.credentials?.matrix_user_id
$: isOwner = state?.owner?.user_id === sender_id
$: isSpaceAdmin = $store?.power_levels?.space?.[$store?.credentials?.matrix_user_id] == 100

export let event;

let items = ["👍", "👎", "😂", "😮", "😢", "😡"]

function react(item) {
    console.log(item)
    dispatch('react', item)
}

let customMode = false

function activate() {
    customMode = true
    dispatch('active', true)
}

$: if(customMode) {
    focusCustomInput()
}

async function focusCustomInput() {
    await tick()
    customInput.focus()
}
let customInput;
let custom;

function addCustom() {
    if(!custom) return
    dispatch('react', custom)
    kill()
}

function handleEnter(e) {
    if(e.key === 'Enter') {
        addCustom()
    }
}

function kill() {
    dispatch('kill')
    customMode = false
}

</script>

{#if !customMode}
    {#each items as item}
        <div class="icon grd-c c-ico" 
            on:click|stopPropagation={e => react(item)}>
            {item}
        </div>
    {/each}

    {#if isOwner || isSpaceAdmin}
    <div class="icon grd-c c-ico" 
        on:click|stopPropagation={activate}>
        {@html text}
    </div>
    {/if}

{:else}
<div class="custom fl">
    <div class="fl-o">
        <input 
            class="customInput"
            on:keydown={handleEnter}
            bind:this={customInput}
            bind:value={custom} 
            placeholder="custom reaction"/>
    </div>
    <div class="">
            <button class="h100" on:click={addCustom}>Add</button>
    </div>
</div>
{/if}

<style>
.icon {
    width: 18px;
    height: 18px;
    border-radius: 4px;
    padding: 0.25rem;
    font-size: 18px;
}
.icon:hover {
    background-color: var(--shade-2);
}

input {
    height: 22px;
    width: 100%;
    font-size: small;
    font-weight: 500;
}
</style>
