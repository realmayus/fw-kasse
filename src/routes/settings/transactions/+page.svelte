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

	$: instanceCollection = collection(db, `instances/${$user.id}/transactions`);
	$: instanceCollectionArt = collection(db, `instances/${$user.id}/articles`);

	let fetchedTransactions = [];
	let fetchedArticles = [];

	async function fetchData() {
		const q = query(instanceCollection);
		const qArt = query(instanceCollectionArt);
		const docs = await getDocs(q);
		const arr = [];
		docs.forEach(d => arr.push({ id: d.id, ...d.data() }));
		fetchedTransactions = arr;

		const arrArt = [];
		const docsArt = await getDocs(qArt);
		docsArt.forEach(d => arrArt.push({id: d.id, ...d.data()}));
		fetchedArticles = arrArt;
		console.log(fetchedArticles);
		console.log(fetchedTransactions);
	}

</script>


<EnsureAuth>
	<div class='wrapper'>
		<div class='left'>
			<h1>Transaktionen ansehen</h1>
			<p>Falls eine Transaktion inkorrekt ist, bitte Transaktionsnummer notieren!</p>
			{#await fetchData()}
				<p>Laden...</p>
			{:then _}
				{#each fetchedTransactions.sort((a,b) => a.date > b.date ? 1 : -1).reverse() as txn, i}
					<div>
						<h3><b>Transaktion Nr. {fetchedTransactions.length - i}</b> ({new Intl.DateTimeFormat("de-DE", {dateStyle: "short", timeStyle: "short"}).format(txn.date.toDate())})</h3>
						{#each txn.orders as order}
							{@const art = fetchedArticles.find(a => a.id === order.articleId)}
							<p>{order?.quantity}x {art?.name}  (je {art?.price?.toFixed(2)?.replace(".", ",")}) </p>
						{/each}
						<p><b>Preis:</b> {txn.orders.reduce((acc, cur) => acc + cur.quantity * fetchedArticles.find(a => a.id === cur.articleId).price, 0).toFixed(2).replace(".", ",")}€</p>
						<p><b>Bedienung:</b> {txn.server ? "Ja" : "Nein"}</p>
						<p><b>Kunde hat gegeben:</b> {txn.givenMoney ? txn.givenMoney.toFixed(2).replace(".", ",") + "€" : "-"}</p>
					</div>
				{/each}
			{:catch err}
				<p>Fehler:</p>
				<pre>
					{JSON.stringify(err)}
				</pre>
			{/await}
		</div>
	</div>
</EnsureAuth>

<style>
	.wrapper {
      padding: 20px 40px;
  }
</style>
