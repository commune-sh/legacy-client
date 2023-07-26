<script>
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import tz from 'dayjs/plugin/timezone'

dayjs.extend(utc);
dayjs.utc()
dayjs.extend(tz)

export let date;

$: created = dayjs(date)?.format('h:mm A')
$: title = dayjs(date)?.format()

</script>

<div class="time grd-c sel-no" title={title}>
    {created}
</div>

<style>
.time {
    color: var(--text-light);
    font-size: 10px;
}
</style>
