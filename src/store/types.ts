import type { ComputedRef } from "vue"

export interface UserInfo {
  profile: any,
  account: any,
  id?: number | null,
}

export enum PlayMode {
  LOOP = '顺序播放',
  RANDOM = '随机播放',
  SINGLE = '单曲循环',
}

export interface GlobalData {
  user: UserInfo;
  playlist: any;
  songlist: any;
  [key: string]: unknown;
}

export interface Playlist {
  id?: number;
  name?: string;
  [key: string]: any;
}

export interface Song {
  id?: number;
  ar?: any;
  fee?: number;
  name?: string;
  url?: string;
  [key: string]: any;
}

export interface GlobalState {
  user: {
    isLogin: ComputedRef<boolean>;
    isVip: ComputedRef<boolean>;
  };
  topBar: {
    isShow: boolean;
    isShowSearch: boolean;
  };
  playlist: {
    isShow: boolean;
    isLoading: boolean;
    data: ComputedRef<Playlist[]>;
    active: Playlist;
  };
  songlist: {
    isShow: boolean;
    isLoading: boolean;
    data: Song[];
    active: Song;
  };
  player: {
    isShow: boolean;
    isLoading: boolean;
    isPlaying: boolean;
    currentTime: number;
    duration: number;
    playMode: PlayMode;
  };
}