<script>
	import { getAuth, signOut } from 'firebase/auth';
	import EnsureAuth from '../../components/EnsureAuth.svelte';
	import { goto } from '$app/navigation';
	import { settingsStore, user } from '$lib/stores';
	import Checkbox from '../../components/Checkbox.svelte';

	const logOut = () => {
		signOut(getAuth());
		user.update(u => {
			u.id = null;
			u.loggedIn = false;
			u.initDone = false;
			return u;
		});
		goto('/login');
	};
</script>

<EnsureAuth>
	<div class='wrapper'>
		<h1>Einstellungen</h1>
		<div class='settingsSoup'>
			<a class='settingsButton' href='settings/articles'>Artikel bearbeiten</a>
			<a class='settingsButton' href='settings/transactions'>Transaktionen ansehen</a>
			<a class='settingsButton' href='settings/advanced'>Erweitert</a>
			<a class='settingsButton' href='settings/support'>Hilfe</a>
			<button class='settingsButton' on:click={logOut}>Ausloggen</button>
		</div>
		<h2>Benutzereinstellungen</h2>
		<div class='userSettings'>
			<label class='checkboxLabel'>
				<Checkbox bind:value={$settingsStore.scrollToTopOnArticleAdd} />
				Neue Artikel stets nach oben bewegen
			</label>
			<label class='checkboxLabel'>
				<Checkbox bind:value={$settingsStore.offline} />
				Offline-Modus
			</label>
		</div>
	</div>
</EnsureAuth>

<style>
    .wrapper {
        padding: 20px 40px;
    }

    .settingsSoup {
        display: flex;
        width: 600px;
        gap: 20px;
    }

    .settingsButton {
        flex-shrink: 0;
        background-color: #cccccc;
        width: 160px;
        height: 80px;
        padding: 20px;
        border-radius: 11px;
        border: 1px solid #bbbbbb;
        cursor: pointer;
        color: black;
        text-decoration: none;
        box-sizing: content-box;
        display: flex;
        font-size: 18px;
        font-weight: 500;
        transition: .2s all ease-in-out;
        margin-bottom: 100px;
    }

    .settingsButton:focus {
        background-color: #000000;
        color: #ffffff;
    }

    .checkboxLabel {
        display: flex;
        align-items: center;
        gap: 20px;
    }

    .userSettings {
        display: flex;
        flex-direction: column;
        gap: 20px;
    }
</style>
