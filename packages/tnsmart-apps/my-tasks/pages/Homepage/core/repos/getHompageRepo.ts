import { GetHomepageRequest, GetHomepageResponse } from "../models/GetHomePage";

export interface GetHomepageRepo {
  getHomepageInfo(
    req: GetHomepageRequest,
    ctx: any
  ): Promise<GetHomepageResponse>;
}
