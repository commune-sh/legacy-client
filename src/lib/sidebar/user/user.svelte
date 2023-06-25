<script>
import { PUBLIC_MEDIA_URL } from '$env/static/public';
import { page } from '$app/stores';
import { store } from '$lib/store/store.js'
import { user } from '$lib/assets/icons.js'
import Popup from '$lib/popup/popup.svelte'
import UserPopup from './user-popup.svelte'

$: authenticated = $store?.authenticated && 
    $store?.credentials != null
    $store?.credentials?.access_token?.length > 0


$: active = $store.verifiedSession


$: username = $store?.credentials?.username


let login = () => {
    store.startAuthenticating("login")
}

let signup = () => {
    store.startAuthenticating("signup")
}

$: isSpace = $page.params.space !== undefined && $page.params.space !== null &&
    $page.params.space !== ''

let logout = () => {
    store.logout()
    if(!isSpace) {
        //location.replace('/')
        if(isIndex) {
            //location.replace('/')
        }
    }
}

$: isIndex = $page.url?.pathname === '/'

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

$: profileSpace = $store?.spaces?.find(s => s.room_id ===
        $store?.credentials?.user_space_id)
$: avatar = $store?.credentials?.avatar_url?.length > 0 ?
`${PUBLIC_MEDIA_URL}/${$store.credentials?.avatar_url}` : null

</script>

<section class="user">

{#if active && !authenticated}
<div class="us-c">
    <div class="co grd-c fl">
        <button class="btn log ml3 mr1" on:click={login}>Log in</button>
        <button class="btn mr3 ml1" on:click={signup}>Sign up</button>
    </div>
</div>
{/if}

{#if active && authenticated}

<div class="con">

    <Popup
    bind:this={popup}
    trigger={"click"}
    offset={[8, 0]}
    on:killed={killed}
    mask={true}
    shadow={`0px 9px 15px -7px rgba(0,0,0,0.2)`}
    placement={"top-start"}>

        <div class="ui fl" 
            slot="reference"
            class:active={menuActive}
            on:click={toggleMenu}>
            <div class="grd-c">
                <div class="avatar grd"
                style="background-image: url({avatar})">
                    {#if !avatar}
                            <div class="ico-s grd-c">
                                {@html user}
                            </div>
                    {/if}
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

</div>


{/if}

</section>

<style>
.us-c {
    display: grid;
}

.co {
    width: 100%;
}

.user {
    border-top: 1px solid var(--border-1);
    display: grid;
}

.con {
    display: grid;
    grid-template-columns: 1fr auto;
}

.btn {
    cursor: pointer;
    border-radius: 60px;
    border: 0px;
    padding: 0.5rem;
    font-weight: bold;
    background-color: var(--primary);
    color: white;
    width: 100%;
    height: 28px;
}
.btn:hover {
    opacity: 0.9;
}

.log {
    background-color: var(--shade-2);
    color: var(--text-1);
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
    background-size: cover;
    background-position: center center;
    background-repeat: no-repeat;

}
.ico-s {
    height: 16px;
    width: 16px;
}
</style>
