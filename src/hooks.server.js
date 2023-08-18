import { redirect } from "@sveltejs/kit";

/** @type {import('@sveltejs/kit').Handle} */
export const handle = async ({ event, resolve }) => {

  let theme = event.cookies.get("theme");

  if(!theme) {
    theme = "black";
  }

  const response = await resolve(event, {
    transformPageChunk: ({ html }) =>
      html.replace('class=""', `class="${theme}"`),
  });

  return response;
};
