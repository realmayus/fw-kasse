<script lang='ts'>
	import plus from '$lib/images/plus.svg';
	import minus from '$lib/images/minus.svg';

	export let isChip: boolean;
	export let alt: string;
	export let icon;
	export let value: number;

	export let blackText: boolean;

	export let showControls: boolean;
	export let large: boolean;
	export let inactive: boolean;
</script>

<div class='outerWrapper' class:large={large} class:inactive={inactive && value < 1}>
	{#if showControls}
		<button on:click={() => value = Math.min(99, value + 1)} class='plus'><img src={plus} alt='plus' /></button>
	{/if}
	<div class='innerWrapper'>
		<img src={icon} alt={alt} class:large={large} />
		<span class={`${isChip ? "chip " : "ticket "}${blackText ? "blackText" : ""}`} class:largeFont={large}>{value}</span>
	</div>
	{#if showControls}
		<button on:click={() => value = Math.max(0, value - 1)} class='minus'><img src={minus} alt='minus' /></button>
	{/if}
</div>

<style lang='scss'>
  img {
    width: 60px;
  }

  .innerWrapper {
    position: relative;
  }

  .outerWrapper {
    width: 60px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

	.large {
    width: 100px;
  }

	.inactive {
		opacity: 0.5;
	}

  span {
    position: absolute;
    font-size: 22px;
    color: white;
    font-weight: 900;

  }
  .largeFont {
    font-size: 42px !important;
		top: 20px !important;
		left: 50px !important;
  }

  .blackText {
    color: black;
  }

  .chip {
    top: 16px;
    left: 30px;
    transform: translate(-50%);
  }

  .ticket {
    top: 15px;
    left: 29px;
    transform: translate(-50%);
  }

  button {
    width: 60px;
    height: 60px;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 10px;
    border: none;
    border-radius: 11px;
  }

  .plus {
    background-color: #B454FF;
  }

  .minus {
    background-color: #D197FF;
  }
</style>
