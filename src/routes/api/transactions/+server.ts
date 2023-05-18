import type { RequestHandler } from './$types';
import {getTransactionsDB} from "$lib/server/database";

export const GET = (async ({locals}) => {
    const transactions = getTransactionsDB(locals.db);
    return new Response(JSON.stringify([...transactions]), {headers: [["Content-Type", "application/json"]]});
}) satisfies RequestHandler;
