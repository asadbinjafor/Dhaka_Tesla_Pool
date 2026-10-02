import { Column } from 'typeorm';

// Shared immutable columns, not a separate table. SQL migrations own constraints.
export abstract class FareBasis {
  @Column({ name: 'pickup_id', type: 'text' }) pickupId!: string;
  @Column({ name: 'destination_id', type: 'text' }) destinationId!: string;
  @Column({ name: 'group_id', type: 'text' }) groupId!: string;
  @Column({ name: 'group_version', type: 'integer' }) groupVersion!: number;
  @Column({ name: 'demo_distance_m', type: 'integer' }) demoDistanceM!: number;
  @Column({ name: 'base_poysha', type: 'integer' }) basePoysha!: number;
  @Column({ name: 'rate_poysha', type: 'integer' }) ratePoysha!: number;
  @Column({ name: 'discount_poysha', type: 'integer' }) discountPoysha!: number;
  @Column({ name: 'policy_version', type: 'text' }) policyVersion!: string;
}
