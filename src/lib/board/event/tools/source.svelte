<script>
export let event;

$: render = JSON.stringify(event, null, 2)

</script>

{#if event}
<div class="source">
    <div class="event pa3">
        <pre>
            <code>
                    {@html render}
            </code>
        </pre>
    </div>
</div>
{/if}

<style>
.source {
    overflow: hidden;
}
.event {
    overflow: auto;
}

pre {
    word-wrap: break-word;
    overflow-wrap: anywhere;
    white-space: pre-wrap;
}

</style>
