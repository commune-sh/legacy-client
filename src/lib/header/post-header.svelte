<script>
import { createEventDispatcher } from 'svelte'
import {menu} from '$lib/assets/icons.js'
import { close, arrowLeftSmall } from '$lib/assets/icons.js'
import { page } from '$app/stores';
import { goto } from '$app/navigation';
import { store } from '$lib/store/store.js'

export let embed = false;

const dispatch = createEventDispatcher()

function kill() {
    let url = `/`
    if($page.params?.space) {
        url = `/${$page.params?.space}`
    }
    if($page.params?.room) {
        url = `/${$page.params?.space}/${$page.params?.room}`
    }

    if(isTopic) {
        url = url + `/topic/${$page.params?.topic}`
    }

    goto(url, {
        noscroll: true,
    })
}

function goFull() {
    let url = `/${$page.params.space}/post/${$page.params.post}`
    if($page.params?.room) {
        url = `/${$page.params?.space}/${$page.params?.room}/post/${$page.params.post}`
    }

    if($page.params?.domain) {
        url = `/${$page.params?.domain}${url}`
    }
    goto(url, {
        noscroll: true,
    })
}

$: menuToggled = $store?.menuToggled
function toggleMenu() {
    let el = document.querySelector('.space-container')
    if(!menuToggled) {
        let width = el.clientWidth
        el.style.width = `${width}px`
    } else {
        el.style.width = `auto`
    }
    store.toggleMenu()
}

$: isReply = $page.params.reply !== undefined && $page.params.reply !== null && $page.params.reply !== ''

$: isTopic= $page?.params?.topic !== undefined && 
    $page?.params?.topic !== null &&
    $page?.params?.topic !== ''

</script>


<div class="header">
    <div class="container fl">

        {#if !embed}
        <div class="menu grd">
            <div class="mi c-ico grd-c" on:click={toggleMenu}>
                {@html menu}
            </div>
        </div>
        {/if}

        <div class="fl">

            <div class="pd grd-c" class:ppd={!embed}>
                {#if isReply}
                    <span class="n">Reply Thread</span>
                    <span class="ml3 sfd" on:click={goFull}>See Full Discussion</span>
                {:else}
                    <span class="n">Discussion</span>
                {/if}
            </div>

            <div class="fl-o"></div>

        {#if !embed}
            <div class="close c-ico pd grd-c" on:click={kill}>
                {@html close}
            </div>

            <div class="back c-ico pd grd-c" on:click={kill}>
                {@html arrowLeftSmall}
            </div>
        {/if}
        </div>

    </div>
</div>

<style>
.header {
    border-bottom: 1px solid var(--border-1);
    background-color: var(--bg);
    display: grid;
    grid-template-columns: auto;
    grid-template-rows: auto;
}

.container {
    display: grid;
    grid-template-columns: auto;
    grid-template-rows: auto;
}

.pd {
    padding-left: 1rem;
    padding-right: 1rem;
}

.n {
    cursor: pointer;
    font-weight: 500;
    font-size: 1rem;
}

.back {
    display: none;
}

.menu {
    display: none;
    cursor: pointer;
}

@media screen and (max-width: 768px) {
    .container {
        grid-template-columns: 48px 1fr;
    }
    .menu {
        display: grid;
    }
    .mi {
        fill: var(--hamburger);
    }
    .close {
        display: none;
    }
    .back {
        display: block;
    }
    .ppd {
        padding-left: 0.5rem;
    }
}

.sfd {
    font-size: small;
    font-weight: 500;
    background-color: var(--shade-4);
    cursor: pointer;
    border-radius: 500px;
    padding: 0.125rem 0.5rem;
}
.sfd:hover {
    opacity: 0.9;
}
</style>
