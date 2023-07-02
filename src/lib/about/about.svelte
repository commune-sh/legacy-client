<script>
import { PUBLIC_APP_NAME } from '$env/static/public'
import { onMount, createEventDispatcher } from 'svelte'
import { close } from '$lib/assets/icons.js'
import { store } from '$lib/store/store.js'
import { discoverSpaces } from '$lib/utils/request.js'

const dispatch = createEventDispatcher()

let kill =() => {
    $store.aboutOpen = false;
}

$: active = $store.aboutOpen


</script>

{#if active}
<div class="mask grd" 
    on:click|self|stopPropagation={kill}>
    <div class="modal grd-c" >
        <div class="close c-ico grd-c ph3" on:click={kill}>
            {@html close}
        </div>
        <div class="about pa4 fl-co">

            <section class="pa">
               <span class="label">What is {PUBLIC_APP_NAME}?</span>
                <p>{PUBLIC_APP_NAME} lets you build open and publicly accessible communities on a
                        matrix server.</p>
            </section>

            <section class="pa mt4">
                <span class="label">isn't matrix a chat thing?</span>
                <p>Chat is one possible implmentation of the Matrix protocol, it
                        just happens to be the deault one. Shpong is exploring
                        other ways of using Matrix.</p>
            </section>


            <section class="pa mt4">
                <span class="label">Can I self-host this?</span>
                <p>Yes.</p>
            </section>


            <section class="pa mt4">
                    <span class="label">Can I use my {PUBLIC_APP_NAME} account
                        on another Matrix client?</span>
                <p>Yes.</p>
            </section>


            <section class="pa mt4">
                <span class="label">Can I run this on my existing matrix
                        server?</span>
                <p>Yes. Although, it's recommended to start on a new matrix
                    server for now. Shpong is too new to guarantee any kind of
                        stability.</p>
            </section>

            <section class="pa mt4">
                <span class="label">Are all spaces public?</span>
                <p>No, you can create private spaces too.</p>
            </section>

            <section class="pa mt4">
                <span class="label">What about E2EE?</span>
                <p>{PUBLIC_APP_NAME} hasn't implemented direct messages or
                        private rooms yet, but
                        when they're available, they should be encrypted.</p>
            </section>


            <section class="pa mt4">
                <span class="label">What about moderation?</span>
                <p>Each {PUBLIC_APP_NAME} instance should decide on it's own
                    moderation guidelines. Shpong aims to build necessary and
                        useful admin tools for easier moderation.</p>
            </section>


        </div>


    </div>
</div>
{/if}


<style>
.modal {
    height: 650px;
    width: 670px;
    overflow: hidden;
}

.about {
    overflow-y: scroll;
}

.close {
    position: fixed;
    top: 1rem;
    right: 1rem;
}

.c-ico {
    height: 3rem;
    width: 3rem;
}

.pa {
    line-height: 1.5;
}

.pa p:first-of-type {
    margin-block-start: 0.5em;
    margin-block-end: 0em;
}

.pa p:last-of-type {
    margin-block-end: 0em;
}


@media (max-width: 700px) {
    .modal {
        width: 100%;
        height: 100%;
    }
    .about {
        margin-top: 3rem;
    }
}
</style>


