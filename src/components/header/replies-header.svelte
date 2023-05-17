<script>
import { createEventDispatcher } from 'svelte'
import Logo from '../../components/logo/logo.svelte'
import { close } from '../../assets/icons.js'
import ArrowLeft from '../../assets/icons/arrow-left-s-line.svg'
import { page } from '$app/stores';
import { goto } from '$app/navigation';

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

</script>


<div class="header">
    <div class="container fl">
        <div class="logo grd-c">
            <Logo />
        </div>
        <div class="pd grd-c">
            <span class="n">Replies</span>
        </div>
        <div class="fl-o"></div>
        <div class="close c-ico pd grd-c" on:click={kill}>
            {@html close}
        </div>
        <div class="back c-ico pd grd-c" on:click={kill}>
            <img src={ArrowLeft} alt="arrow-left" />
        </div>
    </div>
</div>

<style>
.header {
    border-bottom: 1px solid var(--border-1);
    position: sticky;
    z-index: 1;
    top: 0;
    background-color: var(--bg);
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

.logo {
    display: none;
    padding-left: 0.5rem;
}

@media screen and (max-width: 768px) {
    .logo {
        display: block;
    }
    .n {
        display: none;
    }
    .close {
        display: none;
    }
    .back {
        display: block;
    }
}
</style>
