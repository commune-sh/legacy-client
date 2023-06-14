<script>
import { edit } from '$lib/assets/icons.js'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import tz from 'dayjs/plugin/timezone'
import relativeTime from 'dayjs/plugin/relativeTime'
import updateLocale from 'dayjs/plugin/updateLocale'

dayjs.extend(utc);
dayjs.utc()
dayjs.extend(tz)
dayjs.extend(relativeTime)
dayjs.extend(updateLocale)

dayjs.updateLocale('en', {
  relativeTime: {
    future: "in %s",
    past: "%s ago",
    s: 'just now',
    m: "1m",
    mm: "%dm",
    h: "1h",
    hh: "%dh",
    d: "1d",
    dd: "%dd",
    M: "a month",
    MM: "%d months",
    y: "a year",
    yy: "%d years"
  }
})

$: isToday = dayjs().isSame(dayjs(date), 'day')
$: isThisWeek = dayjs().diff(dayjs(date), 'day') < 7
$: when = dayjs(date)?.fromNow(true)
$: created = dayjs(date)?.format('MMM D')

export let date;
</script>


<div class="edited ml2 fl">
    <div class="ico-s">
        {@html edit}
    </div>
    <div class="ml2">
        {isThisWeek ? when : created}
    </div>
</div>

<style>
.edited {
    font-size: small;
    color: var(--text-light);
}
.ico-s {
    height: 13px;
    width: 13px;
}
</style>
