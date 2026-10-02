import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import type { Relation } from 'typeorm';
import { User } from '../../auth/entities/user.entity.js';
import { RideRequest } from '../../rides/entities/ride-request.entity.js';
import { RidePool } from '../../pools/entities/pool.entity.js';

@Entity({ name: 'ride_events', synchronize: false })
export class RideEvent {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'ride_request_id', type: 'uuid', nullable: true }) rideRequestId!: string | null;
  @Column({ name: 'pool_id', type: 'uuid', nullable: true }) poolId!: string | null;
  @Column({ name: 'actor_id', type: 'uuid' }) actorId!: string;
  @Column({ name: 'event_type', type: 'text' }) eventType!: string;
  @Column({ name: 'from_state', type: 'text', nullable: true }) fromState!: string | null;
  @Column({ name: 'to_state', type: 'text' }) toState!: string;
  @Column({ name: 'request_version', type: 'integer', nullable: true }) requestVersion!: number | null;
  @Column({ name: 'pool_version', type: 'integer', nullable: true }) poolVersion!: number | null;
  @Column({ name: 'recorded_at', type: 'timestamptz', default: () => 'clock_timestamp()', update: false }) recordedAt!: Date;
  @ManyToOne(() => User) @JoinColumn({ name: 'actor_id' }) actor!: Relation<User>;
  @ManyToOne(() => RideRequest, { nullable: true }) @JoinColumn({ name: 'ride_request_id' }) request!: Relation<RideRequest> | null;
  @ManyToOne(() => RidePool, { nullable: true }) @JoinColumn({ name: 'pool_id' }) pool!: Relation<RidePool> | null;
}
