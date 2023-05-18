import type {RequestHandler} from './$types';
import {bulkCreateTransactionDB, existsArticleDB} from "$lib/server/database";
import type {Order, Transaction} from "$lib/types";
import {checkInput} from "$lib/server/util";

export const POST = (async ({request, locals}) => {
    const data = await request.json();
    for (const txn of data) {
        const validate = checkInput(txn, ["date", "options", "orders"], {
            date: x => !!new Date(x),
            options: x => !isNaN(x),
            orders: x => Array.isArray(x) && x.reduce((acc, y) => acc && checkInput(y, ["articleId", "quantity"], {
                quantity: z => z > 0,
                articleId: aid => existsArticleDB(locals.db, aid),
            }) === true, true),
        });
        if (validate !== true) {
            return validate;
        }
    }


    const transactions: Required<Transaction>[] = data.map((d: Transaction) => ({
        date: new Date(),
        options: 0,
        orders: d.orders.map((o: Order) => {
            o.id = crypto.randomUUID();
            return o;
        }),
        id: crypto.randomUUID()
    }));
    bulkCreateTransactionDB(locals.db, transactions);
    return new Response("ok", {headers: [["Content-Type", "application/json"]]});
}) satisfies RequestHandler;
