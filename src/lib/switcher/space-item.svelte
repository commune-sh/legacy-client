<script>
import { store } from '../../store/store.js'
import { goto } from '$app/navigation';

export let space;

$: spacePath = $store?.spacePaths[space?.alias]?.pathname

$: initial = space?.alias?.charAt(0)?.toUpperCase()

function goToSpace() {
    let url = `/${space?.alias}`
    if(spacePath != undefined) {
        url = spacePath
    }
    goto(url, {noscroll: true})
}

let hovered = false;

</script>

<div class="i-c grd" 
    on:mouseover={() => hovered = true}
    on:mouseleave={() => hovered = false}
    on:click={goToSpace}>
    <div class="item grd-c">
        <div class="grd-c">
            {initial}
        </div>
    </div>
    <div class="tick" class:th={hovered}></div>
</div>

<style>

.i-c {
    margin-bottom: 0.5rem;
    position: relative;
}

.item{
    background-color: var(--black);
    border-radius: 50%;
    width: 42px;
    height: 42px;
    display: grid;
    cursor: pointer;
    transition: 0.1s;
}
.item:hover {
    border-radius: 15px;
}


.tick {
    opacity: 0;
    transition: 0.1s;
    position: absolute;
    top: 13px;
    left: 0px;
    height: 15px;
    width: 3px;
    border-radius: 0 4px 4px 0;
    background-color: var(--white);
}
.th {
    opacity: 1;
}

@media screen and (max-width: 1280px) {
    .item {
        width: 38px;
        height: 38px;
    }
    .tick {
        top: 11px;
    }
}
</style>
