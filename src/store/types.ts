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
  songlist: Song[];
  taggedSongs: TaggedSong[];
  [key: string]: unknown;
}

export interface Playlist {
  id?: number | null;
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

export interface TaggedSong extends Song {
  tags: string[]
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

export interface TagRef {
  name: string;
  ref?: number;
  [key: string]: any;
}

export interface LabelValue {
  label: string;
  value: any;
  disabled?: boolean;
}
export interface TagInputState {
  val: string;
  tagList: LabelValue[];
  activeTags: LabelValue[];
}
