import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import type { Relation } from 'typeorm';
import { User } from './user.entity.js';

@Entity({ name: 'sessions', synchronize: false })
export class AuthSession {
  @PrimaryColumn({ name: 'token_hash', type: 'text' }) tokenHash!: string;
  @Column({ name: 'user_id', type: 'uuid', nullable: true }) userId!: string | null;
  @Column({ name: 'csrf_token', type: 'text', select: false }) csrfToken!: string;
  @Column({ name: 'expires_at', type: 'timestamptz' }) expiresAt!: Date;
  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'clock_timestamp()', update: false }) createdAt!: Date;
  @ManyToOne(() => User, { nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'user_id' }) user!: Relation<User> | null;
}
