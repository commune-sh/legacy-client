<script>
import { PUBLIC_MEDIA_URL } from '$env/static/public'

export let item;

$: url = `${PUBLIC_MEDIA_URL}/${item.key}`

</script>

<div class="audio-item">
    <audio controls>
        <source src={url} type={item.type}>
    </audio>
</div>

<style>
.audio-item {
}
audio {
}
</style>
