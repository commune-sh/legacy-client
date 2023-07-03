<script>
import { APIRequest } from '$lib/utils/request.js'
import { PUBLIC_API_URL, PUBLIC_APP_NAME } from '$env/static/public'
import { onMount } from 'svelte'
import { store } from '$lib/store/store.js'
import PublicSpaceItem from './public-space-item.svelte'

let ready = false;

$: spaces = $store.spaces

onMount(() => {
})

$: if(spaces?.length > 1) {
    ready = true;
}
$: if(authenticated && spaces?.length == 1) {
    if($store.defaultSpaces?.length > 0) {
        spaces = $store.defaultSpaces
    } else {
        fetchDefaultSpaces()
    }
}

function fetchDefaultSpaces() {

    let opt = {
      url: `${PUBLIC_API_URL}/default_spaces`,
      method: 'GET',
    }


    APIRequest(opt)
    .then(resp => {
        if(resp) {
            spaces = resp.spaces
        }
    })
}


$: authenticated = $store?.authenticated && 
    $store?.credentials != null
    $store?.credentials?.access_token?.length > 0

$: label = authenticated ? 'your spaces' : 'public spaces'

function showAbout() {
    $store.aboutOpen = true
}

$: hide = authenticated && $store.spaces?.length == 1

$: authenticated = $store?.authenticated && 
    $store?.credentials != null
    $store?.credentials?.access_token?.length > 0

$: senderVerified = authenticated && $store.credentials?.verified

function createSpace() {
    if(!authenticated) {
        store.startAuthenticating("login")
        return
    }
    if(!senderVerified) {
        $store.showVerificationAlert = true
        return
    }
    store.toggleCreateSpace()
}

</script>

<div class="index-sidebar">
    <div class="con fl-co">
        <div class="mt3">
            <div class="">
                Welcome to {PUBLIC_APP_NAME}'s Matrix-powered 
                communities. 
            </div>
            <div class="mt2">
                <span class="href" on:click={showAbout}>Learn More</span>
            </div>
        </div>

        {#if ready}
                <div class="mt4 label">
                    {#if !hide}
                        {label}
                    {:else}
                        public spaces
                    {/if}
                </div>
            <div class="fl-co mt2 mb3">
                {#each spaces as space}
                    {#if !space?.is_profile}
                        <PublicSpaceItem space={space} />
                    {/if}
                {/each}

                <div class="mv3 cr ml2">
                    <button on:click={createSpace}>
                        Create Your Own Space
                    </button>
                </div>

            </div>
        {/if}

    </div>
</div>

<style>
.index-sidebar {
    display: grid;
    overflow: hidden;
    height: 100%;
}
.con {
    height: 100%;
    overflow-x: hidden;
    overflow-y: auto;
    padding: 0.5rem;
    line-height: 1.5;
}

::-webkit-scrollbar {
    width: 4px;
}
::-webkit-scrollbar-thumb {
    background: transparent;
    transition: 0.1s;
}
::-webkit-scrollbar-track {
    background: transparent;
    transition: 0.1s;
}

.con:hover::-webkit-scrollbar-thumb {
    background: var(--scrollbar-thumb);
}
</style>
