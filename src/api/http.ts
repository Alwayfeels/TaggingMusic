// http.ts
import axios from 'axios'
import type { AxiosRequestConfig, AxiosResponse } from 'axios'
import app from '@/main'

const showStatus = (status: number) => {
  let message = ''
  switch (status) {
    case 400:
      message = '请求错误(400)'
      break
    case 401:
      message = '未授权，请重新登录(401)'
      break
    case 403:
      message = '拒绝访问(403)'
      break
    case 404:
      message = '请求出错(404)'
      break
    case 408:
      message = '请求超时(408)'
      break
    case 500:
      message = '服务器错误(500)'
      break
    case 501:
      message = '服务未实现(501)'
      break
    case 502:
      message = '网络错误(502)'
      break
    case 503:
      message = '服务不可用(503)'
      break
    case 504:
      message = '网络超时(504)'
      break
    case 505:
      message = 'HTTP版本不受支持(505)'
      break
    default:
      message = `连接出错(${status})!`
  }
  return `${message}，请检查网络或联系管理员！`
}

const service = axios.create({
  // 联调
  // baseURL: "https://tagging-music-9apvcrf74-alwayfeels.vercel.app/",
  // 自有服务器
  baseURL: "/music",
  // 友情服务器（弃用）
  // baseURL: "http://47.105.100.125:8082/",
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

interface requestConfig {
  useTimestamp?: boolean
}
interface responseData {
  code: number
  [propName: string]: any;
}

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

/**
 * =======================================
 * @desc: 数据存储服务
 */

 const store = axios.create({
  // 自有服务器
  baseURL: "/store",
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


export function storeGet(url: string, params = {}) {
  // default use timestamp params
  return new Promise<responseData>((resolve, reject) => {
    store.get<responseData>(url, {
      params: {
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
export function storePost(url: string, params = {}) {
  // default use timestamp params
  return new Promise<responseData>((resolve, reject) => {
    store.post<responseData>(url, {
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




export default { get, post, storeGet, storePost }