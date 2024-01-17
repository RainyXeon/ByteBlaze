// Code from:
// https://github.com/y-chan/niconico-dl.js

export interface NiconicoAPIData {
  media: {
    delivery: {
      movie: {
        session: {
          videos: string[];
          audios: string[];
          heartbeatLifetime: number;
          recipeId: string;
          priority: number;
          urls: {
            isWellKnownPort: boolean;
            isSsl: boolean;
            [key: string]: any;
          }[];
          token: string;
          signature: string;
          contentId: string;
          authTypes: {
            http: string;
          };
          contentKeyTimeout: number;
          serviceUserId: string;
          playerId: string;
          [key: string]: any;
        };
        [key: string]: any;
      };
      [key: string]: any;
    };
    [key: string]: any;
  };
  video: OriginalVideoInfo;
  owner: OwnerInfo;
  [key: string]: any;
}

export interface OwnerInfo {
  id: number;
  nickname: string;
  iconUrl: string;
  channel: string | null;
  live: {
    id: string;
    title: string;
    url: string;
    begunAt: string;
    isVideoLive: boolean;
    videoLiveOnAirStartTime: string | null;
    thumbnailUrl: string | null;
  } | null;
  isVideoPublic: boolean;
  isMylistsPublic: boolean;
  videoLiveNotice: null;
  viewer: number | null;
}

export interface OriginalVideoInfo {
  id: string;
  title: string;
  description: string;
  count: {
    view: number;
    comment: number;
    mylist: number;
    like: number;
  };
  duration: number;
  thumbnail: {
    url: string;
    middleUrl: string;
    largeUrl: string;
    player: string;
    ogp: string;
  };
  rating: {
    isAdult: boolean;
  };
  registerdAt: string;
  isPrivate: boolean;
  isDeleted: boolean;
  isNoBanner: boolean;
  isAuthenticationRequired: boolean;
  isEmbedPlayerAllowed: boolean;
  viewer: null;
  watchableUserTypeForPayment: string;
  commentableUserTypeForPayment: string;
  [key: string]: any;
}

export interface VideoInfo extends OriginalVideoInfo {
  owner: OwnerInfo;
}
