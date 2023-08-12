<script>
import Logo from '$lib/logo/logo.svelte'
import { store } from '$lib/store/store.js'
import { ghost } from '$lib/assets/icons.js'

function discover() {
    $store.discoverSpacesOpen = true
}
</script>

<div class="space-container">
    <div class="inner-area">

        <div class="header">
            <Logo large={true} />
        </div>

        <div class="grd">
            <div class="grd-c fl-co">
                <div class="grd-c ghost">
                    {@html ghost}
                </div>
                <div class="grd-c mt4">
                    Could not find that page.
                </div>
                <div class="mt4 grd-c">
                    <button class="pa2" on:click={discover}>Discover Spaces</button>
                </div>
            </div>
        </div>
    </div>
</div>

<style>

.space-container {
    display: grid;
    grid-template-columns: auto;
    grid-template-columns: auto;
    overflow: hidden;
}

.inner-area {
    display: grid;
    grid-template-columns: auto;
    grid-template-rows: auto;
    overflow: hidden;
}

.header {
    border-bottom: 1px solid var(--border-1);
    display: none;
    margin-top: 12px;
    margin-left: 11px;
}

@media screen and (max-width: 768px) {
    .inner-area {
        grid-template-rows: 48px auto;
    }

    .header {
        display: grid;
        justify-content: start;
    }
}

.ghost {
    fill: var(--text-1);
    height: 80px;
    width: 80px;
    animation: float 2s ease-in-out infinite;
}
@keyframes float {
    0%, 100% {
        transform: translateY(0);
    }
    50% {
        transform: translateY(0.5rem);
    }
}
</style>
