<script>
import { createEventDispatcher } from 'svelte'
import { debounce } from '$lib/utils/utils.js'
const dispatch = createEventDispatcher()

export let items;
export let item;
export let disabled = false;

function remove() {
    dispatch('remove', item.url)
}

let nameInput;

let exists = false;

function updateName() {
    let index = items?.findIndex(x => x.name == nameInput.value)
    if(index !== -1) {
        exists = true;
        return
    } else {
        exists = false;
    }

    debounce(dispatchNameUpdate, 500)
}

function dispatchNameUpdate() {
    dispatch('update', {
        url: item.url,
        name: nameInput.value
    })
}

function validate(e) {
    const letters = /^[0-9a-zA-Z_]+$/;
    if(!e.key.match(letters)){
        e.preventDefault()
    }

}

$: label = `:${item.name}:`

let editing = false;

function focus() {
    if(disabled) return
    editing = true
}

function blur() {
    editing = false
}

</script>

<div class="emoji-item">
    <div class="img grd-c">
        <img src={item.url} alt={item.name} width="32" height="32">
    </div>

    <div class="input ml3">
        <input type="text" 
            class:editing={editing}
            on:focus={focus}
            on:blur={blur}
            class:exists={exists}
            bind:this={nameInput}
            bind:value={item.name}
            on:keydown={validate}
            on:input={updateName}/>
        <div class="lbl" class:hide={editing}>
            {label}
        </div>
    </div>

    <div class="grd-c ph3 del">
        <button class="rem" on:click={remove}>Remove</button>
    </div>

</div>

<style>

.emoji-item {
    display: grid;
    grid-template-columns: auto 1fr auto;
    grid-gap: 1rem;
    margin-bottom: 0.5rem;
}
.input {
    justify-self: start;
    align-self: center;
    position: relative;
}

.lbl {
    position: absolute;
    left: -3px;
    top: -1px;
    padding: 0.5rem;
    border-radius: 5px;
}

.emoji-item:hover .lbl {
    display: none;
}

.hide {
    display: none;
}

.del {
    cursor: pointer;
    opacity: 0;
}
.emoji-item:hover .del {
    opacity: 1;
}
.rem {
    padding: 0.25rem 0.5rem;
}
.exists {
    border: 1px solid red;
    color: red;
}
input {
    padding: 0.5rem;
    background: var(--modal);
    border: 1px solid var(--modal);
    font-size: 14px;
    visibility: hidden;
}

.emoji-item:hover input {
    background: var(--black);
    border: 1px solid var(--input-border);
    visibility: visible;
}

.editing {
    background: var(--black);
    border: 1px solid var(--input-border);
    visibility: visible;
}
img {
    width: 32px;
    height: 32px;
}
</style>
