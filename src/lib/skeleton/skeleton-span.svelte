<script>
export let width = '100%';
export let height = '18px';
</script>

<div class="span sklt" style="width:{width};height:{height}"></div>


<style>

.span {
    background: var(--shade-2);
    border-radius: 500px;
    width: 100%;
}

.sklt {
  animation: skeleton-loading 1s linear infinite alternate;
}

@keyframes skeleton-loading {
  0% {
    background: var(--shade-2);
  }
  100% {
    background: var(--shade-3);
  }
}

</style>
