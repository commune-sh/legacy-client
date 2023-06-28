<script>
    import { PUBLIC_APP_NAME } from '$env/static/public'
</script>

<div class="index-sidebar">
    <div class="con fl-co">
        <div class="mt3">
            Welcome to {PUBLIC_APP_NAME}'s Matrix-powered public communities.
        </div>
        <div class="mt4 label">
            public spaces
        </div>
        <div class="">
        </div>
    </div>
</div>

<style>
.index-sidebar {
    display: grid;
    overflow: hidden;
    height: 100%;
}
.con {
    height: 100%;
    overflow-x: hidden;
    overflow-y: auto;
    padding: 0.5rem;
    line-height: 1.5;
}
</style>
