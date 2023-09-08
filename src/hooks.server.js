import { PUBLIC_API_URL, PUBLIC_DEFAULT_THEME } from '$env/static/public';
import { redirect } from "@sveltejs/kit";

/** @type {import('@sveltejs/kit').Handle} */
export const handle = async ({ event, resolve }) => {

  let theme = event.cookies.get("theme");

  if(!theme) {
    theme = "black";
  }
  if(PUBLIC_DEFAULT_THEME != theme) {
    theme = PUBLIC_DEFAULT_THEME;
  }

  const response = await resolve(event, {
    transformPageChunk: ({ html }) =>
      html.replace('class=""', `class="${theme}"`),
  });

  return response;
};

/** @type {import('@sveltejs/kit').HandleFetch} */
export async function handleFetch({ request, fetch, event: { cookies } }) {
  if (request.url.startsWith(PUBLIC_API_URL)) {
    // clone the original request, but change the URL
    request.headers.set('Authorization', `Bearer ${cookies.get('token')}`);

  }
 
  return fetch(request);
}
