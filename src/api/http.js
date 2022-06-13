import axios from 'axios';

// 创建实例
const service = axios.create({
    // baseURL: 'http://localhost:4000/',
    baseURL: 'https://tagging-music-api.vercel.app/', // vercel api address
    withCredentials: true,
    timeout: 15000 // request timeout
});


//http request 拦截器
service.interceptors.request.use(
    config => {
        if (config.method != 'get') {
            config.data = JSON.stringify(config.data);
        }
        config.headers['Content-Type'] = 'application/x-www-form-urlencoded';

        // <!--设置token可以判断是否处于登录状态，每次请求的时候将token带上-->
        let token = window.sessionStorage.getItem("TOKEN");
        if (token) {
            config.params = { 'token': token }
        }
        return config;
    },
    error => {
        return Promise.reject(error)
    }
)

// http response 拦截器
service.interceptors.response.use(
    response => {
        return response;
    },
    error => {
        //与后台人员协商配置
        return Promise.reject(error)
    }
)

/**
* 封装get方法
* @param url 
* @param params 
* @returns {Promise}
*/
export function get(url, params = {}) {
    return new Promise((resolve, reject) => {
        service.get(url, {
            params: { timestamp: new Date().getTime(), ...params }
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
export function post(url, params = {}) {
    return new Promise((resolve, reject) => {
        service.post(url, { timestamp: new Date().getTime(), ...params })
            .then(res => {
                resolve(res.data)
            })
            .catch(err => {
                reject(err)
            })
    })
}


/**
* 封装不带缓存的 get 方法
* @param url 
* @param params 
* @returns {Promise}
*/
export function getSync(url, params = {}) {
    return new Promise((resolve, reject) => {
        service.get(url, {
            params
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
 * 封装不带缓存的 post 方法
 * @param url
 * @param params 
 * @returns {Promise}
 */
export function postSync(url, params = {}) {
    return new Promise((resolve, reject) => {
        service.post(url, { timestamp: new Date().getTime(), ...params })
            .then(res => {
                resolve(res.data)
            })
            .catch(err => {
                reject(err)
            })
    })
}

export default { get, post, postSync, getSync }