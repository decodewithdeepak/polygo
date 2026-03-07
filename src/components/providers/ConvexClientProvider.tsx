"use client";

import { Auth0Provider } from "@auth0/auth0-react";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithAuth0 } from "convex/react-auth0";
import { ReactNode } from "react";
import UserStoreProvider from "./UserStoreProvider";

if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
    throw new Error("NEXT_PUBLIC_CONVEX_URL is not set");
}
if (!process.env.NEXT_PUBLIC_AUTH0_DOMAIN) {
    throw new Error("NEXT_PUBLIC_AUTH0_DOMAIN is not set");
}
if (!process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID) {
    throw new Error("NEXT_PUBLIC_AUTH0_CLIENT_ID is not set");
}

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL);

export default function ConvexClientProvider({
    children,
}: {
    children: ReactNode;
}) {
    return (
        <Auth0Provider
            domain={process.env.NEXT_PUBLIC_AUTH0_DOMAIN as string}
            clientId={process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID as string}
            authorizationParams={{
                redirect_uri: typeof window !== "undefined" ? window.location.origin : undefined,
            }}
            useRefreshTokens={true}
            cacheLocation="localstorage"
        >
            <ConvexProviderWithAuth0 client={convex}>
                <UserStoreProvider>{children}</UserStoreProvider>
            </ConvexProviderWithAuth0>
        </Auth0Provider>
    );
}
