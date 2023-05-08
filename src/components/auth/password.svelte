<script>
import { onMount, createEventDispatcher } from 'svelte'

const dispatch = createEventDispatcher()

onMount(() => {
});

function kill() {
    dispatch('kill', true)
}

</script>


<div class="b" >
    <div class="" >
    </div>
    <div class="" >
        reset password
    </div>
    <div class="grd">
        <div class="grd-c">
            <button on:click={kill}>Go back</button>
        </div>
    </div>
</div>

<style>
.b {
    display: grid;
    grid-template-columns: auto;
    grid-template-rows: [header] 40px [content] 1fr [footer] 40px;
    place-self: stretch;
    height: 100%;
}
</style>
