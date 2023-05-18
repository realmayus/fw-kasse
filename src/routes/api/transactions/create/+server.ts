import type {RequestHandler} from './$types';
import {createTransactionDB, existsArticleDB} from "$lib/server/database";
import type {Transaction} from "$lib/types";
import {checkInput} from "$lib/server/util";

export const POST = (async ({request, locals}) => {
    const data = await request.json();
    const validate = checkInput(data, ["date", "options", "orders"], {
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

    const id = crypto.randomUUID();
    const transaction: Required<Transaction> = {
        date: new Date(), options: 0, orders: data.orders.map((o: { id: string; }) => {
            o.id = crypto.randomUUID();
            return o;
        }), id
    };
    createTransactionDB(locals.db, transaction);
    return new Response("ok", {headers: [["Content-Type", "application/json"]]});
}) satisfies RequestHandler;
