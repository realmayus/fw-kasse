<script lang='ts'>
	import '@fontsource/ibm-plex-sans/400.css';
	import '@fontsource/ibm-plex-sans/500.css';
	import '@fontsource/ibm-plex-sans/600.css';
	import '@fontsource/ibm-plex-sans/700.css';

	import arrowIcon from '../lib/images/arrow-left-solid.svg';
	import settingsIcon from '../lib/images/gear-solid.svg';
	import { page } from '$app/stores';
	import { fly } from 'svelte/transition';
	import { auth, db } from '$lib/firebase';
	import { onAuthStateChanged } from 'firebase/auth';
	import { isOnline, settingsStore, user as userStore } from '$lib/stores';
	import type {Settings} from "$lib/stores";
	import './global.scss';
	import { disableNetwork, doc, enableNetwork, getDoc, updateDoc } from 'firebase/firestore';
	import { get } from 'svelte/store';
	import firebase from 'firebase/compat';
	import DocumentReference = firebase.firestore.DocumentReference;

	export let data;

	$: getTitle = () => {
		console.log($page.url.pathname);
		switch (true) {
			case $page.url.pathname.startsWith('/checkout'):
				return 'Bezahlen';
			case $page.url.pathname.startsWith('/settings'):
				return 'Einstellungen';
			default:
				return 'Kassensystem Feuerwehr Rohrbach';
		}
	};

	onAuthStateChanged(auth, async (user) => {
		console.log('Auth state changed!');
		userStore.update(u => {
			u.initDone = true;
			return u;
		});
		if (user) {
			console.log(`User logged in! ID: ${user.uid}`);
			const userDoc = doc(db, `instances/${user.uid}`);
			const d = await getDoc(userDoc);
			settingsStore.update(u => ({ ...d.data() }) as Settings);
			console.log("Settings", get(settingsStore));
			userStore.update(u => {
				u.loggedIn = true;
				u.id = user.uid;
				return u;
			});
		} else {
			console.log(`User logged out!`);
			userStore.update(u => {
				u.loggedIn = false;
				u.id = null;
				return u;
			});
		}
	});

	const updateNetwork = () => {
		if (get(settingsStore).offline) {
			disableNetwork(db);
			console.log("Network disabled!");
		} else {
			enableNetwork(db);
			console.log("Network enabled!");
		}
	};


	settingsStore.subscribe(() => {
		const user = get(userStore);
		if (!user.loggedIn) return;
		const userDoc: DocumentReference<Settings> = doc(db, `instances/${user.id}`) as DocumentReference<Settings>;
		const settings = get(settingsStore);
		const d = updateDoc(userDoc, settings);
		updateNetwork();
	});

	const transitionIn = (node, args) => {
		return $page.url.pathname === '/' ? fly(node, { y: -50, duration: 500, delay: 300 }) : fly(node, {
			y: 50,
			duration: 500,
			delay: 300
		});
	};
	const transitionOut = (node, args) => {
		return $page.url.pathname === '/' ? fly(node, { y: -50, duration: 300 }) : fly(node, { y: 50, duration: 300 });
	};

	if (navigator.storage && navigator.storage.persist) {
		navigator.storage.persist().then((persistent) => {
			if (persistent) {
				console.log("Storage will not be cleared except by explicit user action. Free space:", navigator.storage.estimate());
			} else {
				console.log("Storage may be cleared by the UA under storage pressure.");
				alert("Achtung: Lokaler Speicher kann vom Browser geleert werden!");
			}
		});
	}

</script>

<svelte:window bind:online={$isOnline} />

<nav>
	<div class='left'>
		<div class='left'>
			{#if $page.url.pathname !== "/"}
				<button on:click={() => history.back()} class='navButton backButton' transition:fly={{x: -20}}><img alt='back'
																																																						src={arrowIcon}>
				</button>
			{/if}
			<a href='/' class="logoLink {$page.url.pathname !== '/' ? 'logoLinkOffset' : ''}"><h1>{getTitle()}</h1></a>
		</div>
	</div>
	<div class='right'>
		<a href='/settings' class='navButton'><img alt='Einstellungen' src={settingsIcon} /></a>
	</div>
</nav>

{#key data.pathname}
	<div
		in:transitionIn
		out:transitionOut
		class='wrapper'
	>
		<slot />
	</div>
{/key}

<style lang='scss'>
  .wrapper {
    height: 100%;
    width: 100%;
  }

  h1 {
    margin: 0;
    padding: 0;
    font-size: 38px;
    color: white;
  }

  nav {
		box-sizing: border-box;
    width: calc(100% + 1px); // shruggggg
    height: 101px;
    background-color: #BA291B;
    padding: 20px 40px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .right, .left {
    display: flex;
    gap: 20px;
  }

  .navButton {
    border: none;
    background-color: #ff3e00;
    display: flex;
    padding: 10px;
    border-radius: 10px;
    cursor: pointer;
    height: 45px;
    width: 45px;
    box-sizing: border-box;
    justify-content: center;
    align-items: center;

    img {
      width: 25px;
      height: 25px;
      object-fit: cover;
    }
  }

  .backButton {
    position: absolute;
  }

  .logoLink {
    text-decoration: none;
    transition: .2s all ease-out;
    transform: translate(0);
  }

  .logoLinkOffset {
    transform: translate(75px);
  }
</style>
