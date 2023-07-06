<script>
import { replies } from '$lib/assets/icons.js'
export let count;
</script>

<div class="rep grd grd-c mr2">
    <div class="grd-c fl">
        <div class="ico">
            {@html replies}
        </div>
        {#if count > 0}
        <div class="ml1 ln">{count}</div>
        {/if}
    </div>
</div>

<style>
.rep {
    font-size: small;
    color: var(--text-light);
    background-color: var(--shade-2);
    border-radius: 5px;
    padding-left: 0.25rem;
    padding-right: 0.25rem;
    padding-bottom: 0;
    height: 22px;
}

.rep:hover {
    background-color: var(--shade-3);
}

.ico {
    height: 14px;
    width: 14px;
    opacity: 0.6;
}

.ln {
    line-height: 14px;
    height: 14px;
}

@media screen and (max-width: 768px) {
    .rep {
        height: 18px;
    }
}
</style>
