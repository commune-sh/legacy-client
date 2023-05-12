<script>
import Authentication from '../components/auth/authentication.svelte'
import Switcher from '../components/switcher/switcher.svelte'
import Sidebar from '../components/sidebar/sidebar.svelte'

export let data;

function toggleTheme() {
    const theme = localStorage.getItem('theme')
    if(theme === 'light') {
        localStorage.removeItem('theme')
        document.documentElement.setAttribute('class', 'dark')
    } else {
        localStorage.setItem('theme', 'light')
        document.documentElement.setAttribute('class', 'light')
    }
}

$: error = data?.error

</script>

{#if data?.error}
<div class="root">
    <section class="grd">
        <section class="grd-c">
            Yikes. Shpong is down right now.
        </section>
    </section>
</div>
{:else}




<div class="root">
    <div class="container">

    <div class="switcher-container grd">
        <Switcher />
    </div>

    <div class="sidebar-container grd">
        <Sidebar/>
    </div>

    <div class="content">


        <slot></slot>

    </div>

    </div>
</div>




<div class="theme-switcher">
        <Authentication />
<button on:click={toggleTheme}>Toggle</button>
</div>

{/if}

<style>

.root {
    height: 100vh;
    display: grid;
    grid-template-columns: 100%;
    grid-template-rows: 100%;
}

.container {
    place-self: stretch;
    width: 100%;
    height: 100%;
    justify-self: center;
    align-self: start;
    display: grid;
    grid-template-rows: auto;
    grid-template-columns: [switcher] 64px [sidebar] 240px [content] 1fr;
}

.content {
    place-self: stretch;
    width: 100%;
    height: 100vh;
    display: grid;
    grid-template-rows: auto;
    grid-template-columns: auto;
    overflow: hidden;
}

@media screen and (max-width: 1280px) {
    .container {
        grid-template-columns: [switcher] 64px [content] 1fr;
    }
    .sidebar-container {
            display: none;
    }
}
@media screen and (max-width: 768px) {
    .container {
        grid-template-columns: auto;
    }
    .switcher-container {
        display: none;
    }
}



.theme-switcher {
    position: fixed;
    bottom: 0;
    right: 0;
    padding: 1rem;
    z-index: 1000;
}
</style>
