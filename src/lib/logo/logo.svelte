<script>
import { PUBLIC_APP_NAME } from '$env/static/public';
import { store } from '$lib/store/store.js'
import { logo } from '$lib/assets/logo.js'

export let large = false;
export let loader = false;

function goHome() {
    if($store.menuToggled) {
        $store.menuToggled = false
    }
}


$: initials = PUBLIC_APP_NAME?.charAt(0)?.toUpperCase()
$: isDefault = PUBLIC_APP_NAME?.charAt(0)?.toLowerCase() === 's';

</script>

<div class="logo">
    <a on:click={goHome} class="" href="/">
        <div class="l-c grd" class:lg={large} class:ldr={loader}>
            <div class="l-c-i grd-c" class:lgr={loader}>
                {#if isDefault}
                    {@html logo}
                {:else}
                    <div class="logo-initials">
                        <div class="init">
                            {initials}
                        </div>
                        <div class="overlay">
                            {initials}
                        </div>
                    </div>
                {/if}
            </div>
        </div>
    </a>
</div>


<style>
.logo {
    cursor: pointer;
    transition: 0.1s;
    justify-self: center;
    align-self: center;
    display: grid;
}

.l-c {
    height: 36px;
    width: 36px;
    background-color: var(--logo-bg);
    border-radius: 6px;
    transition: 0.1s;
}
.ldr {
    background-color: transparent;
}

.lg {
    height: 36px;
    width: 36px;
}

.l-c:hover .l-c-i {
    animation: rainbow 1.5s linear;
    animation-iteration-count: infinite;
}

.l-c-a {
    background-color: var(--primary);
}


.l-c-i {
    height: 20px;
    width: 20px;
    fill: var(--logo-shade-1);
}

.lgr {
    height: 54px;
    width: 54px;
    animation: rainbow 1.5s linear;
    animation-iteration-count: infinite;
}


.l-c-t {
    fill: var(--logo-shade-2);
}

.logo-initials {
    font-family: 'Silkscreen';
    font-size: 32px;
    line-height: 16px;
    margin: 0;
    padding: 0;
    position: relative;
}

.init {
    color: var(--logo-shade-1);
    opacity: 0.5;
    margin-left: -4px;
}

.overlay {
    position: absolute;
    top: 0;
    left: 0;
    color: var(--logo-shade-1);
}

.l-c:hover .init {
    animation: rainbow 1.5s linear;
    animation-iteration-count: infinite;
}
.l-c:hover .overlay {
    animation: rainbow 1.5s linear;
    animation-iteration-count: infinite;
}

@keyframes rainbow{
		100%,0%{
			fill: rgb(255,0,0);
			color: rgb(255,0,0);
		}
		90%{
			fill: rgb(255,127,0);
			color: rgb(255,127,0);
		}
		80%{
			fill: rgb(255,255,0);
			color: rgb(255,255,0);
		}
		70%{
			fill: rgb(127,255,0);
			color: rgb(127,255,0);
		}
		60%{
			fill: rgb(0,255,0);
			color: rgb(0,255,0);
		}
		50%{
			fill: rgb(0,255,127);
			color: rgb(0,255,127);
		}
		40%{
			fill: rgb(0,255,255);
			color: rgb(0,255,255);
		}
		30%{
			fill: rgb(0,127,255);
			color: rgb(0,127,255);
		}
		20%{
			fill: rgb(0,0,255);
			color: rgb(0,0,255);
		}
		10%{
			fill: rgb(127,0,255);
			color: rgb(127,0,255);
		}
		0%{
			fill: rgb(255,0,255);
			color: rgb(255,0,255);
		}
		91%{
			fill: rgb(255,0,127);
			color: rgb(255,0,127);
		}
}
</style>
