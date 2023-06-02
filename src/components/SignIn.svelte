<script lang='ts'>
	import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
	import ActionButton from './ActionButton.svelte';

	let email = '';
	let password = '';
	let error = null;

	const signIn = () => {
		const auth = getAuth();
		signInWithEmailAndPassword(auth, email, password).then((credentials) => {
			const user = credentials.user;
			console.log(`signInWithEmailAndPassword success! ${user}`);
		}).catch((err) => {
			error = { message: err.message, code: err.code };
		});
	};
</script>
<div>
	<h1>Anmelden</h1>
	<p>Bitte melde dich mit deinem Konto an:</p>
	{#if error}
		<div>
			<h3>Fehler ({error.code})</h3>
			<p>{error.message}</p>
		</div>
	{/if}
	<label>
		E-Mail:<br/>
		<input type='text' bind:value={email} />
	</label>
	<label>
		Passwort:<br/>
		<input type='password' bind:value={password} />
	</label>
	<ActionButton onClick={signIn} backgroundColor='#00BD13'
								borderColor='#00BD13' label='Anmelden'/>
</div>

<style lang='scss'>
    div {
        display: flex;
        justify-content: center;
			align-items: center;
        gap: 20px;
        flex-direction: column;
				* {
          width: 100%;
        }
    }

		input {
			margin: 10px 0;
			box-sizing: border-box;
		}
</style>
