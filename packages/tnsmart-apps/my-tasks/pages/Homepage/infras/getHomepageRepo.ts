import {
  GetHomepageRequest,
  GetHomepageResponse,
} from "../core/models/GetHomePage";
import { GetHomepageRepo } from "../core/repos/getHompageRepo";

export default new (class implements GetHomepageRepo {
  async getHomepageInfo(
    req: GetHomepageRequest,
    ctx: any
  ): Promise<GetHomepageResponse> {
    return { a: 1, b: 2 };
  }
})();
