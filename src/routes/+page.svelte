<script>
	import {addTransaction, removeTransaction, getTransactions} from "$lib/storage.ts";
	import {onMount} from "svelte";
	let isOnline = false;
	let text = "";
	let todos = [];

	onMount(() => {
		todos = getTransactions();
	});

	const addTodo = () => {
		const trs = addTransaction({text});
		todos = [trs, ...todos];
	}

	const removeTodo = (id) => {
		removeTransaction(id);
		todos = todos.filter((t) => t.id !== id);
	}

</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<svelte:window bind:online={isOnline} />

<div class="wrapper">
	<div class="input">
		<input type="text" placeholder="Text..." bind:value={text}>
		<button on:click={addTodo}>+</button>
	</div>
	<div class="list">
	{#each todos as todo}
		<div class="todo">
			<p>{todo.text}</p>
			<button on:click={() => removeTodo(todo.id)}>X</button>
		</div>
	{/each}
	</div>
</div>

<style lang="scss">
	.wrapper {
		padding: 40px;
	}

	.input {
		display: flex;
		gap: 10px;
		margin-bottom: 40px;
	}

	.list {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.todo {
		background-color: #dedede;
		border: 1px solid gray;
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 10px 20px;
		width: 400px;


		p {
			flex-basis: 70%;
			margin: 0;
		}
	}
</style>
