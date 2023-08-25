<script>
import { PUBLIC_BASE_URL } from '$env/static/public';
import { createEventDispatcher } from 'svelte'
import {menu} from '$lib/assets/icons.js'
import { close, arrowLeftSmall } from '$lib/assets/icons.js'
import { page } from '$app/stores';
import { goto } from '$app/navigation';
import { store } from '$lib/store/store.js'
import Logo from '$lib/logo/logo.svelte'

export let embed = false;
export let post = null;

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

    if($page.url.search) {
        if(!$page.url.search.startsWith('?context')) {
            url = `${url}${$page.url.search}`
        }
    }

    if($page.url.pathname.startsWith('/all')) {
        url = `/all`
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

function openThread() {
    let url = `${PUBLIC_BASE_URL}/p/${threadSlug}`
    goto(url, {
        noscroll: true,
    })
}

function goToSpace() {
    let url = `/${post.room_alias}`
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

$: newItems = $store?.notifications?.some(n => !n.read);


$: alias = post?.room_alias ? post?.room_alias : null

$: isDirect = post?.content?.['m.relates_to']?.thread_event_id !== undefined && 
    post?.content?.['m.relates_to']?.thread_event_id !== null &&
    post?.content?.['m.relates_to']?.thread_event_id !== ''

$: threadSlug = post?.content?.['m.relates_to']?.thread_event_id?.substr(-11)

</script>


<div class="header" class:sticky={embed}>
    <div class="container fl">

        {#if !embed}
        <div class="menu grd">
            <div class="mi c-ico grd-c" on:click={toggleMenu}>
                {@html menu}
            </div>
            {#if newItems}
                <div class="dot">
                </div>
            {/if}
        </div>
        {:else}
        <div class="logo">
            <Logo />
        </div>
        {/if}

        <div class="fl">

            {#if embed && alias}

                <a class="alias grd-c fl" href={`/${alias}`}>
                    <div class="grd-c ico-s ">
                        {@html arrowLeftSmall}
                    </div>
                    <div class="grd-c mr2">
                        <span class="n">  {alias}</span>
                    </div>
                </a>

            {:else}
                <div class="pd grd-c" class:ppd={!embed}>
                    {#if isReply}
                        <span class="n">Reply Thread</span>
                        <span class="ml3 sfd" on:click={goFull}>See Full Discussion</span>
                    {:else}
                        <span class="n">Discussion</span>
                    {/if}
                </div>

            {/if}

                <div class="fl-o"></div>

            {#if embed && isDirect && threadSlug}
                <div class="pd grd-c">
                    <div class="ml3 sfd sff" on:click={openThread}>See Full
        Discussion</div>
                </div>
            {/if}

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

.sticky {
    position: sticky;
    top: 0;
    z-index: 100;
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
    position: relative;
}

.logo {
    display: none;
}

@media screen and (max-width: 785px) {
    .container {
        grid-template-columns: 48px 1fr;
    }
    .logo {
        display: grid;
    }
}
@media screen and (max-width: 768px) {
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

.sff {
    padding: 0.25rem 0.75rem;
}

.dot {
    right: 8px;
    top: 8px;
}
.alias {
    color: var(--text-light);
    font-size: small;
    cursor: pointer;
    border-radius: 500px;
    margin-left: 0.75rem;
    background-color: var(--shade-3);
    padding-top: 0.125rem;
    padding-bottom: 0.125rem;
}

.alias:hover {
    color: var(--text-1);
    background-color: var(--shade-4);
}
</style>
