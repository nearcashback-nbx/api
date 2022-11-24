import { UserProviderType } from "../types";
import { IUserProvider } from "../types/provider.interface";

export class GoogleUserProvider implements IUserProvider {
  private readonly _account: any;

  constructor(account: any) {
    this._account = account;
  }

  private get account() {
    if (!this._account)
      throw new Error(`No account provided for GoogleUserProvider`);

    return this._account;
  }

  public get providerType() {
    return UserProviderType.GOOGLE;
  }

  public get providerId() {
    return this.account.sub;
  }

  public get displayName() {
    return this.account.name;
  }

  public get avatarUrl() {
    return this.account.picture;
  }

  public get email() {
    return this.account.email;
  }
}
