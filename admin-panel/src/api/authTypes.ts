/** Login / refresh success envelope from the admin-service auth controller. */
export interface ApiSuccessTokenPair {
  readonly success: true;
  readonly data: {
    readonly accessToken: string;
    readonly refreshToken: string;
  };
}
