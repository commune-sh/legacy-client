<script>
import { logo } from '../../assets/logo.js'
export let large = false;
</script>

<div class="logo">
    <a class="" href="/">
        <div class="l-c grd" class:lg={large}>
            <div class="l-c-i grd-c">
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

.lg {
    height: 42px;
    width: 42px;
}

@media screen and (max-width: 1280px) {
    .lg {
        height: 38px;
        width: 38px;
    }
}

.l-c:hover .l-c-i {
    animation: rainbow 0.5s linear;
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

.l-c-t {
    fill: var(--logo-shade-2);
}

.rainbow-bg{
}

.auth {
    display: grid;
}

@media screen and (max-width: 1280px) {
    .auth {
        display: none;
    }
}

@keyframes rainbow{
		100%,0%{
			fill: rgb(255,0,0);
		}
		8%{
			fill: rgb(255,127,0);
		}
		16%{
			fill: rgb(255,255,0);
		}
		25%{
			fill: rgb(127,255,0);
		}
		33%{
			fill: rgb(0,255,0);
		}
		41%{
			fill: rgb(0,255,127);
		}
		50%{
			fill: rgb(0,255,255);
		}
		58%{
			fill: rgb(0,127,255);
		}
		66%{
			fill: rgb(0,0,255);
		}
		75%{
			fill: rgb(127,0,255);
		}
		83%{
			fill: rgb(255,0,255);
		}
		91%{
			fill: rgb(255,0,127);
		}
}
</style>
