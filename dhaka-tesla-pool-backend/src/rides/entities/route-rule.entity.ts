import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import type { Relation } from 'typeorm';
import { FareBasis } from '../../database/entities/fare-basis.js';
import { Zone } from './zone.entity.js';

@Entity({ name: 'route_rules', synchronize: false })
export class RouteRule extends FareBasis {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ type: 'boolean', default: true }) active!: boolean;
  @ManyToOne(() => Zone) @JoinColumn({ name: 'pickup_id' }) pickup!: Relation<Zone>;
  @ManyToOne(() => Zone) @JoinColumn({ name: 'destination_id' }) destination!: Relation<Zone>;
}
