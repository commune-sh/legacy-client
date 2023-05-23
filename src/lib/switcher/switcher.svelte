<script>
import SpaceItems from '$lib/switcher/space-items.svelte'
import Logo from '$lib/logo/logo.svelte'
import { page } from '$app/stores';

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

let spaces = ["animals","games", "conspiracy", "poems"]

</script>
<div class="switcher">

    <Logo large={true} />

    <div class="content">
        <SpaceItems spaces={spaces}/>
    </div>
</div>

<style>
.switcher {
    position: sticky;
    top: 0;
    height: 100vh;
    display: grid;
    grid-template-columns: auto;
    grid-template-rows: [logo] 64px [content] auto;
    border-right: 1px solid var(--border-1);
}
.content {
    padding: 0.5rem;
}
@media screen and (max-width: 1280px) {
    .switcher {
        grid-template-rows: [logo] 48px [content] auto;
    }
}
</style>
