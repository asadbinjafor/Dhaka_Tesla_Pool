import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import type { Relation } from 'typeorm';
import { User } from './user.entity.js';

@Entity({ name: 'driver_profiles', synchronize: false })
export class DriverProfile {
  @PrimaryColumn({ name: 'user_id', type: 'uuid' }) userId!: string;
  @Column({ type: 'text', default: 'DRIVER' }) role!: 'DRIVER';
  @Column({ type: 'boolean', default: false }) online!: boolean;
  @OneToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn([{ name: 'user_id', referencedColumnName: 'id' }, { name: 'role', referencedColumnName: 'role' }]) user!: Relation<User>;
}
