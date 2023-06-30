<script>
import { store } from '$lib/store/store.js'
import { page } from '$app/stores';
import { PUBLIC_MEDIA_URL } from '$env/static/public'
import { discuss } from '$lib/assets/icons.js'

export let space;

$: isDomain = $page?.params?.domain != null && $page?.params?.domain?.length > 0
$: mediaURL = isDomain ? $store?.federated?.media_url : PUBLIC_MEDIA_URL
$: avatar = space?.avatar ? `${mediaURL}/${space?.avatar}` : null

$: initials = space?.alias?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()

function goToSpace() {
    if($store.menuToggled) {
        $store.menuToggled = false
    }
}

$: link = `/${space.alias}`

</script>

<div class="space-item">
    <a on:click={goToSpace} class="grd" href={link}>
        <div class="item">

            <div class="ico grd grd-c img mh2"
                style="background-image: url({avatar})">
                {#if !avatar}
                    <div class="init grd-c">
                        {initials}
                    </div>
                {/if}
            </div>

            <div class="name">
                {space?.name}
            </div>


        </div>
    </a>
</div>

<style>
.space-item {
    display: grid;
    grid-template-columns: 1fr auto;
    cursor: pointer;
    height: 30px;
    border-radius: 4px;
    font-size: 14px;
    margin-bottom: 0.15rem;
}
.space-item:hover {
    background-color: var(--shade-3);
}

.item {
    display: grid;
    grid-template-columns: auto 1fr;
}

.ico {
    height: 16px;
    width: 16px;
}
.img {
    background-color: var(--shade-4);
    background-size: cover;
    background-position: center;
    border-radius: 50%;
    height: 18px;
    width: 18px;
}

.name {
    justify-self: start;
    align-self: center;
}

a, a:link, a:visited, a:active {
    color: var(--text);
    text-decoration: none;
}

.init {
    font-size: 10px;
    font-weight: 500;
}
</style>
