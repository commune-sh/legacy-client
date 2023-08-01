<script>
import { discuss, chat } from '$lib/assets/icons.js'

let state = 'discuss'

function toggle() {
    if (state === 'discuss') {
        state = 'chat'
    } else {
        state = 'discuss'
    }
}

$: isDiscuss = state === 'discuss'
$: isChat = state === 'chat'

</script>

<div class="toggle-view" on:click={toggle}>
    <div class="toggle grd-c">
        <div class="di ico-s ic grd-c" class:active={isDiscuss}>
            {@html discuss}
        </div>
        <div class="ch ico-s ic grd-c" class:active={isChat}>
            {@html chat}
        </div>
    </div>
</div>

<style>
.toggle-view {
    display: grid;
    margin-left: 1rem;
    margin-right: 0.5rem;
}
.toggle {
    border-radius: 5px;
    background: var(--shade-3);
    display: grid;
    grid-template-columns: auto auto;
    cursor: pointer;
}
.active {
    background: var(--primary);
    fill: white;
}

.ic {
    border-radius: 5px;
    height: 14px;
    width: 14px;
    padding: 0.25rem 0.5rem 0.25rem 0.5rem;
}
.di {
}
.ch {
}
</style>
