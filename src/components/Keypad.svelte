<script lang='ts'>
	export let onClick: (clickedNum: number) => void;
</script>

<div class='wrapper'>
	<div>
		<button on:click={() => onClick(7)}>7</button>
		<button on:click={() => onClick(8)}>8</button>
		<button on:click={() => onClick(9)}>9</button>
	</div>
	<div>
		<button on:click={() => onClick(4)}>4</button>
		<button on:click={() => onClick(5)}>5</button>
		<button on:click={() => onClick(6)}>6</button>
	</div>
	<div>
		<button on:click={() => onClick(1)}>1</button>
		<button on:click={() => onClick(2)}>2</button>
		<button on:click={() => onClick(3)}>3</button>
	</div>
	<div>
		<button on:click={() => onClick(-1)} style='background-color: #C94A4A'>&lt;</button>
		<button on:click={() => onClick(0)}>0</button>
		<button on:click={() => onClick(-2)} style='background-color: #7C86E4'>,</button>
	</div>
</div>

<style lang='scss'>
  .wrapper {
    display: flex;
    gap: 10px;
		flex-direction: column;
    > div {
      display: flex;
      gap: 10px;
    }
  }

	button {
		background-color: #475AFF;
		color: black;
		box-sizing: border-box;
		display: flex;
		justify-content: center;
		align-items: center;
		border: none;
		border-radius: 11px;
		font-size: 58px;
		font-weight: 700;
		width: 120px;
		height: 100px;
	}

</style>
