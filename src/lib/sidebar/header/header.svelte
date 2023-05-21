<script>
export let data;

$: name = data?.state?.space?.name;
</script>

<div class="sidebar-header">
    <div class="in">
        <b>{name}</b>
    </div>
</div>

<style>
.sidebar-header {
    display: grid;
    border-bottom: 1px solid var(--border-1);
    padding: 0.5rem;
}
.in {
    justify-self: start;
    align-self: center;
}
</style>
