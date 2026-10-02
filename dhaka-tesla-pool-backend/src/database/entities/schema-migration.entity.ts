import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'schema_migrations', synchronize: false })
export class SchemaMigration {
  @PrimaryColumn({ type: 'text' }) name!: string;
  @Column({ type: 'text' }) sha256!: string;
  @Column({ name: 'applied_at', type: 'timestamptz', default: () => 'clock_timestamp()', update: false }) appliedAt!: Date;
}
