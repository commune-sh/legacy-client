<script>
import { PUBLIC_APP_NAME } from '$env/static/public';
import Logo from '$lib/logo/logo.svelte'
import { createEventDispatcher } from 'svelte'
const dispatch = createEventDispatcher()

function switchToIndex() {
    dispatch('show-index')
}
let hovered = false;
</script>

<div class="root">
    <nav class="nav ">
        <a class="lnk fl" href="/" 
            on:mouseleave={() => hovered = false}
            on:mouseover={() => hovered = true}>
            <Logo large={true} hovered={hovered}/>
            <div class="name ml3 grd-c">
                <a href="/">{PUBLIC_APP_NAME}</a>
            </div>
        </a>
        <div class="fl-o">
        </div>
        <div class="">
            <ul class="nav-links">
                <li class="nav-link">
                    <a href="https://github.com/commune-os/commune-server"
                        target="_blank">Code</a>
                </li>
            </ul>
        </div>
    </nav>
    <section class="copy">
        <div class="c grd-c fl-co">
            <div class="biggus">
                Free and Open <br> communities
            </div>
            <div class="smallus ph3">
                Create Matrix-powered communities that are publicly accessible
                and federated.
            </div>
            <div class="grd-c mt5 mh3">
                <button class="open" on:click={switchToIndex}>Open {PUBLIC_APP_NAME}</button>
            </div>
        </div>
    </section>
</div>

<style>
.root {
    padding: 1.5rem;
}

.nav {
    margin: 0 auto;
    display: flex;
    max-width: 1324px;
    width: 100%;
}
.name {
    font-size: 1.6rem;
    font-weight: 700;
}
.copy {
    height: calc(100vh - 8rem);
    display: grid;
    justify-self: center;
    align-self: center;
}
.nav-links {
    display: flex;
    height: 100%;
    list-style: none;
    margin: 0;
    padding: 0;
}
.nav-link {
    margin: 0 0.5rem;
    display: grid;
}

.nav-link:hover {
}

.nav-link a {
    justify-self: center;
    align-self: center;
}

.nav-link a:link, a:visited {
    padding: 0.5rem;
    color: var(--text-1);
    text-decoration: none;
    border-radius: 7px;
    font-size: 1.1rem;
    background: var(--shade-3);
}

.nav-link a:link:hover, a:visited:hover {
    background: var(--shade-4);
}

.lnk a:link, a:visited {
    color: var(--text-1);
    text-decoration: none;
}

.open {
    cursor: pointer;
    color: white;
    padding: 0.75rem 2rem;
    border-radius: 500px;
    font-size: 1.4rem;
}

.biggus {
    font-size: 4rem;
    font-weight: 700;
    text-align: center;
    display: grid;
    justify-self: center;
    align-self: center;
    line-height: 1;
}

.smallus {
    margin-top: 2rem;
    max-width: 700px;
    font-size: 1.4rem;
    font-weight: 400;
    text-align: center;
    display: grid;
    justify-self: center;
    align-self: center;
    line-height: 1.4;
}

@media screen and (max-width: 1024px) {
    .biggus {
        font-size: 3rem;
    }
}
@media screen and (max-width: 768px) {
    .root {
        padding: 1rem;
    }
    .name {
        font-size: 1.3rem;
    }
    .biggus {
        font-size: 2.6rem;
    }
    .smallus {
        max-width: 100%;
        font-size: 1.3rem;
    }
    .open {
        cursor: pointer;
        color: var(--text-1);
        padding: 0.6rem 1.4rem;
        border-radius: 500px;
        font-size: 1.4rem;
    }
}

</style>
