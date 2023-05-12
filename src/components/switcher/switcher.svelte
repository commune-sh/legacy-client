<script>
import Logo from '../../components/logo/logo.svelte'
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

</script>
<div class="switcher">

    <Logo />

    <div class="content">
    </div>
</div>

<style>
.switcher {
    position: sticky;
    top: 0;
    height: 100vh;
    display: grid;
    grid-template-columns: auto;
    grid-template-rows: [logo] 50px [content] auto;
    border-right: 1px solid var(--border-1);
}
.content {
    padding-top: 1rem;
}
</style>
