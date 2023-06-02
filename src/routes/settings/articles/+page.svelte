<script lang='ts'>
	import { collection, doc, getDocs, query, setDoc, updateDoc, where } from 'firebase/firestore';
	import { db } from '$lib/firebase';
	import { isOnline, settingsStore, user } from '$lib/stores';
	import type { Article } from '$lib/types';
	import { ArticleCategory } from '$lib/types';
	import { fly } from 'svelte/transition';
	import ActionButton from '../../../components/ActionButton.svelte';
	import firebase from 'firebase/compat';
	import ArticleButton from '../../../components/ArticleButton.svelte';
	import DocumentReference = firebase.firestore.DocumentReference;
	import { get } from 'svelte/store';
	import TokenCounter from '../../../components/TokenCounter.svelte';
	import redToken from "$lib/images/red.svg";
	import whiteToken from "$lib/images/white.svg";
	import blueToken from "$lib/images/blue.svg";
	import greenToken from "$lib/images/green.svg";
	import orangeToken from "$lib/images/orange.svg";
	import ticketsIcon from "$lib/images/tickets.svg";
	import EnsureAuth from '../../../components/EnsureAuth.svelte';
	import {v4 as uuidv4} from "uuid";

	$: instanceCollection = collection(db, `instances/${$user.id}/articles`);

	let localCopy = [];
	let toFixSortIndex = [];

	async function fetchData() {
		const q = query(instanceCollection, where("isDeleted", "==", showDeleted));
		const docs = await getDocs(q);
		const arr = [];
		docs.forEach(d => arr.push({ id: d.id, ...d.data() }));

		localCopy = arr;
		toFixSortIndex = localCopy
			.filter((a, i) => a.sortIndex === -1 || (localCopy.map(b => b.sortIndex).indexOf(a.sortIndex) !== i && i))

		localCopy = localCopy.map(a => {
			if (toFixSortIndex.some(b => b.id === a.id)) {
				a.sortIndex = -1;
			}
			return a;
		});
		console.log(localCopy);
		console.log(toFixSortIndex);
		fixSortIndex();
		console.log(localCopy);
	}

	const fixSortIndex = () => {
		if (!showDeleted) {
			for (const toFix of toFixSortIndex) {
				const docRef: DocumentReference<Article> = doc(instanceCollection, toFix.id) as DocumentReference<Article>;
				const maxSortIndex = localCopy.reduce((pre, cur) => pre.sortIndex > cur.sortIndex ? pre : cur).sortIndex;
				updateDoc(docRef, { sortIndex: maxSortIndex + 1 }).catch(e => {
					console.error(e);
					alert("Fehler beim Arrangieren der Indices: \n" + JSON.stringify(e, null, 2));
					fetchData();
				});
				localCopy = localCopy.map(a => {
					if (a.id === toFix.id) {
						a.sortIndex = maxSortIndex + 1;
					}
					return a;
				});
			}
		}
	}

	let showDeleted = false;

	$: showDeleted, $user.loggedIn && $user.initDone && fetchData();

	let selectedArticle: Article | null = null;
	let priceInput = "";

	let selectOptions = [
		{
			id: 0,
			text: "Getränke"
		},
		{
			id: 1,
			text: "Essen"
		}
	];
	let selectedCategory = "";

	const selectArticle = (article, noToggle = false) => {
		createNew = false;
		if (selectedArticle?.id === article.id && !noToggle) {
			selectedArticle = null;
		} else {
			selectedArticle = { red: 0, white: 0, green: 0, blue: 0, tickets: 0, orange: 0, ...article };  // copy article, we don't want to modify the original one
			priceInput = selectedArticle?.price.toFixed(2).replace(".", ",") || "";
			selectedCategory = selectOptions[selectedArticle?.category] || "";
		}
	}
	let error = "";

	const deletion = async () => {
		if (selectedArticle?.id) {
			const docRef: DocumentReference<Article> = doc(instanceCollection, selectedArticle.id) as DocumentReference<Article>;

			localCopy = localCopy.filter(a => a.id !== selectedArticle?.id);

			// don't await such that we don't block the main UI thread
			updateDoc(docRef, { isDeleted: !showDeleted, sortIndex: -1 }).catch(e => {
				console.error(e);
				alert("Fehler: \n" + JSON.stringify(e, null, 2));
				fetchData();
			});

			selectedArticle = null;
		} else {
			console.warn("selectedArticle has no ID");
		}
	}
	const save = async () => {
		if (selectedArticle?.id) {
			const docRef: DocumentReference<Article> = doc(instanceCollection, selectedArticle.id) as DocumentReference<Article>;
			if (isNaN(Number(priceInput.replace(",", ".")))) {
				error = "Preis muss eine Zahl sein";
				console.warn("price has to be a valid number");
				return;
			}
			const saveArticle: Omit<Article, "id"> = {
				category: selectedCategory.id,
				name: selectedArticle.name,
				price: Number(priceInput.replace(",", ".")),
				options: 0,
				isDeleted: false,
				sortIndex: selectedArticle.sortIndex,
				red: selectedArticle.red,
				green: selectedArticle.green,
				blue: selectedArticle.blue,
				white: selectedArticle.white,
				tickets: selectedArticle.tickets,
			}
			console.log("localCOpy before save", localCopy);
			localCopy = localCopy.filter(a => a.id !== selectedArticle?.id);
			localCopy.push({id: selectedArticle.id, ...saveArticle})
			console.log("localCOpy after save", localCopy);

			// dont await so we don't block the main thread
			setDoc(docRef, saveArticle).catch(e => {
				console.error(e);
				alert("Fehler: \n" + JSON.stringify(e, null, 2));
				fetchData();
			});

			selectedArticle = null;
		} else {
			console.warn("selectedArticle has no ID");
		}
	}
	let createNew = false;
	const newArticle = () => {
		createNew = true;
		selectedArticle = {
			id: uuidv4(),
			name: "",
			category: ArticleCategory.DRINK,
			price: 0,
			options: 0,
			isDeleted: false,
			sortIndex: localCopy.length,
			red: 0,
			green: 0,
			blue: 0,
			white: 0,
			orange: 0,
			tickets: 0,
		}
	}

	const move = async (left: boolean) => {
		const selectedIndex = selectedArticle?.sortIndex ?? 0; // store due to race condition ._.

		const neigborIndex = localCopy.filter(a => left ? a.sortIndex < selectedIndex : a.sortIndex > selectedIndex).reduce((pre, cur) => (left ? pre.sortIndex > cur.sortIndex : pre.sortIndex < cur.sortIndex) ? pre : cur).sortIndex;

		const neighborArticle = localCopy.find(a => a.sortIndex === neigborIndex);
		if (!neighborArticle) {
			return;
		}
		const neighborDoc: DocumentReference<Article> = doc(instanceCollection, neighborArticle.id) as DocumentReference<Article>;
		const artDoc: DocumentReference<Article> = doc(instanceCollection, selectedArticle.id) as DocumentReference<Article>;

		localCopy = localCopy.map(a => {
			if (a.id === neighborArticle.id) {
				a.sortIndex = selectedIndex;
			} else if (a.id === selectedArticle?.id) {
				a.sortIndex = a.sortIndex + (left ? -1 : 1);
			}
			return a;
		});

		updateDoc(neighborDoc, {sortIndex: selectedIndex}).then(async () => {
			await updateDoc(artDoc, {sortIndex: selectedIndex + (left ? -1 : 1)});
		}).catch(e => {
			console.log(e);
			alert("Fehler: \n" + JSON.stringify(e, null, 2));
			fetchData();
		});
		selectArticle(localCopy.find(a => a.id === selectedArticle?.id), true);
	}

</script>


<EnsureAuth>
	<div class='wrapper'>
		<div class='left'>
			<div class='headlineWrapper'>
				<h1>{showDeleted ? "Gelöschte Artikel ansehen": "Artikel bearbeiten"}</h1>
				{#if !showDeleted}
					<ActionButton label='Neu' backgroundColor='#00BD13' borderColor='#00BD13' onClick={newArticle}/>
					{#if selectedArticle}
						<div style='display: flex; gap: 10px;'>
							<ActionButton label='<-' backgroundColor='#B454FF' borderColor='#B454FF' onClick={() => move(true)} style='width: 40px'/>
							<ActionButton label='->' backgroundColor='#B454FF' borderColor='#B454FF' onClick={() => move(false)} style='width: 40px'/>
						</div>
					{/if}
				{/if}
			</div>
			<a href="#" on:click={() => {showDeleted = !showDeleted; selectedArticle = null; localCopy = []}}>{showDeleted ? "Alle" : "Gelöschte"} Artikel anzeigen</a>
			{#if !showDeleted}
				<p>Bitte wähle einen Artikel aus, um ihn zu bearbeiten.</p>
			{:else}
				<p>Diese Artikel sind gelöscht. Du kannst sie hier wiederherstellen.</p>
			{/if}
			<div class='articleSoup'>
				{#await fetchData()}
					<p>Laden...</p>
				{:then _}
					{#each localCopy.sort((a, b) => a.sortIndex > b.sortIndex) as article}
						<ArticleButton article={article} isSelected={article?.id === selectedArticle?.id} onClick={() => selectArticle(article)}/>
					{/each}
				{:catch error}
					<h3>Fehler ({error.code})</h3>
					<p>{error.message}</p>
				{/await}
			</div>
		</div>
		{#if selectedArticle}
			<div class='right' transition:fly={{x: 10}}>
				<div class='top'>
					<h3>{createNew ? "Neuen Artikel anlegen" : `Daten bearbeiten`}</h3>
					{#if error}
						<h3>Fehler</h3>
						<p>error</p>
					{/if}
					<label>
						Name: <br/>
						{#if !showDeleted}
							<input type='text' bind:value={selectedArticle.name}/>
						{:else}
							<p><b>{selectedArticle.name}</b></p>
						{/if}
					</label>
					<label>
						Preis (in €): <br/>
						{#if !showDeleted}
							<input type="text" inputmode="numeric" bind:value={priceInput}/>
						{:else}
							<p><b>{priceInput}</b></p>
						{/if}

					</label>
					<label>
						Kategorie: <br/>
						{#if !showDeleted}
							<select bind:value={selectedCategory}>
								{#each Object.values(selectOptions) as optn}
									<option value={optn}>{optn.text}</option>
								{/each}
							</select>
						{:else}
							<p><b>{selectedCategory.text}</b></p>
						{/if}
					</label>
					<p class='tag'>
						Chips:
					</p>
					{#if !showDeleted}
						<div class='tokens'>
							<TokenCounter showControls={true} icon={redToken} bind:value={selectedArticle.red} alt='Rot' isChip={true} blackText={false}/>
							<TokenCounter showControls={true} icon={whiteToken} bind:value={selectedArticle.white} alt='Weiß' isChip={true} blackText={true}/>
							<TokenCounter showControls={true} icon={blueToken} bind:value={selectedArticle.blue} alt='Blau' isChip={true} blackText={false}/>
							<TokenCounter showControls={true} icon={greenToken} bind:value={selectedArticle.green} alt='Grün' isChip={true} blackText={false}/>
							<TokenCounter showControls={true} icon={orangeToken} bind:value={selectedArticle.orange} alt='Orange' isChip={true} blackText={false}/>
							<TokenCounter showControls={true} icon={ticketsIcon} bind:value={selectedArticle.tickets} alt='Wertmarken' isChip={false} blackText={true}/>
						</div>
					{:else}
						<p><b>{selectedCategory.text}</b></p>
					{/if}
				</div>
				<div class='bottom'>
					{#if !showDeleted && !createNew}
						<a href='#' on:click={deletion}>Artikel löschen</a>
					{/if}
					<div class='bottom-buttons'>
						<ActionButton label='Abbrechen' onClick={() => selectedArticle = null} backgroundColor='#BA291B' borderColor='#BA291B' />
						<ActionButton label={createNew ? "Erstellen" : !showDeleted ? 'Speichern' : "Wiederherstellen"} onClick={!showDeleted ? save : deletion} backgroundColor='#00BD13' borderColor='#00BD13' />
					</div>
				</div>
			</div>
		{/if}
	</div>
</EnsureAuth>

<style lang='scss'>
    .wrapper {
        display: flex;
				width: 100%;
				height: 100%;
        gap: 40px;
    }

    .articleSoup {
        display: flex;
				flex-wrap: wrap;
        gap: 20px;
		}

    .left {
        padding: 20px 40px;
        flex-grow: 1;
				max-width: calc(100% - 600px);
    }
		.top {
				h3 {
						margin-top: 0;
				}
		}
    .right {
        padding: 40px 40px;
        width: 600px;
        height: calc(100% - 80px);
        flex: 0 0 400px;
        display: flex;
        flex-direction: column;
				justify-content: space-between;
				box-shadow: -10px 0 10px -5px rgba(0, 0, 0, .2);
				gap: 20px;
    }
		label,.tag {
				flex-shrink: 0;
				font-weight: 500;
				display: block;
		}
    input,select {
				margin: 10px 0;
		}

		.headlineWrapper {
				display: flex;
				align-items: center;
				gap: 40px;
		}

		.bottom {
			display: flex;
			flex-direction: column;
			align-items: center;
			width: 100%;
			gap: 20px;
		}
		.bottom-buttons {
			width: 100%;
				display: flex;
				justify-content: space-between;
		}

		select {
			font-size: 20px;
			padding: 15px 20px;
		}

		a,a:visited {
			color: #BA291B;
		}

		.tokens {
			width: 100%;
			display: flex;
			justify-content: space-between;

		}
</style>
