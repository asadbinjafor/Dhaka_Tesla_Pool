import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'zones', synchronize: false })
export class Zone {
  @PrimaryColumn({ type: 'text' }) id!: string;
  @Column({ name: 'label_en', type: 'text' }) labelEn!: string;
  @Column({ name: 'label_bn', type: 'text' }) labelBn!: string;
}
