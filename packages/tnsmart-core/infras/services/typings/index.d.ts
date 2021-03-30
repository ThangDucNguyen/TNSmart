export interface IRes {
  status: string;
  data: any;
}

export interface ILocation {
  id: string;
  name: LocalizedText | string;
  type?: string;
}

export interface IAddress {
  country?: ILocation;
  city?: ILocation;
  district?: ILocation;
  ward?: ILocation;
  street?: string;
  state?: string;
}

export interface ISalesOffer {
  id: string;
}

export interface IBuyingRequest {
  id: string;
}

export interface IOrg {
  id: string;
  friendly_id?: string;
  name: string;
  avatar_id?: string;
  cover_id?: string;
  created_at: string;
}

export interface IUser {
  id: string;
  friendly_id?: string;
  chat_id?: string;
  firstName?: string;
  first_name: string;
  lastName?: string;
  last_name: string;
  nameConfig?: boolean;
  name_config: boolean;
  headline?: string;
  birthday?: string;
  cover_id?: string;
  gender?: string;
  avatar_id?: string;
  emails?: string[];
  phones?: string[];
  address: IAddress;
  created_at: string;
  updated_at: string;
  is_dummy?: boolean;
  privacy_configs?: { [key: string]: string };
}
