<script lang="ts">
import EnsureAuth from '../../../components/EnsureAuth.svelte';
import type { Article } from '$lib/types.js';
import { collection, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { db } from '$lib/firebase.js';
import { user } from '$lib/stores.js';
import DocumentReference = firebase.firestore.DocumentReference;

$: instanceCollection = collection(db, `instances/${$user.id}/articles`);

const fixIndices = async () => {
	const q = query(instanceCollection, where("isDeleted", "==", false));
	const docs = await getDocs(q);
	let arr = [];
	docs.forEach(d => arr.push({ id: d.id, ...d.data() }));
	arr = arr.sort((a,b) => a.sortIndex > b.sortIndex ? 1 : 0);
	let i = 0;
	for await (const article of arr) {
		const docRef: DocumentReference<Article> = doc(instanceCollection, article.id) as DocumentReference<Article>;
		await updateDoc(docRef, { sortIndex: i});
		console.log(`Updated article ${article.id} to have index ${i}`);
		i++;
	}
}
</script>

<EnsureAuth>
	<div class='wrapper'>
		<h1>Erweiterte Einstellungen</h1>
		<p><b>Bitte nur in Absprache mit Marius verwenden!</b></p>
		<div class='settingsSoup'>
			<button class='settingsButton' on:click={fixIndices}>Artikel-Indexe reparieren</button>
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
				text-align: left;
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
