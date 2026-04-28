# ADR-002: UUIDv7 for Primary Keys

## Status

Accepted

## Context

The database schema requires globally unique identifiers for all entities. We need to choose a primary key strategy that provides uniqueness, performance, and sortability.

Options considered:
1. **Auto-incrementing integers** — sequential numeric IDs
2. **UUIDv4** — random 128-bit identifiers
3. **UUIDv7** — time-ordered 128-bit identifiers
4. **ULID** — lexicographically sortable identifiers

## Decision

We will use **UUIDv7** as the primary key type for all database tables, using PostgreSQL 18.1+ native `gen_random_uuid_v7()` function.

## Rationale

### Why UUIDv7 over auto-incrementing integers:

1. **Global uniqueness** — IDs are unique across tables, databases, and services without coordination
2. **No enumeration attacks** — sequential IDs expose record count and allow enumeration
3. **Distributed system friendly** — IDs can be generated independently by multiple services
4. **Merge-friendly** — no ID conflicts when merging data from different sources

### Why UUIDv7 over UUIDv4:

1. **Time-ordered** — UUIDv7 embeds a timestamp, providing natural chronological sorting
2. **Better index performance** — time-ordered inserts reduce B-tree fragmentation
3. **Improved query performance** — range queries on recent data are more efficient
4. **Debuggability** — timestamp prefix makes IDs human-readable for debugging

### Why UUIDv7 over ULID:

1. **Native PostgreSQL support** — PostgreSQL 18.1+ has built-in `gen_random_uuid_v7()`
2. **Standard UUID type** — uses native `UUID` column type, no custom encoding
3. **No external dependencies** — no need for application-level ID generation libraries
4. **RFC 9562 standard** — official UUID specification

## Implementation Details

- **PostgreSQL version**: 18.1+ required for native `gen_random_uuid_v7()` support
- **Column type**: `UUID PRIMARY KEY DEFAULT gen_random_uuid_v7()`
- **Format**: 128-bit UUID with embedded Unix timestamp (millisecond precision)
- **Sortability**: Lexicographically sortable by creation time
- **Uniqueness**: Cryptographically random suffix ensures collision resistance

### UUIDv7 Structure:
```
 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                           unix_ts_ms                          |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|          unix_ts_ms           |  ver  |       rand_a          |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|var|                        rand_b                             |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                            rand_b                             |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
```

## Consequences

### Positive:

- Natural chronological ordering without separate `created_at` index
- Better B-tree index performance compared to random UUIDs
- No coordination required for ID generation across services
- Security: no information leakage about record count
- Future-proof: works seamlessly in distributed/microservices architecture

### Negative:

- Larger storage (16 bytes) compared to integers (4-8 bytes)
- Slightly slower joins compared to integer keys
- Requires PostgreSQL 18.1+ (released 2024)

### Mitigation:

- Storage cost is negligible with modern hardware
- Index performance gains offset join overhead
- PostgreSQL 18.1+ is production-ready and widely available

## Migration Path

For existing systems using older PostgreSQL versions:
1. Use `pg_uuidv7` extension as a temporary solution
2. Upgrade to PostgreSQL 18.1+ to use native function
3. No schema changes required — both use the same UUID format

## References

- [RFC 9562: UUIDv7 Specification](https://www.rfc-editor.org/rfc/rfc9562.html)
- [PostgreSQL 18.1 Release Notes](https://www.postgresql.org/docs/18/release-18-1.html)
- [UUIDv7 Performance Analysis](https://www.cybertec-postgresql.com/en/uuid-serial-or-identity-columns-for-postgresql-auto-generated-primary-keys/)
