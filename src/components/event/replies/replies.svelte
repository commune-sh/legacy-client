<script>
import { replies } from '../../../assets/icons.js'
export let count;
</script>

<div class="rep ml3 fl">
    <div class="ico">
        {@html replies}
    </div>
    <div class="ml1">{count}</div>
</div>

<style>
.rep {
    font-size: small;
    line-height: 1;
    color: var(--text-light);
    background-color: var(--shade-2);
    border-radius: 7px;
    padding-top: 0.25rem;
    padding-bottom: 0.25rem;
    padding-left: 0.5rem;
    padding-right: 0.5rem;
}
.ico {
    height: 14px;
    width: 14px;
    opacity: 0.6;
}
</style>
