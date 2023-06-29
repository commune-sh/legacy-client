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
                <p>{PUBLIC_APP_NAME} lets you build public spaces on a
                        matrix server.</p>
            </section>

            <section class="pa mt4">
                <span class="label">what is a space?</span>
                <p>A space is an ordinary matrix room. A space may also have one
                    or more rooms within it.</p>
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
                <span class="label">Can I run this on an existing matrix
                        server?</span>
                <p>Yes. It's recommended to start on a fresh matrix
                    server for now though.</p>
            </section>

            <section class="pa mt4">
                <span class="label">Are all spaces public?</span>
                <p>No. You can create private spaces too.</p>
            </section>


            <section class="pa mt4">
                <span class="label">What about moderation?</span>
                <p>Each {PUBLIC_APP_NAME} instance should decide on it's own
                    moderation guidelines.</p>
            </section>

            <section class="pa mt4">
                <span class="label">Can I run this on an existing matrix
                        server?</span>
                <p>Yes. It's recommended to start on a fresh matrix
                    server for now though.</p>
            </section>

            <section class="pa mt4">
                <span class="label">Are all spaces public?</span>
                <p>No. You can create private spaces too.</p>
            </section>


            <section class="pa mt4">
                <span class="label">What about moderation?</span>
                <p>Each {PUBLIC_APP_NAME} instance should decide on it's own
                    moderation guidelines.</p>
            </section>

            <section class="pa mt4">
                <span class="label">Can I run this on an existing matrix
                        server?</span>
                <p>Yes. It's recommended to start on a fresh matrix
                    server for now though.</p>
            </section>

            <section class="pa mt4">
                <span class="label">Are all spaces public?</span>
                <p>No. You can create private spaces too.</p>
            </section>


            <section class="pa mt4">
                <span class="label">What about moderation?</span>
                <p>Each {PUBLIC_APP_NAME} instance should decide on it's own
                    moderation guidelines.</p>
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


