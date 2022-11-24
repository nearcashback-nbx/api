import { UserEntity } from "../user/entity";
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { ReceiptStatus } from "./types";
import { CashbackCurrency } from "../../core/enums";
import { getExchangeRateByCurrency } from "../../utils";
import { IComissionRate } from "../../core/types";
import * as naj from "near-api-js";

const substringBetweenCharacters = (
  source: string,
  left: string,
  right: string
): string | null => {
  const leftIndex = source.lastIndexOf(left);
  const rightIndex = source.lastIndexOf(right);

  if (leftIndex >= rightIndex) return null;

  const res = source.substring(leftIndex + 1, rightIndex);

  if (!res) return null;

  return res;
};

@Entity("receipts")
export class ReceiptEntity {
  @PrimaryGeneratedColumn("uuid")
  public readonly id: string;

  @Column({ type: "uuid", nullable: false })
  public readonly owner_user_id: string;

  @Index({ unique: true })
  @Column({ type: "varchar", nullable: false })
  public readonly data: string;

  @Column({ type: "varchar", nullable: true })
  public readonly capture_url: string | null;

  @Column({ type: "varchar", nullable: false, default: ReceiptStatus.PENDING })
  public readonly status: ReceiptStatus;

  @UpdateDateColumn()
  public readonly updated_at: Date;

  @CreateDateColumn()
  public readonly created_at: Date;

  /**
   * Relations
   */
  @JoinColumn({ name: "owner_user_id", referencedColumnName: "id" })
  @ManyToOne(() => UserEntity, (user) => user.receipts, {
    onDelete: "NO ACTION",
  })
  owner: Promise<UserEntity>;

  /**
   * Getters
   */
  public get amount(): string {
    const parts = this.data.split(";");

    const taxString = parts[3];

    const amount = substringBetweenCharacters(taxString, "^", ":");

    if (amount === null) throw new Error(`No amount found`);

    return amount;
  }

  public get floatAmount(): number {
    const num = parseFloat(this.amount);

    if (num > 0) return num;

    throw new Error(`Unexpected amount`);
  }

  public get currency(): CashbackCurrency {
    return CashbackCurrency.EUR;
  }

  public get cashbackAmountYoctoNear(): string {
    const exchangeRate = getExchangeRateByCurrency(this.currency);

    const comissionRate: IComissionRate = {
      nominator: 1,
      denominator: 100,
    };

    const cashbackAmountInNear =
      (this.floatAmount / exchangeRate) *
      (comissionRate.nominator / comissionRate.denominator);

    const yoctoNear = naj.utils.format.parseNearAmount(
      cashbackAmountInNear.toString()
    );

    if (!yoctoNear) throw new Error(`No yoctoNear value`);

    return yoctoNear;
  }

  /**
   * Actions
   */
}
