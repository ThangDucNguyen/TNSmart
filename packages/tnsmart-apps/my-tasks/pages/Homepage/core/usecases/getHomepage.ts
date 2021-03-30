import GetHomepageRepo from "../../infras/getHomepageRepo";
import { GetHomepageRequest, GetHomepageResponse } from "../models/GetHomePage";
import { AsynState, createUseCase } from "tnsmart-core";

export interface GetHomepageState
  extends AsynState<GetHomepageRequest, GetHomepageResponse> {}

export const {
  action: getHomepage,
  selector: getHomepageSelector,
  hook: useGetHomepage,
  reducer: getHomepageReducer,
  saga: getHomepageSaga,
  dispatch: dispatchGetHomepage,
  exec: execGetHomepage,
} = createUseCase<GetHomepageState, GetHomepageRequest, GetHomepageResponse>({
  actionType: "getHomepage",
  effect: GetHomepageRepo.getHomepageInfo,
  // schema: receivedSalesOfferDetailSchema,
});
