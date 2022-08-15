export interface UserInfo {
  profile: any,
  account: any,
  id?: number | null,
}

export interface GlobalData {
  user: UserInfo,
  playlist: any,
  songlist: any
}