<script>
import {menu} from '$lib/assets/icons.js'
import { page } from '$app/stores';

</script>

<div class="menu">

    <div class="ico grd-c">
        {@html menu}
    </div>
</div>

<style>
.menu {
    height: 100vh;
    display: grid;
    grid-template-columns: auto;
    grid-template-rows: [logo] 40px [content] auto;
    border-right: 1px solid var(--border-1);
}

.content {
    padding-top: 1rem;
}
</style>
