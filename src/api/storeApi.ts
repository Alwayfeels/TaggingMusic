/**
 * =======================================
 * @desc: 数据存储服务
 */
// http.ts
import axios from 'axios'
import type { AxiosRequestConfig, AxiosResponse } from 'axios'
import app from '@/main'
import type { requestConfig, responseData } from '@/store/interfaces'
import { showStatus } from '@/assets/map'

const store = axios.create({
    // 自有服务器
    baseURL: import.meta.env.VITE_STORE_API,
    // 是否跨站点访问控制请求
    withCredentials: true,
    timeout: 15000,
})

store.interceptors.response.use((response: AxiosResponse) => {
    const status = response.status
    let msg = ''

    if (status < 200 || status >= 300 || response.data.code !== 200) {
        // 处理http错误，抛到业务代码
        msg = (status < 200 || status >= 300) ? showStatus(status) : showStatus(response.data.code)
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


export function get(url: string, params = {}) {
    // default use timestamp params
    return new Promise<responseData>((resolve, reject) => {
        store.get<responseData>(url, { params })
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
* @param data
* @returns {Promise}
*/
export function post(url: string, data = {}) {
    // default use timestamp params
    return new Promise<responseData>((resolve, reject) => {
        store.post<responseData>(url, data)
            .then(res => {
                resolve(res.data)
            })
            .catch(err => {
                reject(err)
            })
    })
}

export default { get, post }
