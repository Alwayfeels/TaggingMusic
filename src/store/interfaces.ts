
export interface requestConfig {
  useTimestamp?: boolean
}

export interface responseData {
  code: number
  [propName: string]: any;
}