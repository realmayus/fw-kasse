<script lang='ts'>
	import { bill, isDeletingOrder, settingsStore, user } from '$lib/stores';
	import minusIcon from '$lib/images/minus.svg';
	import plusIcon from '$lib/images/plus.svg';
	import crossIcon from '$lib/images/cross.svg';
	import type { Article } from '$lib/types';
	import { fly, slide } from 'svelte/transition';
	import { get } from 'svelte/store';
	import { flip } from 'svelte/animate';

	export let onArticleClick: (article: Article) => void;

	const minus = (id) => {
		if ($bill.some(b => b.article.id === id && b.quantity === 1)) {
			remove(id);
			return;
		}
		bill.update(b => b.map(bi => {
			if (bi.article.id === id) {
				bi.direction = -1;
				bi.quantity--;
			}
			return bi;
		}));
	};
	const plus = (id) => {
		bill.update(b => b.map(bi => {
			if (bi.article.id === id) {
				bi.direction = 1;
				bi.quantity++;
			}
			return bi;
		}));
	};
	const remove = (id) => {
		isDeletingOrder.set({ deletes: true, deletesAll: get(bill).length <= 1});
		bill.update(b => b.filter(bi => bi.article.id !== id));
	};

	const flyCond = (node, args) => {
		return get(isDeletingOrder).deletes ? {} : fly(node, args);
	};
	const flipCond = (node, fromto, args) => {
		return get(isDeletingOrder).deletesAll ? {} : flip(node, fromto, args);
	}

	const slideCond = (node, args) => {
		return get(settingsStore).scrollToTopOnArticleAdd && get(bill).length !== 1 ? {} : slide(node, args);
	}

	const onTransitionFinish = () => {
		isDeletingOrder.set({ deletes: false, deletesAll: false });
	};
</script>

<div class='wrapper'>
	{#each $bill as entry (entry.article.id)}
		<div class='entry' in:slideCond out:slide animate:flipCond={{duration: 300, /*easing: expoInOut,*/ delay: 0}}>
			<div on:click={() => onArticleClick(entry.article)} class='article'
					 style='background-color: {entry.article.category === 0 ? "#78cbfa" : "#f5ad8d"}'>
				<span>{entry.article.name}</span>
				<div style='display: flex; position: relative'>
					<span style='visibility: hidden'>×{entry.quantity}</span>  <!-- reserve space -->
					{#key entry.quantity}
						<span in:flyCond={{y: entry.direction * -25, delay: 30}} out:flyCond={{y: entry.direction * 25}}
									on:outroend={onTransitionFinish} style='position: absolute'>×{entry.quantity}</span>
					{/key}
				</div>
			</div>
			<button on:click={() => minus(entry.article.id)} class='minus'><img src={minusIcon} alt='-' /></button>
			<button on:click={() => plus(entry.article.id)} class='plus'><img src={plusIcon} alt='+' /></button>
			<button on:click={() => remove(entry.article.id)} class='cross'><img src={crossIcon} alt='X' /></button>
		</div>
	{/each}
</div>

<style lang='scss'>
  .wrapper {
    display: flex;
    gap: 5px;
    flex-direction: column;
  }

  .entry {
    display: flex;
    gap: 5px;
  }

  .article, .minus, .plus, .cross {
    height: 35px;
    padding: 15px;

    img {
      width: 90%;
    }
  }

  .cross {
    img {
      width: 75%;
    }
  }

  .article {
    flex-grow: 1;
    display: flex;
    justify-content: space-between;
    align-items: center;

    span {
      font-size: 22px;
      font-weight: 500;
    }
  }

  .minus, .plus, .cross {
    flex-shrink: 0;
    width: 35px;
    border: none;
    box-sizing: content-box;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }

  .minus {
    background-color: #D197FF;
  }

  .plus {
    background-color: #B454FF;
  }

  .cross {
    background-color: #BA291B;
  }
</style>
