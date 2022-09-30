// http.ts
import axios from 'axios'
import type { AxiosRequestConfig, AxiosResponse } from 'axios'
import app from '@/main'
import type { requestConfig, responseData } from '@/store/interfaces'
import { showStatus } from '@/assets/map'

const service = axios.create({
  // 联调
  // baseURL: "https://tagging-music-9apvcrf74-alwayfeels.vercel.app/",
  // 自有服务器
  // baseURL: "/music",
  baseURL: import.meta.env.VITE_MUSIC_API,
  // headers: {
  //   get: {
  //     'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
  //   },
  //   post: {
  //     'Content-Type': 'application/json;charset=utf-8'
  //   }
  // },
  // 是否跨站点访问控制请求
  withCredentials: true,
  timeout: 15000,
  transformRequest: [(data) => {
    data = JSON.stringify(data)
    return data
  }],
  validateStatus() {
    // 使用async-await，处理reject情况较为繁琐，所以全部返回resolve，在业务代码中处理异常
    return true
  },
  transformResponse: [(data) => {
    if (typeof data === 'string' && data.startsWith('{')) {
      data = JSON.parse(data)
    }
    return data
  }]

})

// 请求拦截器
service.interceptors.request.use((config: AxiosRequestConfig) => {
  console.log('////////////', import.meta.env.VITE_MUSIC_API)
  return config
}, (error) => {
  // 错误抛到业务代码
  error.data = {}
  error.data.msg = '服务器异常，请联系管理员！'
  return Promise.resolve(error)

})

// 响应拦截器
service.interceptors.response.use((response: AxiosResponse) => {
  const status = response.status
  let msg = ''

  if (status < 200 || status >= 300) {
    // 处理http错误，抛到业务代码
    msg = showStatus(status)
    if (typeof response.data === 'string') {
      response.data = { msg }
    } else {
      response.data.msg = msg
    }
    app?.config?.globalProperties?.$notification?.create({
      type: 'error',
      title: '请求错误',
      content: msg,
      duration: 3000
    })
  }
  return response
}, (error) => {
  if (axios.isCancel(error)) {
    app?.config?.globalProperties?.$notification?.create({
      type: 'error',
      title: `repeated request: ${error.message}`,
      duration: 3000
    })
    console.log('repeated request: ' + error.message)
  } else {
    // 错误抛到业务代码
    app?.config?.globalProperties?.$notification?.create({
      type: 'error',
      title: `repeated request: ${error.message}`,
      duration: 3000
    })
  }
  return Promise.reject(error)
})


/**
* 封装get方法
* @param url 
* @param params 
* @returns {Promise}
*/

export function get(url: string, params = {}, config: requestConfig = {}) {
  // default use timestamp params
  const { useTimestamp = true } = config
  return new Promise<responseData>((resolve, reject) => {
    service.get<responseData>(url, {
      params: {
        timestamp: useTimestamp ? new Date().getTime() : null,
        ...params
      }
    })
      .then(res => {
        resolve(res.data)
      })
      .catch(err => {
        reject(err)
      })
  })
}

/**
* 封装post请求
* @param url
* @param params
* @returns {Promise}
*/
export function post(url: string, params = {}, config: requestConfig = {}) {
  // default use timestamp params
  const { useTimestamp = true } = config
  return new Promise<responseData>((resolve, reject) => {
    service.post<responseData>(url, {
      timestamp: useTimestamp ? new Date().getTime() : null,
      ...params
    })
      .then(res => {
        resolve(res.data)
      })
      .catch(err => {
        reject(err)
      })
  })
}

export default { get, post }
