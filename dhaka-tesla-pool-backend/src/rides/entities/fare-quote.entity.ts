import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import type { Relation } from 'typeorm';
import { FareBasis } from '../../database/entities/fare-basis.js';
import { User } from '../../auth/entities/user.entity.js';
import { RouteRule } from './route-rule.entity.js';
import { Zone } from './zone.entity.js';

@Entity({ name: 'fare_quotes', synchronize: false })
export class FareQuote extends FareBasis {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'owner_id', type: 'uuid' }) ownerId!: string;
  @Column({ name: 'route_id', type: 'uuid' }) routeId!: string;
  @Column({ type: 'integer' }) seats!: number;
  @Column({ type: 'text', default: 'BDT' }) currency!: 'BDT';
  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'clock_timestamp()', update: false }) createdAt!: Date;
  @Column({ name: 'expires_at', type: 'timestamptz' }) expiresAt!: Date;
  @ManyToOne(() => User) @JoinColumn({ name: 'owner_id' }) owner!: Relation<User>;
  @ManyToOne(() => RouteRule) @JoinColumn({ name: 'route_id' }) route!: Relation<RouteRule>;
  @ManyToOne(() => Zone) @JoinColumn({ name: 'pickup_id' }) pickup!: Relation<Zone>;
  @ManyToOne(() => Zone) @JoinColumn({ name: 'destination_id' }) destination!: Relation<Zone>;
}
