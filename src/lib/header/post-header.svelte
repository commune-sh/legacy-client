<script>
import { createEventDispatcher } from 'svelte'
import {menu} from '../../assets/icons.js'
import { close, arrowLeftSmall } from '../../assets/icons.js'
import { page } from '$app/stores';
import { goto } from '$app/navigation';
import { store } from '../../store/store.js'

const dispatch = createEventDispatcher()

function kill() {
    let url = `/`
    if($page.params?.space) {
        url = `/${$page.params?.space}`
    }
    if($page.params?.room) {
        url = `/${$page.params?.space}/${$page.params?.room}`
    }
    goto(url, {
        noscroll: true,
    })
}

function toggleMenu() {
    store.toggleMenu()
}

</script>


<div class="header">
    <div class="container fl">

        <div class="menu c-ico grd-c" on:click={toggleMenu}>
            {@html menu}
        </div>

        <div class="fl">

            <div class="pd grd-c">
                <span class="n">Discussion</span>
            </div>

            <div class="fl-o"></div>

            <div class="close c-ico pd grd-c" on:click={kill}>
                {@html close}
            </div>

            <div class="back c-ico pd grd-c" on:click={kill}>
                {@html arrowLeftSmall}
            </div>
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
    font-weight: bold;
    font-size: 1rem;
}

.back {
    display: none;
}

.menu {
    display: none;
}

@media screen and (max-width: 768px) {
    .container {
        grid-template-columns: 48px 1fr;
    }
    .menu {
        display: block;
    }
    .close {
        display: none;
    }
    .back {
        display: block;
    }
    .pd {
        padding-left: 0.5rem;
    }
}
</style>
