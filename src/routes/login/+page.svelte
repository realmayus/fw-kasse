<script lang="ts">
	import SignIn from '../../components/SignIn.svelte';
	import { user } from '$lib/stores';
	import { goto } from '$app/navigation';

	$: if ($user.loggedIn) {
		goto("/");
	}
</script>

<div>
	<SignIn/>
</div>

<style>
	div {
			width: 100%;
			display: flex;
			justify-content: center;
			align-items: center;
	}
</style>
