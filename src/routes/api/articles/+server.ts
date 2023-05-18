import type { RequestHandler } from './$types';
import {getArticlesDB} from "$lib/server/database";


export const GET = (({locals}) => {
    const articles = getArticlesDB(locals.db);
    return new Response(JSON.stringify([...articles]), {headers: [["Content-Type", "application/json"]]});
}) satisfies RequestHandler;
