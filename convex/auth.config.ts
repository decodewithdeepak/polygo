export default {
  providers: [
    {
      // Use the Auth0 Domain from environment variables.
      // Auth0 requires a trailing slash for the exact 'iss' claim validation!
      domain: `https://${process.env.NEXT_PUBLIC_AUTH0_DOMAIN}/`,
      applicationID: process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID as string,
    },
  ],
};
