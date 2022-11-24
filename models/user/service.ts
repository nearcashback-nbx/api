import { EntityManager } from "typeorm";
import AppDataSource from "../../db";
import { UserEntity } from "./entity";
import { IUserProvider } from "./types/provider.interface";

const repo = AppDataSource.getRepository(UserEntity);

export class UserService {
  public static findUserById = async (
    id: string
  ): Promise<UserEntity | null> => {
    const user = await repo.findOne({
      where: {
        id: id,
      },
    });

    if (!user) return null;

    return user;
  };

  public static findUserByProvider = async (
    provider: IUserProvider
  ): Promise<UserEntity | null> => {
    const user = await repo.findOne({
      where: {
        provider_id: provider.providerId,
        provider_type: provider.providerType,
      },
    });

    if (!user) return null;

    return user;
  };

  public static createUserByProvider = async (
    provider: IUserProvider
  ): Promise<UserEntity> => {
    const dto = repo.create({
      provider_id: provider.providerId,
      provider_type: provider.providerType,
      email: provider.email,
      display_name: provider.displayName,
      avatar_url: provider.avatarUrl,
      pending_balance: "0",
      available_balance: "0",
    });

    try {
      return repo.save(dto);
    } catch (err) {
      console.error(`Couldn't create new user - ${err}`);
      throw new Error(`Failed to create new user`);
    }
  };

  public static findOrCreateUserByProvider = async (
    provider: IUserProvider
  ): Promise<UserEntity> => {
    const existedUser = await this.findUserByProvider(provider);

    if (existedUser) return existedUser;

    return this.createUserByProvider(provider);
  };

  public static incrementPendingBalanceInTransaction = async (
    transactionalManager: EntityManager,
    user: UserEntity,
    amount: string
  ): Promise<void> => {
    await transactionalManager
      .createQueryBuilder(UserEntity, "users")
      .update(UserEntity)
      .where(`id = :id`)
      .setParameter("id", user.id)
      .set({
        pending_balance: () => "pending_balance + :amount",
      })
      .setParameter("amount", amount)
      .execute();
  };

  public static decrementPendingBalanceInTransaction = async (
    transactionalManager: EntityManager,
    user: UserEntity,
    amount: string
  ): Promise<void> => {
    await transactionalManager
      .createQueryBuilder(UserEntity, "users")
      .update(UserEntity)
      .where(`id = :id`)
      .setParameter("id", user.id)
      .set({
        pending_balance: () => "pending_balance - :amount",
      })
      .setParameter("amount", amount)
      .execute();
  };

  public static incrementAvailableBalanceInTransaction = async (
    transactionalManager: EntityManager,
    user: UserEntity,
    amount: string
  ): Promise<void> => {
    await transactionalManager
      .createQueryBuilder(UserEntity, "users")
      .update(UserEntity)
      .where(`id = :id`)
      .setParameter("id", user.id)
      .set({
        available_balance: () => "available_balance + :amount",
      })
      .setParameter("amount", amount)
      .execute();
  };

  public static decrementAvailableBalanceInTransaction = async (
    transactionalManager: EntityManager,
    user: UserEntity,
    amount: string
  ): Promise<void> => {
    await transactionalManager
      .createQueryBuilder(UserEntity, "users")
      .update(UserEntity)
      .where(`id = :id`)
      .setParameter("id", user.id)
      .set({
        available_balance: () => "available_balance - :amount",
      })
      .setParameter("amount", amount)
      .execute();
  };
}
