<script>
import { store } from '../../store/store.js'
import { goto } from '$app/navigation';

export let space;

$: spacePath = $store?.spacePaths[space]?.pathname

$: initial = space?.charAt(0)?.toUpperCase()

function goToSpace() {
    console.log("spaceroute is", spacePath)
    let url = `/${space}`
    if(spacePath != undefined) {
        url = spacePath
    }
    goto(url, {noscroll: true})
}
</script>

<div class="item" on:click={goToSpace}>
    <div class="grd-c">
        {initial}
    </div>
</div>

<style>
.item{
    background-color: var(--black);
    width: 34px;
    height: 34px;
    display: grid;
    margin-bottom: 1rem;
    cursor: pointer;
}
</style>
