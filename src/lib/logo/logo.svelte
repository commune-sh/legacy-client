<script>
import { logo } from '$lib/assets/logo.js'
export let large = false;
export let loader = false;
</script>

<div class="logo">
    <a class="" href="/">
        <div class="l-c grd" class:lg={large} class:ldr={loader}>
            <div class="l-c-i grd-c" class:lgr={loader}>
                {@html logo}
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
    height: 38px;
    width: 38px;
    background-color: var(--logo-bg);
    border-radius: 6px;
    transition: 0.1s;
}
.ldr {
    background-color: transparent;
}

.lg {
    height: 42px;
    width: 42px;
}

.l-c:hover .l-c-i {
    animation: rainbow 1.5s linear;
    animation-iteration-count: infinite;
}

.l-c-a {
    background-color: var(--primary);
}


.l-c-i {
    height: 34px;
    width: 34px;
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

.rainbow-bg{
}

.auth {
    display: grid;
}


@keyframes rainbow{
		100%,0%{
			fill: rgb(255,0,0);
		}
		90%{
			fill: rgb(255,127,0);
		}
		80%{
			fill: rgb(255,255,0);
		}
		70%{
			fill: rgb(127,255,0);
		}
		60%{
			fill: rgb(0,255,0);
		}
		50%{
			fill: rgb(0,255,127);
		}
		40%{
			fill: rgb(0,255,255);
		}
		30%{
			fill: rgb(0,127,255);
		}
		20%{
			fill: rgb(0,0,255);
		}
		10%{
			fill: rgb(127,0,255);
		}
		0%{
			fill: rgb(255,0,255);
		}
		91%{
			fill: rgb(255,0,127);
		}
}
</style>
