<script>
import { onMount, onDestroy, tick } from 'svelte'
import { twemoji } from '$lib/utils/twemoji'

import EMOJIBASE from 'emojibase-data/en/compact.json';
import SHORTCODES from 'emojibase-data/en/shortcodes/joypixels.json';

EMOJIBASE.forEach(item => {
    let code = ``
    let shortcodes = SHORTCODES[item.hexcode]
    if(Array.isArray(shortcodes)) {
        shortcodes.forEach(x => {
            code = code + `:${x}: `
        })
    } else {
        code = `:${shortcodes}:`
    }
    item.shortcode = code
    item.baseunicode = item.unicode
})

let CONSTRUCTED = EMOJIBASE
window.emoji = CONSTRUCTED

$: people = CONSTRUCTED.filter(x => x.group == 0 || x.group == 1)
$: nature = CONSTRUCTED.filter(x => x.group == 3)
$: food = CONSTRUCTED.filter(x => x.group == 4)
$: travel = CONSTRUCTED.filter(x => x.group == 5)
$: activities = CONSTRUCTED.filter(x => x.group == 6)
$: objects = CONSTRUCTED.filter(x => x.group == 7)
$: symbols = CONSTRUCTED.filter(x => x.group == 8)
$: flags = CONSTRUCTED.filter(x => x.group == 9)

</script>
