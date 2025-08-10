// Convex auth configuration for Clerk JWTs
// Docs: https://docs.convex.dev/auth/clerk

export default {
  providers: [
    {
      domain: "https://merry-feline-10.clerk.accounts.dev",
      applicationID: "convex", // must match the JWT aud claim
    },
  ],
}


