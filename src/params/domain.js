/** @type {import('@sveltejs/kit').ParamMatcher} */
export function match(param) {
    return /^((?!-)[A-Za-z0-9-]{1,63}(?<!-)\.)+[A-Za-z]{2,6}$/.test(param);
}
