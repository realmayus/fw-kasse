import type {Article, Order, Transaction} from "$lib/types";
import type Database from "better-sqlite3";
import {getLogger} from "$lib/logger";

const logger = getLogger("Database");

const buildQuery = (obj: any, id: string) => {
    const updateFields: string[] = [];
    const params = [];

    Object.keys(obj).forEach((key) => {
        const value = obj[key];
        if (value !== null && value !== undefined && key !== "id") {
            updateFields.push(`${key} = ?`);
            params.push(value);
        }
    });
    const query = `UPDATE articles
                   SET ${updateFields.join(', ')}
                   WHERE id = ?`;
    params.push(id);
    return {query, params};
}
export const getArticlesDB = (db: Database.Database): Article[] => {
    return db.prepare("SELECT * FROM articles").all() as Article[];
}

export const createArticleDB = (db: Database.Database, article: Required<Article>) => {
    logger.debug(`Creating Article (${article.id})`);
    db.prepare("INSERT INTO articles (id, name, price) VALUES (?, ?, ?)").run(article.id, article.name, article.price);
}

export const bulkCreateArticleDB = (db: Database.Database, articles: Required<Article>[]) => {
    logger.debug(`Bulk-creating ${articles.length} articles`);
    const stmt = db.prepare("INSERT INTO articles (id, name, price) VALUES (?, ?, ?)");
    const bulk = db.transaction((articlesInner) => {
        for (const article of articlesInner) {
            logger.debug(`Creating Article (${article.id})`);
            stmt.run(article.id, article.text, article.price);
        }
    });
    bulk(articles);
}

export const bulkSetArticleDB = (db: Database.Database, articles: Required<Article>[]): void => {
    logger.debug(`Bulk-setting ${articles.length} articles`);
    const existsStmt = db.prepare('SELECT * FROM articles WHERE id = ?');
    const updateStmt = db.prepare('UPDATE articles SET name = ?, price = ? WHERE id = ?');
    const createStmt = db.prepare('INSERT INTO articles (id, name, price) VALUES (?, ?, ?)');
    const staleArticlesStmt = db.prepare(`SELECT id
                                          from transactions
                                          where id not in (${articles.map(a => '?').join(",")})`);

    const bulk = db.transaction((articlesInner) => {
        for (const article of articlesInner) {
            const {id, name, price} = article;

            const existingArticle = existsStmt.get(id);

            if (existingArticle) {
                // Update the existing article
                updateStmt.run(name, price, id);
                logger.debug(`Article with ID ${id} updated successfully`);
            } else {
                // Create a new article
                createStmt.run(id, name, price);
                logger.debug(`New article with ID ${id} created successfully`);
            }
        }
    });

    bulk(articles);
    const staleArticles = staleArticlesStmt.all(articles.map(a => a.id));
    staleArticles.forEach(a => {
        logger.warn(`Article (${a.id}) not present on pushing client, might be stale`);
    })

};

export const deleteArticleDB = (db: Database.Database, id: string) => {
    logger.debug(`Deleting Article (${id})`);
    return db.prepare("DELETE FROM articles where id = ?").run(id).changes > 0
}

export const existsArticleDB = (db: Database.Database, id: string) => {
    const res = db.prepare("SELECT COUNT(*) as count FROM articles WHERE id = ?").get(id) as { count: number };
    return res.count > 0;
}

export const getTransactionsDB = (db: Database.Database): IterableIterator<Transaction> => {
    const all = db.prepare("SELECT transaction_id as id, o.id as orderId, date, article_id as articleId, quantity, a.price as singlePrice FROM transactions JOIN orders o on transactions.id = o.transaction_id join articles a on a.id = o.article_id").all();
    const transactions = new Map<string, Transaction>;
    all.map((row: any) => {
        const txn: Partial<Transaction> = transactions.get(row.id) || {};
        let orders: Order[] = [];
        if (txn) {
            orders = txn.orders || [];
        }
        txn.id = row.id;
        txn.date = new Date(row.date);
        txn.options = row.options;
        txn.orders = [{id: row.orderId, articleId: row.articleId, quantity: row.quantity}, ...orders];
        transactions.set(txn.id as string, txn as Transaction);
        return row;
    });
    return transactions.values();
}

export const createTransactionDB = (db: Database.Database, txn: Required<Transaction>) => {
    logger.debug(`Creating Transaction (${txn.id})`);
    console.log(`INSERT INTO transactions (id, date, options)
                 VALUES (${txn.id}, ${txn.date.toISOString()}, ${txn.options})`);
    let res = db.prepare("INSERT INTO transactions (id, date, options) VALUES (?, ?, ?)").run(txn.id, txn.date.toISOString(), txn.options);
    console.log({res});
    txn.orders.forEach(o => {
        res = db.prepare("INSERT INTO orders (id, transaction_id, article_id, quantity) VALUES (?, ?, ?, ?)").run(o.id, txn.id, o.articleId, o.quantity);
        console.log({res});
    });
}

export const bulkCreateTransactionDB = (db: Database.Database, txns: Required<Transaction>[]) => {
    logger.debug(`Bulk-creating ${txns.length} transactions...`);
    const txnStmt = db.prepare("INSERT INTO transactions (id, date, options) VALUES (?, ?, ?)");
    const orderStmt = db.prepare("INSERT INTO orders (id, transaction_id, article_id, quantity) VALUES (?, ?, ?, ?)");
    const bulk = db.transaction((txnsInner) => {
        for (const txn of txnsInner) {
            logger.debug(`Creating Transaction (${txn.id})`);
            txnStmt.run(txn.id, txn.date.toISOString(), txn.options);
            for (const o of txn.orders) {
                logger.debug(`Creating Order (${o.id})`);
                orderStmt.run(o.id, txn.id, o.articleId, o.quantity);
            }
        }
    });
    bulk(txns);
}

export const deleteTransactionDB = (db: Database.Database, id: string) => {
    logger.debug(`Deleting Transaction (${id})`);
    let changes = db.prepare("DELETE FROM orders where transaction_id = ?").run(id).changes;
    changes += db.prepare("DELETE FROM transactions where id = ?").run(id).changes;
    return changes > 0;
}

export const bulkSetTransactionDB = (db: Database.Database, txns: Required<Transaction>[]): void => {
    logger.debug(`Bulk-setting ${txns.length} transactions`);
    const existsStmt = db.prepare('SELECT * FROM transactions WHERE id = ?');
    const deleteAllAssociatedOrdersStmt = db.prepare('SELECT * FROM orders WHERE transaction_id = ?');
    const updateStmt = db.prepare('UPDATE transactions SET date = ?, options = ? WHERE id = ?');
    const createStmt = db.prepare('INSERT INTO transactions (id, date, options) VALUES (?, ?, ?)');
    const createOrderStmt = db.prepare('INSERT INTO orders (id, transaction_id, article_id, quantity) VALUES (?, ?, ?, ?)');
    const staleTransactionsStmt = db.prepare(`SELECT id from transactions where id not in (${txns.map(t => "?").join(",")})`);
    const bulk = db.transaction((transactionsInner: Required<Transaction>[]) => {
        for (const transaction of transactionsInner) {
            const {id, options, date, orders} = transaction;

            const existingTransaction = existsStmt.get(id);

            if (existingTransaction) {
                // Update the existing transaction
                updateStmt.run(date, options, id);
                deleteAllAssociatedOrdersStmt.run(id);
                logger.debug(`Transaction (${id}) updated successfully`);
            } else {
                // Create a new transaction
                createStmt.run(id, date, options);
                logger.debug(`New Transaction (${id}) created successfully`);
            }

            for (const order of orders) {
                createOrderStmt.run(order.id, id, order.articleId, order.quantity);
            }
            logger.debug(`Created order(s)`);
        }
    });
    const staleTransactions = staleTransactionsStmt.all(txns.map(t => t.id));
    staleTransactions.forEach(t => {
        logger.warn(`Transaction (${t.id}) not present on pushing client, might be stale`);
    })

    bulk(txns);
};
