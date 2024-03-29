import type { ComputedRef, PropType } from "vue"

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
  [key: string]: any;
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
    tagsIsSync: boolean;
  };
  playlist: {
    isShow: boolean;
    isLoading: boolean;
    data: Playlist[];
    active: Playlist;
  };
  songlist: {
    isShow: boolean;
    isLoading: boolean;
    data: Song[];
    active: Song;
    activeTagInputSong: Song | null;
    tagsHistory: TagHistory[],
    historyIndex: number
  };
  player: {
    playlist: Song[];
    active: Song,
    isShow: boolean;
    isLoading: boolean;
    isPlaying: boolean;
    currentTime: number;
    duration: number;
    playMode: PlayMode;
  };
}
export interface TagHistory {
  id: number;
  name: string;
  oldTags: string[];
  newTags: string[]
}

export interface TagRef {
  name: string;
  ref?: number;
  [key: string]: any;
}

export type LabelValue = import('naive-ui').AutoCompleteOption & {
    label: string;
    value: any;
    disabled?: boolean;
}

export interface TagInputState {
  val: string;
  activeTags: LabelValue[];
}
