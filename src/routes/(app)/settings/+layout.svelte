<script>
import { page } from '$app/stores';
import { store } from '$lib/store/store.js'
import Header from '$lib/header/header.svelte'

</script>

<section class="container">
    <div class="space-container">
        <slot></slot>
    </div>
</section>

<style>
.container {
    display: grid;
    grid-template-columns: auto;
    grid-template-rows: 48px 1fr;
    overflow: hidden;
}
</style>
