<script>
	import {user} from "$lib/stores";
	import { goto } from '$app/navigation';
	import Spinner from './Spinner.svelte';
	import ActionButton from './ActionButton.svelte';

	// $: if ($user.initDone && !$user.loggedIn) {
	// 	console.log($user);
	// 	goto("/login");
	// }
</script>

{#if $user.initDone && $user.loggedIn && $user.id}
	<slot/>
{:else}
	<div class='wrapper'>
		<Spinner/>
		<ActionButton label='Einloggen' onClick={() => goto("/login")} backgroundColor='#a22114' borderColor='#c44336' />
	</div>
{/if}

<style>
		.wrapper {
				width: 100%;
				height: 100%;
				display: flex;
				justify-content: center;
				flex-direction: column;
				gap: 40px;
				align-items: center;
				background-color: #a22114;
		}
</style>
