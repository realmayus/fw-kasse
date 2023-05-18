export interface Transaction {
    id?: string,
    date?: Date,
    orders: Order[],
    options: number,
}

export enum ArticleCategory {
    DRINK,
    FOOD
}
export interface Article {
    id?: string,
    name: string,
    price: number,
    category: ArticleCategory
}

export interface Order {
    id?: string,
    articleId: number,
    quantity: number,
}
