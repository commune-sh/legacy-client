<script>
import { logo } from '/src/assets/logo.js'
import { page } from '$app/stores';

$: isIndex = $page.route.id === '/'

$: if(isIndex) {
    toggleFavicon()
} else {
    toggleFavicon()
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
    <div class="logo grd">
        <a class="grd-c" href="/">
            <div class="l-c grd" class:l-c-a={isIndex}>
                <div class="l-c-i grd-c" class:l-c-t={isIndex}>
                    {@html logo}
                </div>
            </div>
        </a>
    </div>
    <div class="content">
    </div>
</div>

<style>
.switcher {
    position: sticky;
    top: 0;
    height: 100vh;
    background-color: var(--shade-3);
    display: grid;
    grid-template-columns: auto;
    grid-template-rows: [logo] 64px [content] auto;
}
.content {
    padding-top: 1rem;
}
.logo {
    cursor: pointer;
    transition: 0.1s;
    justify-self: center;
    align-self: center;
    display: grid;
}

.limg {
    height: 22px;
    width: 22px;
}

.logo:hover {
    opacity: 0.9;
}
.l-c {
    height: 38px;
    width: 38px;
    background-color: var(--logo-bg);
    border-radius: 6px;
    transition: 0.1s;
}

.l-c:hover {
    background-color: var(--primary);
}

.l-c:hover .l-c-i {
    fill: var(--logo-shade-2);
}
.l-c-a {
    background-color: var(--primary);
}


.l-c-i {
    height: 20px;
    width: 20px;
    fill: var(--logo-shade-1);
}

.l-c-t {
    fill: var(--logo-shade-2);
}

</style>
