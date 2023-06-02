<script lang='ts'>
	import tick from '$lib/images/check-solid.svg';
	import {fly} from 'svelte/transition';

	export let value: boolean;
</script>

<button class={value ? "active" : ""} on:click={() => value = !value}>
	{#if value}
		<img src={tick} alt='X' in:fly={{y: -5}} />
	{/if}
</button>

<style lang='scss'>
  button {
    flex-shrink: 0;
    background-color: #cccccc;
    width: 45px;
    height: 45px;
    padding: 0;
    border-radius: 11px;
    border: 1px solid #bbbbbb;
    cursor: pointer;
    color: black;
    box-sizing: content-box;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: .2s all ease-in-out;

    img {
      width: 25px;
			pointer-events: none;
    }
  }
	.active {
		background-color: black;
	}
</style>
