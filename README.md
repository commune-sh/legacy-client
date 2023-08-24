#### Commune Client
This is the frontend to the [Commune server](https://github.com/commune-os/commune-server). 

#### How to run
This is a standard sveltekit app and runs on Node, Cloudflare etc. Our main instance  [Shpong](https://shpong.com) is deployed to Cloudflare pages, directly from a mirror of this repository.

If you'd like to run it on a node server on a regular vps, you'll need to change the Sveltekit adapter. Follow instructions [here](https://kit.svelte.dev/docs/adapter-node).  

#### Config
The app requires some environment variables to be set. Add them in an `.env` file at the root if you're running this on Node. On Cloudflare/Vercel/etc, add the variables from the appropriate settings page.

```
PUBLIC_APP_NAME=Commune
PUBLIC_API_URL=https://api.commune.sh
PUBLIC_BASE_URL=https://commune.sh
PUBLIC_MEDIA_URL=https://static.commune.sh
PUBLIC_API_URL_WS=ws://api.commune.sh
PUBLIC_MATRIX_URL=https://matrix.commune.sh
PUBLIC_INDEX=true
PUBLIC_META_DESCRIPTION=Build new internet communities with Commune
PUBLIC_FAVICON=https://commune.sh/favicon.png #Optional custom location

PUBLIC_APP_NAME=Commune
PUBLIC_API_URL=https://api.commune.sh
PUBLIC_BASE_URL=http://commune.sh
PUBLIC_MEDIA_URL=https://static.commune.sh
PUBLIC_API_URL_WS=wss://api.commune.sj
PUBLIC_MATRIX_URL=https://matrix.commune.sh
PUBLIC_MATRIX_SERVER_NAME=commune.sh
PUBLIC_MATRIX_DELEGATION_SERVER=matrix.commune.sh:443
PUBLIC_INDEX=false
PUBLIC_META_TITLE=Commune
PUBLIC_META_DESCRIPTION=Build new internet communities with Commune
PUBLIC_META_IMAGE=http://static.commune.sh/logo.png
PUBLIC_FAVICON=http://static.commune.sh/favicon.png
PUBLIC_SIDEBAR_DESCRIPTION=Welcome to Commune

```

The values `PUBLIC_API_URL`, and `PUBLIC_API_URL_WS` should point to wherever you're hosting the Commune server. `PUBLIC_MEDIA_URL` is where your S3-compatible storage is located. (Cloudflare R2 in `commune.sh`'s case). `PUBLIC_MATRIX_URL` points to your Matrix homeserver or a proxy to it.
