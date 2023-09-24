export interface PlaylistInterface {
  id: string;
  name: string;
  owner: string;
  tracks?: PlaylistTrackInterface[];
  private: boolean;
  created: number;
  description?: string | null;
}

export interface PlaylistTrackInterface {
  title: string | null;
  uri: string;
  length?: number;
  thumbnail?: string | null;
  author?: string | null;
  requester?: string | null | unknown;
}
