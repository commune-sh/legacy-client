<script>
import Header from '$lib/header/header.svelte';
import about from '/static/about.md?raw'
import MarkdownIt from 'markdown-it'
import MarkdownItEmoji from 'markdown-it-emoji'
import MarkdownItLinkAttributes from 'markdown-it-link-attributes'

let md = new MarkdownIt({
  html: true,
  linkify: true,
  breaks: true,
  typographer: true
});

$: formatted_body = about ?  md.render(about) : '' 

</script>


<section class="about">
    <Header />

    <div class="space-container">
        <div class="container">

            <div class="content pa3">
                {#if about}
                    {@html formatted_body}
                {:else}
                {/if}
            </div>
        </div>
    </div>
</section>

<style>

.about {
    display: grid;
    grid-template-rows: 48px 1fr;
    overflow: hidden;
}

.space-container {
    overflow: hidden;
}

.container {
    overflow-y: auto;
    height: 100%;
}
.content {
    display: grid;
    grid-template-rows: 1fr;
    grid-template-columns: 1fr;
    grid-gap: 1rem;
    max-width: 800px;
    margin: 0 auto;
    margin-top: 2rem;
}
</style>

