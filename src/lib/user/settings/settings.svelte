<script>
import { onMount, createEventDispatcher } from 'svelte'
import { close } from '$lib/assets/icons.js'
import { store } from '$lib/store/store.js'
import Profile from './pages/profile.svelte'
import Account from './pages/account.svelte'

const dispatch = createEventDispatcher()


let active = false;

let kill =() => {
    active = false;
    $store.userSettings = {
        active: false,
        mode: null
    };
}


$: active = $store.userSettings?.active

$: profileMode = $store.userSettings?.mode === 'profile'
$: accountMode = $store.userSettings?.mode === 'account'

function goToProfile() {
    $store.userSettings.mode = 'profile'
}
function goToAccount() {
    $store.userSettings.mode = 'account'
}

</script>

{#if active}
<div class="mask grd" 
    on:click|self|stopPropagation={kill}>
    <div class="modal grd-c" >
        <div class="space-settings">
            <div class="header grd fl">
                <div class="grd-c ml3 fl-o fl sel-no">

                    <div class="s-item" 
                        on:click={goToProfile}
                        class:active={profileMode}>
                        Profile
                    </div>

                    <div class="s-item" 
                        on:click={goToAccount}
                        class:active={accountMode}>
                        Account
                    </div>

                </div>
                    <div class="c-ico grd-c ph3" on:click={kill}>
                        {@html close}
                </div>
            </div>
            <div class="page pa3">

                {#if profileMode}
                    <Profile on:kill={kill}/>
                {/if}

                {#if accountMode}
                    <Account on:kill={kill}/>
                {/if}

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
.page {
    display: grid;
}

@media (max-width: 700px) {
    .modal {
        width: 100%;
    }
}

.s-item {
    padding-bottom: 0.5rem;
    cursor: pointer;
    margin-right: 1rem;
    opacity: 0.7;
    font-size: 1.1rem;
}

.s-item:hover {
    opacity: 1;
}

.active {
    font-weight: 500;
    opacity: 1;
    border-bottom: 2px solid var(--primary);
}

</style>

