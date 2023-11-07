export interface Playlist {
  id: string;
  name: string;
  owner: string;
  tracks?: PlaylistTrack[];
  private: boolean;
  created: number;
  description?: string | null;
}

export interface PlaylistTrack {
  title: string | null;
  uri: string;
  length?: number;
  thumbnail?: string | null;
  author?: string | null;
  requester?: string | null | unknown;
}
