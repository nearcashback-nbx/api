import { UserProviderType } from "./provider_type.enum";

export interface IUserProvider {
  readonly providerId: string;
  readonly providerType: UserProviderType;
  readonly displayName: string;
  readonly avatarUrl: string;
  readonly email: string;
}
