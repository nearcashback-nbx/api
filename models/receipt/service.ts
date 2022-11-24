import { UserEntity } from "models/user/entity";
import { EntityManager } from "typeorm";
import AppDataSource from "../../db";
import { ReceiptEntity } from "./entity";
import { ReceiptStatus } from "./types";

const repo = AppDataSource.getRepository(ReceiptEntity);

export class ReceiptService {
  public static insertReceiptByDataInTransaction = async (
    transactionalManager: EntityManager,
    data: string,
    owner: UserEntity
  ): Promise<ReceiptEntity> => {
    const dto = repo.create({
      owner_user_id: owner.id,
      data: data,
      capture_url: null,
      status: ReceiptStatus.PENDING,
    });

    try {
      return transactionalManager.save(dto);
    } catch (err) {
      console.error(`Couldn't insert receipt - ${err}`);

      throw new Error(`Failed to insert receipt`);
    }
  };

  public static setCaptureUrlForReceipt = async (
    receipt: ReceiptEntity,
    url: string
  ): Promise<void> => {
    if (receipt.capture_url)
      throw new Error(
        `Cannot set new capture url to receipt, because it already has`
      );

    /** @todo set capture_url to entity */

    await repo.update(
      {
        id: receipt.id,
      },
      {
        capture_url: url,
      }
    );
  };

  public static verifyReceiptInTransaction = async (
    transactionManager: EntityManager,
    receipt: ReceiptEntity
  ): Promise<void> => {
    /** @todo set status to entity */

    await transactionManager.update(
      ReceiptEntity,
      {
        id: receipt.id,
      },
      {
        status: ReceiptStatus.VERIFIED,
      }
    );
  };

  public static findReceiptById = async (
    id: string
  ): Promise<ReceiptEntity | null> => {
    const receipt = await repo.findOne({
      where: {
        id: id,
      },
    });

    if (!receipt) return null;

    return receipt;
  };
}
