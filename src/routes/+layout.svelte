<script>

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
</script>

<div class="root">
    <div class="container">

        <Switcher/>

        <Sidebar/>

        <div class="content">
            <slot></slot>
        </div>

    </div>
</div>




<div class="theme-switcher">
<button on:click={toggleTheme}>Toggle</button>
</div>


<style>

.root {
    min-height: 100vh; 
    height: 100%;
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
    grid-template-columns: [switcher] 64px [sidebar] 300px [content] auto;
}
.content {
    place-self: stretch;
    max-width:860px;
    width: 100%;
    height: 100%;
    justify-self: center;
    align-self: start;
}

@media screen and (max-width: 1160px) {
    .container {
        max-width: auto;
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
