<script>
    import Auth from '../auth/auth.svelte'
</script>

<div class="sidebar">
    <div class="search">
    </div>
    <div class="content">
    </div>
    <Auth/>
</div>

<style>
.sidebar {
    position: sticky;
    top: 0;
    height: 100vh;
    background-color: var(--shade-2);
    display: grid;
    grid-template-columns: auto;
    grid-template-rows: [search] 64px [content] auto [auth] 64px;
}
</style>
