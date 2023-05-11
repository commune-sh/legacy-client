<script>
import { logo } from '/src/assets/logo.js'
import Auth from '../auth/auth.svelte'
import { page } from '$app/stores';


</script>

<div class="sidebar">
    <div class="header fl">
        <div class="">
        </div>
    </div>
    <div class="content">
    </div>
    <div class="auth">
        <Auth/>
    </div>
</div>

<style>
.sidebar {
    position: sticky;
    top: 0;
    height: 100vh;
    display: grid;
    grid-template-columns: auto;
    grid-template-rows: [search] 64px [content] auto [auth] 64px;
    border-left: 1px solid var(--border-1);
}

.header {
}
</style>
