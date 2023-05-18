import type {RequestHandler} from './$types';
import {deleteArticleDB} from "$lib/server/database";


export const POST = (async ({request, locals}) => {
    const data = await request.json();
    if (!data?.id) {
        return new Response(null, {status: 400, statusText: "no-id"});
    }

    if (!deleteArticleDB(locals.db, data.id)) {
        return new Response(null, {status: 400, statusText: "non-existent"});
    }

    return new Response(undefined, {headers: [["Content-Type", "application/json"]]});
}) satisfies RequestHandler;
