import { ComputedRef } from "vue"

export interface UserInfo {
  profile: any,
  account: any,
  id?: number | null,
}

export interface GlobalData {
  user: UserInfo;
  playlist: any;
  songlist: any;
  [key: string]: unknown;
}

export interface GlobalState {
  globalData: GlobalData;
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
    data: ComputedRef<any[]>;
    active: any;
  };
  songlist: {
    isShow: boolean;
    isLoading: boolean;
    data: any[];
    active: any;
  };
  player: {
    isShow: boolean;
    isLoading: boolean;
    isPlaying: boolean;
  };
}