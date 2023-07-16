/** @type {import('@sveltejs/kit').ParamMatcher} */
export function match(param) {
  return /^((?!http[s]?:\/\/)[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+|[a-zA-Z0-9-]+:[0-9]+)$/.test(param);

    //return /^((?!-)[A-Za-z0-9-]{1,63}(?<!-)\.)+[A-Za-z]{2,6}$/.test(param);
  //return /^([a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*|[a-zA-Z0-9-]+:[0-9]+)?$/.test(param);
}
