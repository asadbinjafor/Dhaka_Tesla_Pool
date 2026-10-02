import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import type { Relation } from 'typeorm';
import { DriverProfile } from './driver-profile.entity.js';

@Entity({ name: 'vehicles', synchronize: false })
export class Vehicle {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'driver_id', type: 'uuid', unique: true }) driverId!: string;
  @Column({ name: 'display_name', type: 'text' }) displayName!: string;
  @Column({ type: 'integer' }) capacity!: number;
  @OneToOne(() => DriverProfile, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'driver_id', referencedColumnName: 'userId' }) driver!: Relation<DriverProfile>;
}
