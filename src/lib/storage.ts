import type {Transaction} from "$lib/types";


export const getTransactions = (): Transaction[] => {
    const data = localStorage.getItem("transactions");
    if (!data) {
        return [];
    }
    return JSON.parse(data);
}

const setTransactions = (overwriteWith: Transaction[]) => {
    localStorage.setItem("transactions", JSON.stringify(overwriteWith));
}

export const addTransaction = (transaction: Transaction) => {
    const transactions = getTransactions();
    if (!transaction.id) {
        transaction.id = crypto.randomUUID();
    }
    if (!transaction.date) {
        transaction.date = new Date();
    }
    setTransactions([...transactions, transaction]);
    return transaction;
}

export const removeTransaction = (id: string) => {
    setTransactions(getTransactions().filter((t) => t.id !== id));
}
