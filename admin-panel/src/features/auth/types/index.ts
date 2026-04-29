export interface Session {
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly adminUser: {
    readonly id: string;
    readonly email: string;
    readonly role: string;
  };
}

export interface LoginCredentials {
  readonly email: string;
  readonly password: string;
}
