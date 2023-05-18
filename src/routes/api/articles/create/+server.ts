import type {RequestHandler} from './$types';
import {createArticleDB} from "$lib/server/database";
import type {Article} from "$lib/types";
import {checkInput} from "$lib/server/util";


export const POST = (async ({request, locals}) => {
    const data = await request.json();

    const validate = checkInput(data, ["name", "price"], {
        name: x => x.length > 0 && x.length < 50,
        price: x => x > 0,
    });

    if (validate !== true) {
        return validate;
    }

    const id = crypto.randomUUID();
    const article: Required<Article> = {id, name: data.name, price: data.price};
    createArticleDB(locals.db, article);
    return new Response(JSON.stringify({article}), {headers: [["Content-Type", "application/json"]]});
}) satisfies RequestHandler;
