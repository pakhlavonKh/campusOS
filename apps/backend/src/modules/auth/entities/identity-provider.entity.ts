import { Entity, Column, Index } from 'typeorm';
import { PlatformEntity } from '../../../shared/entities/base.entity';

/**
 * IdentityProvider — SSO/LDAP/SAML provider configuration per organization.
 * SDD §3.2.1 — pluggable identity provider integration.
 * SRS §5.1 — supports SSO, LDAP, SAML, and OAuth.
 */
@Entity('identity_providers')
@Index(['organizationId', 'protocol'], { unique: true })
export class IdentityProvider extends PlatformEntity {
  @Column({ name: 'organization_id', type: 'uuid' })
  organizationId!: string;

  @Column({ type: 'varchar', length: 50 })
  protocol!: 'saml' | 'ldap' | 'oidc' | 'oauth2';

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  /** Stores protocol-specific config: entityId, ssoUrl, certificate, clientId, etc. */
  @Column({ type: 'jsonb', default: '{}' })
  config!: Record<string, any>;

  @Column({ name: 'is_enabled', type: 'boolean', default: false })
  isEnabled!: boolean;

  /** If true, all users in this org are redirected to this provider for login */
  @Column({ name: 'enforce_sso', type: 'boolean', default: false })
  enforceSso!: boolean;

  @Column({ name: 'attribute_mapping', type: 'jsonb', default: '{}' })
  attributeMapping!: {
    email?: string;
    firstName?: string;
    lastName?: string;
    role?: string;
    [key: string]: string | undefined;
  };
}

/**
 * Invitation — pending invite for a user to join an organization/branch.
 * SDD §3.2.1 — invitation flow: email/SMS invite → registration.
 * SRS §5.1 — invitation flows.
 */
@Entity('invitations')
@Index(['token'], { unique: true })
@Index(['email', 'organizationId'])
export class Invitation extends PlatformEntity {
  @Column({ name: 'organization_id', type: 'uuid' })
  organizationId!: string;

  @Column({ name: 'branch_id', type: 'uuid', nullable: true })
  branchId!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email!: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  phone!: string | null;

  /** The role to assign upon acceptance */
  @Column({ name: 'role_id', type: 'uuid', nullable: true })
  roleId!: string | null;

  /** Secure random token sent via email/SMS */
  @Column({ type: 'varchar', length: 128, unique: true })
  token!: string;

  @Column({ name: 'invited_by', type: 'uuid' })
  invitedBy!: string;

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt!: Date;

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status!: 'pending' | 'accepted' | 'expired' | 'revoked';

  @Column({ name: 'accepted_at', type: 'timestamptz', nullable: true })
  acceptedAt!: Date | null;

  @Column({ name: 'accepted_by_user_id', type: 'uuid', nullable: true })
  acceptedByUserId!: string | null;
}
