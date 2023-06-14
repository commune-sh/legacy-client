<script>
import SpaceItems from '$lib/switcher/space-items.svelte'
import { store } from '$lib/store/store.js'
import Logo from '$lib/logo/logo.svelte'
import CreateSpace from './create-space.svelte'
import Discover from './discover.svelte'
import Settings from './settings.svelte'
import Theme from './theme.svelte'
import { page } from '$app/stores';

$: authenticated = $store?.authenticated && 
    $store?.credentials != null
    $store?.credentials?.access_token?.length > 0

$: isIndex = $page.route.id === '/'

$: if(isIndex) {
    //toggleFavicon()
} else {
    //toggleFavicon()
}

function toggleFavicon() {

    var newFavicon = document.createElement('link');
    newFavicon.rel = 'icon';
    newFavicon.type = 'image/png';
    newFavicon.href = 'path/to/new-favicon.png';

    if(isIndex) {
        newFavicon.href = '/favicon-alt.png'
    } else {
        newFavicon.href = '/favicon.png'
    }

    var existingFavicon = document.querySelector('link[rel="icon"]') || document.createElement('link');

    document.head.replaceChild(newFavicon, existingFavicon);

}

$: spaces = $store?.spaces

$: verifiedSession = $store.verifiedSession

</script>
<div class="switcher">
    <div class="switcher-container fl-co">

        <div class="mt"></div>

        <Logo large={true} />

        <div class="sepc grd">
            <div class="sep grd-c">
            </div>
        </div>

        <div class="content">
            <SpaceItems spaces={spaces}/>
        </div>


        {#if verifiedSession}
        <CreateSpace />
        <Discover />
        {/if}

        <div class="fl-o">
        </div>

        <div class="">
            <Theme />
            <Settings />
        </div>
    </div>

</div>

<style>
.switcher {
    display: grid;
    grid-template-columns: auto;
    grid-template-rows: auto;
    border-right: 1px solid var(--border-1);
    background-color: var(--bg);
    overflow: hidden;
}

.switcher-container {
    overflow-y: auto;
    overflow-x: hidden;
}

.mt {
    margin-top: 12px;
    width: 100%;
}

::-webkit-scrollbar {
    width: 0px;
}
::-webkit-scrollbar-thumb {
    background: var(--scrollbar-thumb);
}
::-webkit-scrollbar-track {
    background: var(--scrollbar-track);
}
.content {
}

.sepc {
    margin-top: 0.75rem;
    margin-bottom: 0.75rem;
}
.sep {
    width: 24px;
    height: 3px;
    border-radius: 2px;
    background-color: var(--border-1);
}
</style>
