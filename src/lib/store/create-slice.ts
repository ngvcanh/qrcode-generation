/* eslint-disable @typescript-eslint/no-empty-object-type */
import { cloneDeep } from "../clone-deep";
import { mergeObject } from "../merge-object";

export interface PayloadAction<Payload = never, Type = string, Meta = never> {
  type: Type;
  payload: Payload;
  meta: Meta;
}

export interface SliceReducerParam<State, Payload> {
  (state: State, payload: PayloadAction<Payload>): State | void;
}

export interface SliceReducerNone<State> {
  (state: State): State | void;
}

export interface SliceReducers<State, Payload = never> {
  [x: string]: SliceReducerNone<State> | SliceReducerParam<State, Payload>;
}

export interface CreateSliceOptions<State, Reducers extends {}> {
  name: string;
  initialState: State;
  reducers: Reducers;
}

export interface ReducerParam<Payload, Type = string> {
  (payload: Payload): PayloadAction<Payload, Type>;
}

export interface ReducerNone<Payload = never, Type = string> {
  (): PayloadAction<Payload, Type>;
}

export interface CreateSliceReturn<State, Reducers extends SliceReducers<State>> {
  actions: {
    [K in keyof Reducers]: Reducers[K] extends SliceReducerNone<State>
      ? SliceReducerNone<State>
      : Reducers[K] extends SliceReducerParam<State, infer P>
      ? ReducerParam<P>
      : ReducerNone;
  };
  reducer: (state: State, action: PayloadAction) => State | void;
}

function getType(name: string, reducerName: string) {
  return `${name}/${reducerName}`;
}

export function createSlice<State, Reducers extends SliceReducers<State>>(
  options: CreateSliceOptions<State, Reducers>
): CreateSliceReturn<State, Reducers> {
  const { name, initialState, reducers } = options;

  const reducerNames = Object.keys(reducers) as Array<keyof Reducers>;

  const types: Record<string, string> = mergeObject(
    ...reducerNames.map((reducerName) => ({
      [getType(name, reducerName as string)]: reducerName,
    }))
  );

  function reducer(state = initialState, action: PayloadAction) {
    const type = types[action.type];

    const nextState = cloneDeep(state);

    if (reducers[type]) {
      const result = reducers[type](nextState, action);
      return cloneDeep(result ?? nextState);
    }

    return nextState;
  }

  const actions = mergeObject(
    ...reducerNames.map((reducerName) => ({
      [reducerName]: (payload: unknown, meta?: unknown) => ({
        type: getType(name, reducerName as string),
        payload,
        meta,
      }),
    }))
  );

  return {
    actions,
    reducer,
  } as CreateSliceReturn<State, Reducers>;
}
