<script>
import { PUBLIC_APP_NAME } from '$env/static/public';
import { unhappy } from '$lib/assets/icons.js'
</script>

<section class="root">
    <section class="grd-c fl-co">
        <div class="emoji grd-c">
            {@html unhappy}
        </div>
        <div class="mt3">
            {PUBLIC_APP_NAME} is down right now.
        </div>
    </section>
</section>

<style>
.root {
    position: absolute;
    height: 100%;
    width: 100%;
    display: grid;
    grid-template-columns: 100%;
    grid-template-rows: 100%;
    overflow: hidden;
}
.emoji {
    height: 30px;
    width: 30px;
    fill: var(--text-1);
}
</style>
