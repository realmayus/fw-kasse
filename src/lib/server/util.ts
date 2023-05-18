export const checkInput = (input: any, requiredKeys: string[], validator: {[key: string]: (arg0: any) => boolean | string | Response}): Response | true => {
    for (const key of requiredKeys) {
        if (!(key in input) || input[key] == null ) {
            return new Response(JSON.stringify({error: `${key}-not-specified`}), {status: 400});
        }
        if (key in validator) {
            const res = validator[key](input[key]);
            if (typeof res === "string") {
                return new Response(JSON.stringify({error: `${key}-${res}`}), {status: 400});
            } else if (typeof res === "boolean" && !res) {
                return new Response(JSON.stringify({error: `${key}-invalid`}), {status: 400});
            } else if (typeof res === "object" && "statusText" in res) {  // Response
                return res;
            }
        }
    }
    return true;
};
