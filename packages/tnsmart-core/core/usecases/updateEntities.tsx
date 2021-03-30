import { createReducers, createAction, Action } from "../../infras/redux/utils";
import { useSelector } from "react-redux";
import { schema } from "normalizr";
import { useMemo } from "react";

export const updateEntities = createAction("updateEntities");
export const deleteEntitiy = createAction<{ type: string; id: string }>(
  "deleteEntity"
);
const stateContext = "entities";

export const keepEntityWhenUpdate = <T extends object>(
  data: T,
  ttl: number = 1000
): T & { __entityUpdatedAt__: Date; __ttl__: number } => {
  if (!data) {
    return data;
  }
  return {
    ...data,
    __entityUpdatedAt__: new Date(),
    __ttl__: ttl,
  };
};

export const entitiesReducers = createReducers(
  stateContext,
  [
    {
      action: updateEntities,
      reduce: (
        state: { [key: string]: object },
        action: Action<{
          [entityName: string]: { [entityId: string]: object };
        }>
      ): { [key: string]: object } => {
        if (!action.payload) {
          return state;
        }
        const now = new Date();
        const newState = { ...state };
        for (const entityName of Object.keys(action.payload)) {
          for (const entityId of Object.keys(action.payload[entityName])) {
            const { __entityUpdatedAt__, __ttl__, ...oldValues } =
              newState[entityName]?.[entityId] || {};
            const newEntityValue =
              __entityUpdatedAt__ &&
              now.getTime() - (__entityUpdatedAt__ as Date).getTime() < __ttl__
                ? {
                    ...action.payload[entityName][entityId],
                    ...oldValues,
                  }
                : {
                    ...oldValues,
                    ...action.payload[entityName][entityId],
                  };
            newState[entityName] = {
              ...(newState[entityName] || {}),
              [entityId]: newEntityValue,
            };
          }
        }
        return newState;
      },
    },
  ],
  {}
);

export const createEntitySelector: <T = unknown>(
  type: string,
  id: string
) => (state: $FixType) => T = (type: string, id: string) => (state: $FixType) =>
  state[stateContext]?.[type]?.[id];

export const entitySchema = schema.Entity;
export function useEntity<T>(type: string, id: string): T {
  return useSelector(createEntitySelector(type, id));
}

export function useEntities<T>(type: string, ids: string[]): T[] {
  const dataById = useSelector((state: $FixType) => state[stateContext][type]);
  return useMemo(() => {
    return (ids || []).map((id) => (dataById ? dataById[id] : null));
  }, [ids, type, dataById]);
}

export const userSchema = new schema.Entity("users");
