<script>
import { PUBLIC_API_URL } from '$env/static/public';
import { page } from '$app/stores';
import { store } from '$lib/store/store.js'
import { more } from '$lib/assets/icons.js'
import Popup from '$lib/popup/popup.svelte'
import UserPopup from './user-popup.svelte'

$: authenticated = $store?.authenticated && 
    $store?.credentials != null
    $store?.credentials?.access_token?.length > 0


$: active = $store.verifiedSession


$: username = $store?.credentials?.username


let toggleFlow = () => {
    store.startAuthenticating()
}

$: isSpace = $page.params.space !== undefined && $page.params.space !== null &&
    $page.params.space !== ''

let logout = () => {
    store.logout()
    if(!isSpace) {
        //location.replace('/')
    }
}

let menuActive = false

let toggleMenu = () => {
    menuActive = !menuActive
}

let killed = () => {
    menuActive = false
}

let killPopup = () => {
    popup.kill()
}

let popup;
</script>

<section class="user">

{#if active && !authenticated}
<div class="grd">
    <div class="grd-c">
        <button class="btn" on:click={toggleFlow}>Log in • Sign up</button>
    </div>
</div>
{/if}

{#if active && authenticated}

<div class="con">

    <Popup
    bind:this={popup}
    trigger={"click"}
    offset={[8, 10]}
    on:killed={killed}
    placement={"top-start"}>

        <div class="ui fl" 
            slot="reference"
            class:active={menuActive}
            on:click={toggleMenu}>
            <div class="grd-c">
                <div class="avatar">
                </div>
            </div>
            <div class="grd-c">
                {username}
            </div>
        </div>


        <div class="component" slot="content">
            <UserPopup on:kill={killPopup}/>
        </div>
    </Popup>

    <div class="grd">
        <div class="c-ico grd-c ph2" on:click={logout}>
            {@html more}
        </div>
    </div>
</div>


{/if}

</section>

<style>
.user {
    border-top: 1px solid var(--border-1);
    display: grid;
}

.con {
    display: grid;
    grid-template-columns: 1fr auto;
}

.btn {
    width: 220px;
    cursor: pointer;
    border-radius: 60px;
    border: 0px;
    padding: 0.5rem;
    font-weight: bold;
    background-color: var(--primary);
    color: white;
}
.btn:hover {
    background-color: var(--primary);
}
.c-ico {
    height: 24px;
    width: 24px;
}

.ui {
    cursor: pointer;
    margin: 0.5rem;
    padding: 0.25rem;
    border-radius: 7px;
}

.ui:hover {
    background-color: var(--shade-3);
}

.active {
    background-color: var(--shade-3);
}

.avatar {
    margin-right: 0.75rem;
    height: 30px;
    width: 30px;
    border-radius: 50%;
    background-color: var(--avatar-bg);

}
</style>
