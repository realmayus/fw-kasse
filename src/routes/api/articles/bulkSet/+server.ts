import type {RequestHandler} from './$types';
import {bulkSetArticleDB} from "$lib/server/database";
import type {Article} from "$lib/types";
import {checkInput} from "$lib/server/util";


export const POST = (async ({request, locals}) => {
    const data = await request.json();
    for (const articleData of data) {
        const validate = checkInput(articleData, ["name", "price"], {
            name: x => x.length > 0 && x.length < 50,
            price: x => x > 0,
        });

        if (validate !== true) {
            return validate;
        }
    }


    const articles: Required<Article>[] = data.map((a: Article) => ({id: a.id || crypto.randomUUID(), name: a.name, price: a.price}));
    bulkSetArticleDB(locals.db, articles);
    return new Response(JSON.stringify(articles), {headers: [["Content-Type", "application/json"]]});
}) satisfies RequestHandler;
