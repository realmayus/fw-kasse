<script lang='ts'>

	import { goto } from '$app/navigation';
	import ActionButton from '../../components/ActionButton.svelte';
	import TokenCounter from '../../components/TokenCounter.svelte';
	import redToken from '$lib/images/red.svg';
	import blueToken from '$lib/images/blue.svg';
	import greenToken from '$lib/images/green.svg';
	import whiteToken from '$lib/images/white.svg';
	import orangeToken from '$lib/images/orange.svg';
	import { bill, user } from '$lib/stores.ts';
	import Keypad from '../../components/Keypad.svelte';
	import { collection, doc, setDoc } from 'firebase/firestore';
	import { db } from '$lib/firebase';
	import type { Article, Transaction } from '$lib/types';
	import firebase from 'firebase/compat';
	import DocumentReference = firebase.firestore.DocumentReference;
	import { v4 } from 'uuid';

	$: instanceCollection = collection(db, `instances/${$user.id}/transactions`);

	let intInput = 0;  // numbers in front of the comma
	let decInput = 0;  // numbers after the comma
	let commaMode = false;  // write to decInput instead of intInput
	let inputStop = false;
	$: givenInput = intInput + (decInput / 100);  // this is printed to the screen


	$: change = givenInput - $bill.reduce((acc, a) => acc + a.article.price * a.quantity, 0);

	const onKeypadClick = (clickedNum: number) => {
		console.log("before", clickedNum, commaMode, intInput, decInput);
		if (clickedNum === -1) { // backspace
			if (commaMode) {
				if (decInput > 0) {
					if (decInput % 10 !== 0) {

					decInput = Math.floor(decInput / 10);
					decInput *= 10;
					} else {
						decInput = 0;
					}
					inputStop = false;
				} else {
					commaMode = false;
					onKeypadClick(-1);
				}
			} else {
				intInput = Math.floor(intInput / 10);
			}
			return;
		} else if (clickedNum === -2) { // comma
			commaMode = true;
			return;
		}
		if (inputStop) return;

		if (commaMode) {
			decInput += clickedNum;
			if (decInput < 10) {
				decInput *= 10;
			} else {
				inputStop = true;
			}
			decInput %= 100;
		} else {
			intInput *= 10;
			intInput += clickedNum;
		}
	};

	const finishOrder = (server: boolean) => {
		const id = v4();
		const docRef: DocumentReference<Transaction> = doc(instanceCollection, id) as DocumentReference<Transaction>;
		const saveTransaction: Omit<Transaction, "id"> = {
			date: new Date(),
			options: 0,
			orders: $bill.map(b => ({articleId: b.article!.id!, quantity: b.quantity})),
			server,
		};
		setDoc(docRef, saveTransaction).catch((e) => {
			console.error(e);
			alert("Konnte Transaktion nicht speichern: \n" + JSON.stringify(e));
		});
		bill.set([]);
		goto("/");
	}
</script>

<div class='wrapper'>
	<div class='left'>
		<div class='leftTop'>
			<div class='dueRow'>
				<span class='text'>zu Zahlen:</span>
				<span
					class='amount'>{$bill.reduce((acc, a) => acc + a.article.price * a.quantity, 0).toFixed(2).replace(".", ",")}€</span>
			</div>
			<div class='givenRow'>
				<span class='text'>Gegeben:</span>
				<span class='amount'>{givenInput.toFixed(2).replace(".", ",")}€</span>
			</div>
			<div class='inputRow'>
				<div class='shortcuts'>
					<span>Kürzel:</span>
					<button on:click={() => intInput += 5}>5€</button>
					<button on:click={() => intInput += 10}>10€</button>
					<button on:click={() => intInput += 20}>20€</button>
				</div>
				<div>
					<Keypad onClick={onKeypadClick} />
				</div>
			</div>
		</div>
		<div class='actionRow'>
			<ActionButton label='Abbrechen' backgroundColor='#BA291B' borderColor='#BA291B' style='height: 60px; width: 160px' onClick={() => goto("/")} />
		</div>
	</div>
	<div class='right'>
		<div class='chips'>
			<div class='top'>
				<TokenCounter showControls={false} icon={redToken}
											value={$bill.reduce((acc, cur) => acc + (cur.article.red ?? 0) * cur.quantity, 0)}
											blackText={false} isChip={true} large={true} inactive={true} />
				<TokenCounter showControls={false} icon={blueToken}
											value={$bill.reduce((acc, cur) => acc + (cur.article.blue ?? 0) * cur.quantity, 0)}
											blackText={false} isChip={true} large={true} inactive={true} />
				<TokenCounter showControls={false} icon={greenToken}
											value={$bill.reduce((acc, cur) => acc + (cur.article.green ?? 0) * cur.quantity, 0)}
											blackText={false} isChip={true} large={true} inactive={true} />
			</div>
			<div class='bottom'>
				<TokenCounter showControls={false} icon={whiteToken}
											value={$bill.reduce((acc, cur) => acc + (cur.article.white ?? 0) * cur.quantity, 0)}
											blackText={true} isChip={true} large={true} inactive={true} />
				<TokenCounter showControls={false} icon={orangeToken}
											value={$bill.reduce((acc, cur) => acc + (cur.article.orange ?? 0) * cur.quantity, 0)}
											blackText={false} isChip={true} large={true} inactive={true} />
			</div>
		</div>
		<div class='tickets'>
			<span>Wertbons:</span>
			{#each $bill.filter(o => o.article.tickets > 0) as ticket}
				<div class='ticket'>
					<span class='number'>{ticket.quantity}×</span>
					<span class='name'>{ticket.article.name}</span>
				</div>
			{/each}
		</div>
		<div class='bottom'>
			<div class='change'>
				<span>Rückgeld:</span>
				<span class='changeAmount {change < 0 ? "negative" : ""}'>{change.toFixed(2).replace(".", ",")}€</span>
			</div>
			<div class='actionButtons'>
				<ActionButton label='Fertig (Bedienung)' onClick={() => finishOrder(true)} backgroundColor='#9F7C00'
											borderColor='#9F7C00' style='height: 60px; width: 160px' />
				<ActionButton label='Fertig' onClick={() => finishOrder(false)} backgroundColor='#00BD13' borderColor='#00BD13'
											style='height: 60px; width: 160px' />
			</div>
		</div>
	</div>
</div>

<style lang='scss'>
  .wrapper {
    padding: 20px 40px;
    display: flex;
    width: calc(100% - 80px);
    gap: 100px;
    height: calc(100% - 40px);
    background-color: #201111;
    justify-content: space-between;
    color: white;
  }

  .change {
    display: flex;
    flex-direction: column;
    width: 100%;
    text-align: center;
    font-size: 48px;
    font-weight: 700;

    .changeAmount {
      color: #31DC22;
    }
  }

  .negative {
    color: #ff3e00 !important;
  }

  .left {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    padding: 40px;
    max-width: 700px;
		justify-content: space-between;
  }

	.leftTop {
    gap: 40px;
    display: flex;
    flex-direction: column;
  }

  .right {
    width: 500px;
    height: 100%;
		box-sizing: border-box;
    padding: 40px 0;
    flex: 0 0 500px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    overflow: scroll;
    gap: 20px;

    > .bottom {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
  }

  .actionButtons {
    display: flex;
    justify-content: space-between;
    margin: 20px 0;
  }

  .chips {
    .top, .bottom {
      display: flex;
      width: 100%;
      justify-content: center;
      gap: 10px;
    }
  }

  .tickets {
    > span {
      text-align: center;
      font-size: 48px;
      font-weight: 700;
    }

    display: flex;
    width: 100%;
    gap: 10px;
    flex-direction: column;

    .ticket {
      padding: 10px 20px;
      background-color: #D197FF;
      font-size: 32px;
      color: black;

      .number {
        font-weight: 700;
      }

      .name {
        font-weight: 500;
      }
    }
  }

  .dueRow, .givenRow {
    font-weight: 700;
    font-size: 48px;
    align-items: center;

    .amount {
      font-size: 56px;
    }
  }

  .dueRow {
    width: 100%;
    display: flex;
    justify-content: space-between;

    .amount {
      padding: 10px 20px;
      color: #FF8888;
    }
  }

  .givenRow {
    width: 100%;
    display: flex;
    justify-content: space-between;
    gap: 100px;

    .amount {
      background-color: #D9D9D9;
      flex-grow: 1;
      text-align: right;
      color: #3246FF;
      padding: 10px 20px;
    }
  }

  .inputRow {
    display: flex;
    justify-content: space-between;
    gap: 40px;
  }

  .shortcuts {
    display: flex;
    gap: 10px;
    flex-direction: column;
    width: 100%;
    height: 100%;
    justify-content: flex-end;

    span {
      font-size: 32px;
      font-weight: 600;
      color: #475AFF;
      text-align: center;
    }

    button {
      background-color: #475AFF;
      color: black;
      box-sizing: border-box;
      display: flex;
      justify-content: center;
      align-items: center;
      border: none;
      border-radius: 11px;
      font-size: 32px;
      font-weight: 600;
      padding: 20px 0;
    }
  }
</style>
