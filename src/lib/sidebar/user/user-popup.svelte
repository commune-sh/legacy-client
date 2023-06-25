<script>
import { page } from '$app/stores';
import { store } from '$lib/store/store.js'
import { logout as leave, edit, alert } from '$lib/assets/icons.js'
import {createEventDispatcher} from 'svelte';

const dispatch = createEventDispatcher();

function kill() {
    dispatch('kill')
}

$: isSpace = $page.params.space !== undefined && $page.params.space !== null &&
    $page.params.space !== ''

function logout() {
    store.logout()
    kill()
    if(!isSpace) {
        //location.replace('/')
        if(isIndex) {
            //location.replace('/')
        }
    }
}

function verify() {
    $store.startAccountVerification = true
    kill()
}

function editProfile() {
    $store.userSettings = true
    kill()
}

$: verified = $store.credentials?.verified

</script>

<div class="user-popup">
    <div class="items fl-co">

    {#if !verified}
        <div class="item fl warn" on:click={verify}>
            <div class="grd-c fl-o">
                Verify your account
            </div>
            <div class="ico-s alert">
                {@html alert}
            </div>
        </div>

    {/if}

        <div class="item fl" on:click={editProfile}>
            <div class="grd-c fl-o">
                Edit Profile
            </div>
            <div class="ico-s leave">
                {@html edit}
            </div>
        </div>


        <div class="item fl" on:click={logout}>
            <div class="grd-c fl-o">
                Logout
            </div>
            <div class="ico-s leave">
                {@html leave}
            </div>
        </div>

    </div>
</div>

<style>
.user-popup {
    width: 218px;
    background-color: var(--shade-3);
    border-radius: 7px;
    padding: 0.25rem;
}
.item {
    cursor: pointer;
    border-radius: 7px;
    padding: 0.5rem;
    font-weight: bold;
    font-size: 0.8rem;
}
.item:hover {
    background-color: var(--context-menu-hover);
}

.warn {
    color: red;
}
.warn .alert{
    fill: red;
}
</style>
