<script>
import SpaceItems from '$lib/switcher/space-items.svelte'
import { store } from '$lib/store/store.js'
import Logo from '$lib/logo/logo.svelte'
import CreateSpace from './create-space.svelte'
import Discover from './discover.svelte'
import Settings from './settings.svelte'
import Theme from './theme.svelte'
import SkeletonSpaceItems from '$lib/skeleton/skeleton-space-items.svelte'
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


$: spaces = $store?.spaces

$: verifiedSession = $store.verifiedSession

$: spacesFetched = $store.spacesFetched

</script>
<div class="switcher">
    <div class="switcher-container fl-co sel-no">

        <div class="mt"></div>

        <Logo large={true} />

        <div class="sepc grd">
            <div class="sp"></div>
            <div class="sep grd-c"></div>
        </div>




        <div class="sepc grd">
            <div class="sep grd-c"></div>
            <div class="sp"></div>
        </div>



        <div class="fl-o">
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
    height: 100%;
}

.switcher-container {
    overflow: hidden;
}

.items {
    overflow: hidden;
    position:relative;
    height: 100%;
}

.mt {
    margin-top: 12px;
    width: 100%;
}

.sp {
    height: 0.75rem;
}

.sep {
    width: 24px;
    height: 3px;
    border-radius: 2px;
    background-color: var(--border-1);
}

.tf {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    height: 0.75rem;
    background: linear-gradient(to bottom, var(--bg), transparent);
    z-index: 100;
}

.bf {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 0.75rem;
    background: linear-gradient(to bottom, transparent, var(--bg));
    z-index: 100;
}

</style>
