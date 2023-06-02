<script lang='ts'>
	import type { Article } from '$lib/types';

	export let article: Article;
	export let onClick: () => void;
	export let isSelected: boolean;

</script>

{#if article}
<button id={article.id} on:click={onClick}
				style='background-color: {article.category === 0 ? "#78cbfa" : "#f5ad8d"}; border: 1px solid {article.category === 0 ? "#42ace8" : "#ea7f4e"}'
				class={isSelected ? "redBorder" : ""}>
	<span class='name' lang='de'>{article.name}</span>
	<span class='price'>{article.price?.toFixed(2)?.replace(".", ",")}€</span>
</button>
{:else}
	<p>shrug</p>
{/if}
<style>
    button {
        flex-shrink: 0;
        width: 160px;
        height: 80px;
        padding: 20px 25px;
        border-radius: 23px;
        border: 1px solid #bbbbbb;
        cursor: pointer;
        color: black;
        text-decoration: none;
        box-sizing: content-box;
        display: flex;
				position: relative;
        font-size: 18px;
        flex-wrap: wrap;
        font-weight: 500;
        flex-direction: column;
        justify-content: space-between;
        transition: .3s all cubic-bezier(.19, 1, .22, 1);
				outline: 0 solid transparent;
    }

    .name {
        width: 100%;
        font-size: 24px;
        font-weight: 600;
        text-align: left;
				hyphens: auto;
    }

    .price {
        /*width: 100%;*/
				position: absolute;
				right: 25px;
				bottom: 20px;

        text-align: right;
    }

    .redBorder {
        /*-webkit-transform: translateZ(0);*/
				box-shadow: 0 0 0 5px #BA291B;
				border: 1px solid transparent !important;
        overflow: hidden;
				transform: scale(1.1);
		}
</style>
