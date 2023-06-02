import type { Writable } from 'svelte/store';
import { writable } from 'svelte/store';
import type { Article, Transaction } from '$lib/types';
import firebase from 'firebase/compat';

export const articles: Writable<Article[]> = writable([]);
export const transactions: Writable<Transaction[]> = writable([]);

interface User {
	loggedIn: boolean;
	id: string | null;
	initDone: boolean; // has firestore fininshed init?
}

export const user: Writable<User> = writable({ loggedIn: false, id: null, initDone: false });

export interface BillEntry {
	article: Article;
	quantity: number;
	direction: number;
}

export const bill: Writable<BillEntry[]> = writable([]);
export const isDeletingOrder: Writable<{ deletes: boolean, deletesAll: boolean }> = writable({ deletes: false, deletesAll: false });

export interface Settings {
	scrollToTopOnArticleAdd: boolean;
	offline: boolean;
}

export const settingsStore: Writable<Settings> = writable({scrollToTopOnArticleAdd: true, offline: false});

export const isOnline: Writable<boolean> = writable(true);
