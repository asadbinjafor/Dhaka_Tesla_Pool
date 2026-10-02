import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import type { Relation } from 'typeorm';
import { RideRequest } from '../../rides/entities/ride-request.entity.js';
import { RidePool } from './pool.entity.js';

@Entity({ name: 'pool_memberships', synchronize: false })
export class PoolMembership {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'pool_id', type: 'uuid' }) poolId!: string;
  @Column({ name: 'ride_request_id', type: 'uuid', unique: true }) rideRequestId!: string;
  @Column({ name: 'joined_at', type: 'timestamptz', default: () => 'clock_timestamp()', update: false }) joinedAt!: Date;
  @ManyToOne(() => RidePool, { onDelete: 'RESTRICT' }) @JoinColumn({ name: 'pool_id' }) pool!: Relation<RidePool>;
  @OneToOne(() => RideRequest, { onDelete: 'RESTRICT' }) @JoinColumn({ name: 'ride_request_id' }) request!: Relation<RideRequest>;
}
