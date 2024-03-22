// Code from:
// https://github.com/blackrose514/niconico-search-api

export interface SearchAPIResponse<F extends SearchParams["fields"]> {
  meta: {
    id: string;
    status: number;
    totalCount: number;
  };
  data: ResponseData<F>;
}

export interface ErrorResponse {
  meta: {
    id: string;
    status: number;
    errorCode: string;
    errorMessage: string;
  };
}

export type ResponseData<F extends SearchParams["fields"]> = F extends "*"
  ? Omit<Fields, "tagsExact">[]
  : F extends ResponseField[]
    ? Pick<Fields, F[number]>[]
    : never;

export interface SearchParams {
  q: string;
  targets: Target[];
  fields?: ResponseField[] | "*";
  filters?: JsonFilter;
  sort: Sort;
  offset?: number;
  limit?: number;
  context?: string;
}

export type Target = "title" | "description" | "tags" | "tagsExact";
export type FilterField = Exclude<keyof Fields, "contentId" | "title" | "description" | "thumbnailUrl" | "lastResBody">;
export type ResponseField = Exclude<keyof Fields, "tagsExact">;
export type JsonFilter = EqualFilter | RangeFilter | AndFilter | OrFilter | NotFilter;
export type Sort = `${"+" | "-"}${
  | "viewCounter"
  | "mylistCounter"
  | "lengthSeconds"
  | "startTime"
  | "commentCounter"
  | "lastCommentTime"}`;
export interface Fields {
  contentId: string;
  title: string;
  description: string;
  viewCounter: number;
  mylistCounter: number;
  lengthSeconds: number;
  thumbnailUrl: string;
  startTime: string;
  lastResBody: string;
  commentCounter: number;
  lastCommentTime: string;
  categoryTags: string;
  tags: string;
  tagsExact: string;
  genre: string;
  // 'genre.keyword': string
}
export interface EqualFilter {
  type: "equal";
  field: FilterField;
  value: string | number;
}

export interface RangeFilter {
  type: "range";
  field: FilterField;
  from?: string | number;
  to?: string | number;
  include_lower?: boolean;
  include_upper?: boolean;
}

export interface AndFilter {
  type: "and";
  filters: JsonFilter[];
}

export interface OrFilter {
  type: "or";
  filters: JsonFilter[];
}

export interface NotFilter {
  type: "not";
  filter: JsonFilter;
}
