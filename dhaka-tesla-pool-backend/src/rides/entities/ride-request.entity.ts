import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import type { Relation } from 'typeorm';
import { TripColumns } from '../../database/entities/trip-columns.js';
import { User } from '../../auth/entities/user.entity.js';
import { FareQuote } from './fare-quote.entity.js';
import { Zone } from './zone.entity.js';

@Entity({ name: 'ride_requests', synchronize: false })
export class RideRequest extends TripColumns {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'passenger_id', type: 'uuid' }) passengerId!: string;
  @Column({ name: 'quote_id', type: 'uuid', unique: true }) quoteId!: string;
  @Column({ name: 'booking_snapshot', type: 'jsonb' }) bookingSnapshot!: Record<string, unknown>;
  @Column({ name: 'destination_id', type: 'text' }) destinationId!: string;
  @Column({ type: 'integer' }) seats!: number;
  @Column({ name: 'final_fare_snapshot', type: 'jsonb', nullable: true }) finalFareSnapshot!: Record<string, unknown> | null;
  @Column({ name: 'finalized_at', type: 'timestamptz', nullable: true }) finalizedAt!: Date | null;
  @Column({ name: 'matched_at', type: 'timestamptz', nullable: true }) matchedAt!: Date | null;
  @ManyToOne(() => User) @JoinColumn({ name: 'passenger_id' }) passenger!: Relation<User>;
  @OneToOne(() => FareQuote, { onDelete: 'RESTRICT' })
  @JoinColumn([{ name: 'quote_id', referencedColumnName: 'id' }, { name: 'passenger_id', referencedColumnName: 'ownerId' }]) quote!: Relation<FareQuote>;
  @ManyToOne(() => Zone) @JoinColumn({ name: 'pickup_id' }) pickup!: Relation<Zone>;
  @ManyToOne(() => Zone) @JoinColumn({ name: 'destination_id' }) destination!: Relation<Zone>;
}
