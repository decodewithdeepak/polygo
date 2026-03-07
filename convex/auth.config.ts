export default {
    providers: [
        {
            // Use the Auth0 Domain from environment variables
            domain: process.env.AUTH0_ISSUER_BASE_URL || "https://your-domain.auth0.com",
            applicationID: process.env.AUTH0_CLIENT_ID || "your_client_id_here",
        },
    ],
};
