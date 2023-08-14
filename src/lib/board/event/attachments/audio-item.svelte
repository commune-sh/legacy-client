<script>
import { PUBLIC_MEDIA_URL } from '$env/static/public'

export let item;

$: url = `${PUBLIC_MEDIA_URL}/${item.key}`

</script>

<div class="audio-item mt2">
    <audio controls>
        <source src={url} type={item.type}>
    </audio>
</div>

<style>
.audio-item {
}
audio {
    height: 30px;
    width: 300px;
}
</style>
