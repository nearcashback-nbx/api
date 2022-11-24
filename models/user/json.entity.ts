import { UserEntity } from "./entity";

export class JsonUserEntity {
  public readonly id: string;
  public readonly name: string;
  public readonly avatar_url: string;
  public readonly email: string;
  public readonly balance: {
    readonly pending: string;
    readonly available: string;
    readonly total: string;
  };

  constructor(user: UserEntity) {
    this.id = user.id;
    this.name = user.display_name;
    this.avatar_url = user.avatar_url;
    this.email = user.email;

    this.balance = {
      pending: user.pending_balance,
      available: user.available_balance,
      total: user.totalBalance,
    };
  }
}
