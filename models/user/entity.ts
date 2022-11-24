import { ReceiptEntity } from "../receipt/entity";
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { UserProviderType } from "./types";

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn("uuid")
  public readonly id: string;

  @Column({ type: "varchar", nullable: false })
  public readonly provider_id: string;

  @Column({ type: "varchar", nullable: false })
  public readonly provider_type: UserProviderType;

  @Column({ type: "varchar", nullable: false })
  public readonly email: string;

  @Column({ type: "varchar", nullable: false })
  public readonly display_name: string;

  @Column({ type: "varchar", nullable: false })
  public readonly avatar_url: string;

  @Column({
    type: "numeric",
    nullable: false,
    default: 0,
    precision: 45,
    scale: 0,
  })
  public readonly pending_balance: string;

  @Column({
    type: "numeric",
    nullable: false,
    default: 0,
    precision: 45,
    scale: 0,
  })
  public readonly available_balance: string;

  @UpdateDateColumn()
  public readonly updated_at: Date;

  @CreateDateColumn()
  public readonly created_at: Date;

  /**
   * Relations
   */
  @OneToMany(() => ReceiptEntity, (receipt) => receipt.owner)
  receipts: Promise<ReceiptEntity[]>;

  /**
   * Getters
   */
  public get totalBalance(): string {
    /** @todo calculate with BN.js */
    return "0";
  }

  /**
   * Actions
   */
}
