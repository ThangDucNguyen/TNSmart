import {api} from './api';

class AliasService {
  getAliasFromOrigin = async (
    request: {origin_id: string},
  ): Promise<any> => {
    return api.get({
      url: `/alias/origin/${request.origin_id}`
    });
  }

  getOriginFromAlias = async (
    request: {id: string},
  ): Promise<any> => {
    return api.get({
      url: `/alias/${request.id}`
    });
  }
}

export const aliasService = new AliasService();
