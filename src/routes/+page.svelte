<script lang='ts'>

	import { collection, getDocs, query, where } from 'firebase/firestore';
	import { db } from '$lib/firebase';
	import type { BillEntry } from '$lib/stores';
	import { bill, isDeletingOrder, settingsStore, user } from '$lib/stores';
	import EnsureAuth from '../components/EnsureAuth.svelte';
	import ArticleButton from '../components/ArticleButton.svelte';
	import Bill from '../components/Bill.svelte';
	import ActionButton from '../components/ActionButton.svelte';
	import { goto } from '$app/navigation';
	import type { Article } from '$lib/types';
	import { get } from 'svelte/store';

	let isOnline = false;

	$: instanceCollection = collection(db, `instances/${$user.id}/articles`);

	$: q = query(instanceCollection, where("isDeleted", "==", false));
	$: articles = async () => {
		const docs = await getDocs(q);
		const arr = [];
		docs.forEach(d => arr.push({ id: d.id, ...d.data() }));
		console.log(arr);
		return arr;
	};
	const clearAll = () => {
		isDeletingOrder.set({ deletes: true, deletesAll: true });
		bill.set([]);
	};


	const addToBill = (article: Article) => {
		bill.update((b: BillEntry[]) => {
			if (get(settingsStore).scrollToTopOnArticleAdd) {
				let arrayArticle = b.find(be => be.article.id === article.id);
				if (arrayArticle) {
					arrayArticle.direction = 1;
					arrayArticle.quantity++;
				} else {
					arrayArticle = { article, quantity: 1, direction: 1 };
				}
				return [arrayArticle, ...arrayArticle ? b.filter(be => be.article.id !== article.id) : b];
			} else {
				let containsArticle = false;
				b = b.map(be => {
					if (be.article.id === article.id) {
						be.direction = 1;
						be.quantity++;
						containsArticle = true;
					}
					return be;
				});
				if (!containsArticle) {
					return [...b, { article, quantity: 1, direction: 1 }];
				}
				return b;
			}
		});
	};

	let highlightedArticleId = null;
	const highlightArticle = (article) => {
		console.log('Clicked on ', article);
		highlightedArticleId = article.id;
		document.getElementById(article.id)?.scrollIntoView({ behavior: 'smooth' });
		setTimeout(() => {
			highlightedArticleId = null;
		}, 1000);
	};
</script>

<svelte:window bind:online={isOnline} />

<EnsureAuth>
	<div class='wrapper'>
		<div class='left'>
			<h1>Artikel</h1>
			{#await articles()}
				<p>Laden...</p>
			{:then articleArr}
				<div class='articleSoup'>
					{#each articleArr.sort((a, b) => a.sortIndex > b.sortIndex) as article}
						<ArticleButton article={article} isSelected={highlightedArticleId === article.id}
													 onClick={() => addToBill(article)} />
					{/each}
				</div>
			{:catch error}
				<h3>Fehler:</h3>
				<p>{error}</p>
			{/await}
		</div>
		<div class='right'>
			<div>
				<h1>Bon</h1>
				<Bill onArticleClick={highlightArticle} />
			</div>
			<div class='rightBottom'>
				<p>{$bill.reduce((acc, cur) => acc + cur.quantity * cur.article.price, 0).toFixed(2).replace(".", ",")}€</p>
				<div class='actionButtons'>
					<ActionButton label='Alles leeren' onClick={clearAll} backgroundColor='#BA291B' borderColor='#BA291B' />
					<ActionButton label='Weiter' onClick={() => goto("/checkout")} backgroundColor='#00BD13'
												borderColor='#00BD13' />
				</div>
			</div>
		</div>
	</div>
</EnsureAuth>

<style lang='scss'>
  .wrapper {
		box-sizing: border-box;
    padding: 20px 40px;
    display: flex;
    width: 100%;
    gap: 40px;
    height: 100%;
  }

  .left {
    flex-grow: 1;
  }

  .right {
    width: 500px;
    height: 100%;
    flex: 0 0 500px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
		overflow: scroll;
  }

  .articleSoup {
    display: flex;
		flex-wrap: wrap;
		max-height: 87%;
		overflow: scroll;
    gap: 20px;
  }
	.rightBottom {
		width: 100%;
		text-align: center;
		p {
			font-weight: 700;
			font-size: 43px;
		}
	}
  .actionButtons {
    display: flex;
    justify-content: space-evenly;
    margin: 20px 0;
  }
</style>
