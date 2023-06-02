export interface Transaction {
	id?: string;
	date?: Date;
	orders: Order[];
	options: number;
	server: boolean;
}

export enum ArticleCategory {
	DRINK = 0,
	FOOD = 1
}
export interface Article {
	id?: string;
	name: string;
	price: number;
	category: ArticleCategory;
	options: number;
	sortIndex: number;
	red: number;
	green: number;
	blue: number;
	white: number;
	orange: number;
	tickets: number;
	isDeleted: boolean;
}

export interface Order {
	articleId: string;
	quantity: number;
}
