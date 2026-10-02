import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'users', synchronize: false })
export class User {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ type: 'text', unique: true }) email!: string;
  @Column({ name: 'display_name', type: 'text' }) displayName!: string;
  @Column({ name: 'password_hash', type: 'text', select: false }) passwordHash!: string;
  @Column({ type: 'text' }) role!: 'PASSENGER' | 'DRIVER';
  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'clock_timestamp()', update: false }) createdAt!: Date;
}
