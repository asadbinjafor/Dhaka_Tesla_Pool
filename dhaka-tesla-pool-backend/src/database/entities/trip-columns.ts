import { Column } from 'typeorm';

export abstract class TripColumns {
  @Column({ name: 'pickup_id', type: 'text' }) pickupId!: string;
  @Column({ name: 'group_id', type: 'text' }) groupId!: string;
  @Column({ name: 'group_version', type: 'integer' }) groupVersion!: number;
  @Column({ type: 'text' }) status!: string;
  @Column({ type: 'integer', default: 1 }) version!: number;
  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'clock_timestamp()', update: false }) createdAt!: Date;
  @Column({ name: 'arrived_at', type: 'timestamptz', nullable: true }) arrivedAt!: Date | null;
  @Column({ name: 'started_at', type: 'timestamptz', nullable: true }) startedAt!: Date | null;
  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true }) completedAt!: Date | null;
  @Column({ name: 'cancelled_at', type: 'timestamptz', nullable: true }) cancelledAt!: Date | null;
  @Column({ name: 'cancellation_reason', type: 'text', nullable: true }) cancellationReason!: string | null;
  @Column({ name: 'ended_at', type: 'timestamptz', nullable: true, asExpression: 'COALESCE(completed_at,cancelled_at)', generatedType: 'STORED', insert: false, update: false }) endedAt!: Date | null;
}
