declare module "google-auth-library" {
  export class OAuth2Client {
    constructor(clientId?: string, clientSecret?: string, redirectUri?: string);
    verifyIdToken(options: {
      idToken: string;
      audience?: string | string[];
    }): Promise<{
      getPayload: () =>
        | {
            sub: string;
            email?: string;
            name?: string;
            picture?: string;
          }
        | undefined;
    }>;
  }
}
