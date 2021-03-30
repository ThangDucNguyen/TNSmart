export enum OrgPermission {
  ORG = 'org',
  IS_MEMBER = 'is_member',
}

export enum UserMemberPermission {
  MEMBER = 'member',
  TRANSFER_SUPER_ADMIN = 'member:transfer_super_admin',
}

export enum VendorPermission {
  VENDOR = 'vendor',
  READ = 'vendor:read',
  RATING = 'vendor:rating',
}

export enum CustomerPermission {
  CUSTOMER = 'customer',
  READ = 'customer:read',
  RESPONSE = 'customer:response',
  ADD = 'customer:add',
}

export enum PostPermission {
  POST = 'post',
}

export enum ActivityLogPermission {
  READ = 'activity_logs:read',
}

export enum BuyingRequestPermission {
  // For creators
  MY_BUY_REQUEST = 'my_buy_request',
  BUY_REQUEST_READ = 'buy_request:read',
  BUY_REQUEST = 'buy_request',
  BUY_REQUEST_SETTING = 'buy_request_setting',
  // For receivers
  RECEIVED_BUY_REQUEST = 'received_buy_request',
  RECEIVED_BUY_REQUEST_SETTING = 'received_buy_request_setting',
}

export enum SalesOfferPermission {
  // // For creators
  // MY_SALES_OFFER = 'my_sales_offer',
  // SALES_OFFER_READ = 'sales_offer:read',
  // SALES_OFFER = 'sales_offer',
  // SALES_OFFER_SETTING = 'sales_offer_setting',
  // // For receivers
  // RECEIVED_SALES_OFFER = 'received_sales_offer',
  // RECEIVED_SALES_OFFER_SETTING = 'received_sales_offer_setting',

  // For creators
  MY_SALES_OFFER = 'received_buy_request',
  SALES_OFFER_READ = 'sales_offer:read',
  SALES_OFFER = 'received_buy_request_setting',
  SALES_OFFER_SETTING = 'received_buy_request_setting',
  // For receivers
  RECEIVED_SALES_OFFER = 'my_buy_request',
  RECEIVED_SALES_OFFER_SETTING = 'buy_request_setting',
}

export enum PurchaseOrderPermission {
  MY_PURCHASE_ORDER = 'purchase_order',
}

export enum SalesOrderPermission {
  MY_SALES_ORDER = 'sales_order',
}

export enum ContactPermission {
  CREATE = 'contact_person:create',
  UPDATE = 'contact_person:update',
  DELETE = 'contact_person:delete',
  READ = 'contact_person:read',
}

export enum Role {
  SYSTEM_ADMIN = 'system_admin', // Only for Atalink
  SYSTEM_SUPER_ADMIN = 'system_super_admin', // Only for Atalink
  // Role for orgs
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',

  BOSS = 'boss',
  PURCHASING_MANAGER = 'purchasing_manager',
  PURCHASER = 'purchaser',
  CONTENT_EDITOR = 'content_editor',
  STANDARD_USER = 'member',
  USER_MANAGER = 'user_manager',

  SALES_ADMIN = 'sales_admin',
  TOP_SALES_MANAGER = 'top_sales_manager',
  SALES_MANAGER = 'sales_manager',
  SALES_PERSON = 'sales_person',
  SHIPPER = 'shipper',
  GUEST_USER = 'guest',
}

export enum DistributorPermission {
  DISTRIBUTOR = 'distributors',
  READ = 'DISTRIBUTOR:read',
}

export enum SalesSettingsPermission {
  CUSTOMER_GROUP_SETTING = 'customer_group_setting',
  SALES_CHANNEL_SETTING = 'sales_channel_setting',
  TRADING_FORMAT_SETTING = 'trading_format_setting',
}

export enum SalesTeamPermission {
  SALES_TEAMS = 'sales_teams',
  MY_SALES_TEAMS = 'my_sales_teams',
  SALES_MANAGER_LEVEL_SETTING = 'sales_manager_level_setting',
}
