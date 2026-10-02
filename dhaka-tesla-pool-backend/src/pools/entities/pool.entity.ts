import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import type { Relation } from 'typeorm';
import { TripColumns } from '../../database/entities/trip-columns.js';
import { DriverProfile } from '../../auth/entities/driver-profile.entity.js';
import { Vehicle } from '../../auth/entities/vehicle.entity.js';
import { Zone } from '../../rides/entities/zone.entity.js';

@Entity({ name: 'pools', synchronize: false })
export class RidePool extends TripColumns {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'driver_id', type: 'uuid' }) driverId!: string;
  @Column({ name: 'vehicle_id', type: 'uuid' }) vehicleId!: string;
  @Column({ name: 'capacity_snapshot', type: 'integer' }) capacitySnapshot!: number;
  @ManyToOne(() => DriverProfile) @JoinColumn({ name: 'driver_id', referencedColumnName: 'userId' }) driver!: Relation<DriverProfile>;
  @ManyToOne(() => Vehicle, { onDelete: 'RESTRICT' })
  @JoinColumn([{ name: 'vehicle_id', referencedColumnName: 'id' }, { name: 'driver_id', referencedColumnName: 'driverId' }]) vehicle!: Relation<Vehicle>;
  @ManyToOne(() => Zone) @JoinColumn({ name: 'pickup_id' }) pickup!: Relation<Zone>;
}
