# ADR-006: RS256 for JWT Signing

## Status

Accepted

## Context

The platform uses JWT access tokens for authenticating admin users. Tokens are
issued by `admin-service` and must be verifiable by any service that receives
them (currently `product-service` for admin mutations, `admin-service` for
protected routes).

Two main signing algorithm families for JWTs:

1. **HS256 (HMAC-SHA256)** — symmetric: same secret used to sign and verify.
2. **RS256 (RSA-SHA256)** — asymmetric: private key signs, public key verifies.
3. **ES256 (ECDSA-SHA256)** — asymmetric: smaller keys than RSA, similar security.

## Decision

Use **RS256** with a 2048-bit RSA key pair. The private key is loaded from a
file path specified by `JWT_PRIVATE_KEY_PATH` and never leaves `admin-service`.
The public key is distributed to any service that needs to verify tokens via
`JWT_PUBLIC_KEY_PATH`.

## Rationale

### Why RS256 over HS256

**Key distribution.** With HS256, every service that verifies tokens must have
the shared secret. If any service is compromised, the attacker can forge tokens
for any user. With RS256, only `admin-service` holds the private key. Other
services receive only the public key, which cannot be used to forge tokens.

**Principle of least privilege.** A service that only needs to verify tokens
(e.g., `product-service` checking admin mutations) should not have the ability
to issue tokens. RS256 enforces this at the cryptographic level.

**Auditability.** With asymmetric keys, it is unambiguous which service issued
a token — only the holder of the private key could have signed it.

### Why RS256 over ES256

Both provide asymmetric signing. RS256 was chosen because:

- `jsonwebtoken` (the npm package used) has mature, well-tested RS256 support.
- RSA 2048-bit keys are universally supported across all JWT libraries and
  infrastructure tools (API gateways, load balancers, monitoring tools).
- ES256 offers smaller key sizes but the operational benefit is negligible at
  this scale.

RS256 can be replaced with ES256 in the future without changing the application
logic — only the key generation and `algorithms` option change.

## Implementation Details

### Key generation (one-time setup)

```bash
# Generate private key
openssl genrsa -out secrets/jwt.private.pem 2048

# Extract public key
openssl rsa -in secrets/jwt.private.pem -pubout -out secrets/jwt.public.pem
```

### Token structure

```json
{
  "sub": "<adminId>",
  "role": "admin",
  "iat": 1700000000,
  "exp": 1700000900
}
```

- `sub` — admin UUID (used to look up the admin in the database).
- `role` — checked by `requireAdmin` middleware.
- `exp` — 15 minutes from issue time (`JWT_ACCESS_TOKEN_EXPIRY=15m`).

### Verification

```typescript
jwt.verify(token, publicKey, { algorithms: ["RS256"] })
```

The `algorithms` array is explicitly set to `["RS256"]` to prevent algorithm
confusion attacks (where an attacker changes the `alg` header to `none` or
`HS256` with the public key as the HMAC secret).

### Refresh token strategy

Access tokens are short-lived (15 min). Refresh tokens are:

- Random 32-byte hex strings (not JWTs).
- Stored as SHA-256 hashes in PostgreSQL (`refresh_tokens` table).
- Organised into families to detect token reuse attacks.
- On reuse detection: entire family is revoked immediately.

This means a stolen refresh token can only be used once before the theft is
detected and all sessions for that admin are invalidated.

## Consequences

### Positive

- Private key never leaves `admin-service` — compromise of other services
  cannot be used to forge tokens.
- Public key can be safely distributed to any service or infrastructure tool.
- Algorithm confusion attacks are prevented by explicit `algorithms` allowlist.
- Short-lived access tokens limit the window of exposure for stolen tokens.
- Refresh token rotation with family revocation limits the damage from
  refresh token theft.

### Negative

- Key management overhead — RSA key pair must be generated, stored securely,
  and rotated periodically.
- Slightly larger token size compared to HS256 (RSA signature is 256 bytes).
- Key rotation requires restarting `admin-service` to load the new private key.

### Mitigation

- Keys are loaded from file paths in environment variables — rotation is a
  file swap + restart, no code change required.
- In production, keys should be stored in a secrets manager (AWS Secrets
  Manager, HashiCorp Vault) and injected at runtime.
- The `secrets/` directory is in `.gitignore` — keys are never committed.

## References

- [RFC 7518: JSON Web Algorithms](https://www.rfc-editor.org/rfc/rfc7518)
- [Algorithm Confusion Attacks on JWT](https://portswigger.net/web-security/jwt/algorithm-confusion)
- [jsonwebtoken npm package](https://github.com/auth0/node-jsonwebtoken)
