<script>
import { replies } from '$lib/assets/icons.js'
export let count;
</script>

<div class="rep grd">
    <div class="grd-c fl">
        <div class="ico">
            {@html replies}
        </div>
        {#if count > 0}
        <div class="ml1">{count}</div>
        {/if}
    </div>
</div>

<style>
.rep {
    font-size: small;
    line-height: 1;
    color: var(--text-light);
    background-color: var(--shade-2);
    border: 1px solid var(--shade-2);
    border-radius: 5px;
    padding-left: 0.25rem;
    padding-right: 0.25rem;
    margin-top: 0.5rem;
    padding-bottom: 0;
    height: 20px;
}

.rep:hover {
    background-color: var(--shade-3);
}

.ico {
    height: 14px;
    width: 14px;
    opacity: 0.6;
}

@media screen and (max-width: 768px) {
    .rep {
        margin-top: 0.25rem;
    }
}
</style>
