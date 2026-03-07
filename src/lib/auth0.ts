import { Auth0Client } from "@auth0/nextjs-auth0/server";

export const auth0 = new Auth0Client({
    // The SDK will automatically use environment variables if not provided here,
    // but we can be explicit if we want to map from different names.
    // v4 uses: AUTH0_DOMAIN, AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET, AUTH0_SECRET
});
