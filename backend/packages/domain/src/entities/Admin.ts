// @max-lines 200 — this is enforced by the lint pipeline.
import { EmailVO } from "../value-objects/EmailVO.js";

export type AdminRole = "admin" | "super_admin";

export interface AdminProps {
  readonly id: string;
  readonly email: EmailVO;
  readonly passwordHash: string;
  readonly role: AdminRole;
  readonly createdAt: Date;
  readonly lastLoginAt: Date | null;
}

export interface CreateAdminInput {
  readonly id: string;
  readonly email: string;
  readonly passwordHash: string;
  readonly role: AdminRole;
}

/** Admin user entity. Constructed only via static factory. */
export class Admin {
  private readonly props: AdminProps;

  private constructor(props: AdminProps) {
    this.props = props;
  }

  static create(input: CreateAdminInput): Admin {
    return new Admin({
      id: input.id,
      email: EmailVO.create(input.email),
      passwordHash: input.passwordHash,
      role: input.role,
      createdAt: new Date(),
      lastLoginAt: null,
    });
  }

  static reconstitute(props: AdminProps): Admin {
    return new Admin(props);
  }

  get id(): string {
    return this.props.id;
  }
  get email(): EmailVO {
    return this.props.email;
  }
  get passwordHash(): string {
    return this.props.passwordHash;
  }
  get role(): AdminRole {
    return this.props.role;
  }
  get createdAt(): Date {
    return this.props.createdAt;
  }
  get lastLoginAt(): Date | null {
    return this.props.lastLoginAt;
  }
}
