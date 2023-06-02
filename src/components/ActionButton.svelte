<script>
	export let onClick;
	export let label;
	export let backgroundColor;
	export let borderColor;
	export let style;
</script>

<button on:click={onClick} style='background-color: {backgroundColor}; border: 1px solid {borderColor}; {style}'>
	{label}
</button>


<style>
    button {
        background-color: #cccccc;
        width: 140px;
        height: 30px;
        padding: 20px;
        border-radius: 23px;
        border: 1px solid #bbbbbb;
        cursor: pointer;
        color: white;
        text-decoration: none;
        box-sizing: content-box;
        display: flex;
        font-size: 22px;
        flex-wrap: wrap;
        font-weight: 700;
				align-items: center;
				justify-content: center;
    }
</style>
