<script>
export let user;
export let hideAvatar = false;
</script>

<div class="fl">
    {#if !hideAvatar}
        <div class="grd ml1">
            <div class="grd-c avatar-base">
            </div>
        </div>
    {/if}
    <div class="">
        {user.username}
    </div>
</div>

<style>

.avatar-base {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background-color: #ccc;
}

</style>
