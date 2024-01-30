<script>
import { page } from '$app/stores';
import { onMount, createEventDispatcher } from 'svelte'
import { goto } from '$app/navigation';
import { store } from '$lib/store/store.js'
import { joinSpace } from '$lib/utils/request.js'
import { PUBLIC_APP_NAME, PUBLIC_MEDIA_URL } from '$env/static/public';

const dispatch = createEventDispatcher()

$: header = space?.header ? `${PUBLIC_MEDIA_URL}/${space?.header}` : null
$: avatar = space?.avatar ? `${PUBLIC_MEDIA_URL}/${space?.avatar}` : null

export let space;

function goToSpace() {
    let url = `/${space.alias}`
    goto(url, {noscroll: true})
    dispatch('kill')
}


$: authenticated = $store?.authenticated && 
    $store?.credentials != null
    $store?.credentials?.access_token?.length > 0

$: joinedSpace = authenticated && 
    $store.rooms?.find(x => x === space?.room_id) != null 

let busy;

async function join() {
    if(!authenticated) {
        store.startAuthenticating("login")
        return
    }
    busy = true
    if(!joinedSpace) {
        const resp = await joinSpace(space?.room_id);
        if(resp && resp.space) {
            console.log(resp)
            if(!resp?.space?.is_profile) {
                store.addSpace(resp.space)
            }
            store.addRoom(resp.space.room_id)
            if($page?.url.pathname == "/") {
                $store.reloadFeed = true
            }
        }
        if(resp && resp?.error) {
            console.log(resp)
            $store.alert = {
                active: true,
                message: resp.error
            }
        }
    } 
    busy = false
}
</script>

<div class="item pa2">
    <div class="space"
        on:click={goToSpace}>

        <div class="banner rel" 
            style="background-image: url({header})">

            {#if !joinedSpace}
                <div class="join">
                    <button class="ph2 pv1" 
                        disabled={busy}
                        on:click|stopPropagation={join}>
                        {busy ? 'Joining' : 'Join'}
                    </button>
                </div>
            {:else}
            {/if}


        </div>

        <div class="fl-co">

            <div class="pa2 mt1 snm">
                    {space.name ? space.name : space.alias}
            </div>

            <div class="ph2 mt1 mb2 sm desc">
                {#if space.topic}
                    {space.topic}
                {:else}
                    No description.
                {/if}
            </div>

        </div>

    </div>
</div>

<style>

.item {
    height: fit-content;
}

.space {
    background: var(--shade-2);
    border-radius: 7px;
    transition: 0.2s;
    display:grid;
    cursor: pointer;
    grid-template-rows: 140px 1fr;
    border: 1px solid var(--shade-2);
    height: 100%;
}

.banner {
    background: var(--bg);
    border-radius: 7px 7px 0 0 ;
    background-size: cover;
    background-position: center center;
    background-repeat: no-repeat;
    position: relative;
}

.join {
    position: absolute;
    top: 1rem;
    right: 1rem;
}


.alias {
    background: var(--bg);
    padding: 0.25rem 0.5rem;
    border-radius: 5px;
    display: inline-block;
    transtion: 0.1s;
}

.space:hover{
    opacity: 0.9;
}

a, a:link, a:visited, a:active {
    text-decoration: none;
    color: var(--text);
}
.desc {
    color: var(--text-light);
    line-height: 1.5;
}

.snm {
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
@media (max-width: 700px) {
    .space {
        grid-template-rows: 100px 1fr;
    }
}
</style>
