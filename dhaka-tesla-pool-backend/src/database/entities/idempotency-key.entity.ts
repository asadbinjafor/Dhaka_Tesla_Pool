import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import type { Relation } from 'typeorm';
import { User } from '../../auth/entities/user.entity.js';
import type { Receipt } from '../../common/command.js';

@Entity({ name: 'idempotency_keys', synchronize: false })
export class IdempotencyKey {
  @PrimaryColumn({ name: 'actor_id', type: 'uuid' }) actorId!: string;
  @PrimaryColumn({ name: 'action_scope', type: 'text' }) actionScope!: string;
  @PrimaryColumn({ type: 'uuid' }) key!: string;
  @Column({ name: 'target_ref', type: 'text' }) targetRef!: string;
  @Column({ name: 'request_hash', type: 'text' }) requestHash!: string;
  @Column({ type: 'jsonb', nullable: true }) receipt!: Receipt | null;
  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'clock_timestamp()', update: false }) createdAt!: Date;
  @ManyToOne(() => User) @JoinColumn({ name: 'actor_id' }) actor!: Relation<User>;
}
