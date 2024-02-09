// Code from:
// https://github.com/blackrose514/niconico-search-api

import axios from "axios";
import { responseFields } from "./NicoSearchConst.js";
import {
  ErrorResponse,
  SearchAPIResponse,
  SearchParams,
} from "./@types/NicoSearch.js";

const apiUrl =
  "https://api.search.nicovideo.jp/api/v2/snapshot/video/contents/search";

export default async function search<P extends SearchParams>({
  q,
  targets,
  fields,
  filters,
  sort,
  limit,
  offset,
  context,
}: P): Promise<SearchAPIResponse<P["fields"]>> {
  if (fields === "*") {
    fields = responseFields;
  }

  try {
    const url: any = new URL(apiUrl);
    const { data: res } = await axios({
      url,
      params: {
        q,
        targets: targets.join(),
        fields: fields?.join(),
        jsonFilter: filters,
        _sort: sort,
        _limit: limit,
        _offset: offset,
        _context: context,
      },
      method: "GET",
    });

    return res;
  } catch (err: any) {
    if (err?.response) {
      const { meta } = err.response as ErrorResponse;
      throw {
        name: "NiconicoSearchAPIResponseError",
        meta,
      };
    }
    throw err;
  }
}
