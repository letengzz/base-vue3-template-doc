# 集成Axios

添加依赖：

```[pnpm]
pnpm i axios
```

在src新建http文件夹并添加index.ts：

```typescript [index.ts]
// axios的配置项
import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";

import axios from "axios";
// import { ElMessage } from "element-plus";

// 定义返回值类型
interface Result<T> {
  code: number
  message: string
  data: T
}
const config = {
  baseURL: "/api", // 请求接口的地址
  timeout: 10000,
};

class Http {
  // axios实例
  private instance: AxiosInstance;

  constructor(configs: AxiosRequestConfig) {
    // 创建axios实例
    this.instance = axios.create(configs);
    // 配置拦截器
    this.interceptors();
  }

  // 请求发送，返回做处理
  private interceptors() {
    // 请求发送前处理：请求头携带token
    this.instance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // 获取token
        const token = "";
        if (token) {
          config.headers!.token = token;
        }
        return config;
      },
      (error: { data: { msg?: any } }) => {
        error.data = {};
        error.data.msg = "服务器异常,请联系管理员！";
        return error;
      },
    );
    // axios请求返回之后的处理
    this.instance.interceptors.response.use(
      (res: AxiosResponse) => {
        if (res.data.code === 200) {
          return res.data;
        }
        else {
          // ElMessage.error(res.data.msg || "服务器出错");
          return Promise.reject(res.data.msg || "服务器出错");
        }
      },
      (error: { data: { msg?: any }, msg: any, response: { status: any }, reponse: { message: any } }) => {
        // console.log('进入错误')
        error.data = {};
        if (error && error.msg) {
          switch (error.response.status) {
          case 400:
            error.data.msg = "错误请求";
            // ElMessage.error(error.data.msg);
            break;
          case 401:
            error.data.msg = "未授权,请重新登录";
            // ElMessage.error(error.data.msg);
            break;
          case 403:
            error.data.msg = "拒绝访问";
            // ElMessage.error(error.data.msg);
            break;
          case 404:
            error.data.msg = "请求错误,未找到接口";
            // ElMessage.error(error.data.msg);
            break;
          case 405:
            error.data.msg = "请求方法未允许";
            // ElMessage.error(error.data.msg);
            break;
          case 408:
            error.data.msg = "请求超时";
            // ElMessage.error(error.data.msg);
            break;
          case 500:
            error.data.msg = "服务器端出错";
            // ElMessage.error(error.data.msg);
            break;
          case 501:
            error.data.msg = "网络未实现";
            // ElMessage.error(error.data.msg);
            break;
          case 502:
            error.data.msg = "网络错误";
            // ElMessage.error(error.data.msg);
            break;
          case 503:
            error.data.msg = "服务不可用";
            // ElMessage.error(error.data.msg);
            break;
          case 504:
            error.data.msg = "网络超时";
            // ElMessage.error(error.data.msg);
            break;
          case 505:
            error.data.msg = "http版本不支持该请求";
            // ElMessage.error(error.data.msg);
            break;
          default:
            error.data.msg = `连接错误${error.reponse.message}`;
            // ElMessage.error(error.data.msg);
          }
        }
        else {
          error.data.msg = "连接到服务器失败";
          // ElMessage.error(error.data.msg);
        }
        return Promise.reject(error);
      },
    );
  }

  /* GET请求 */
  get<T = Result<never>>(url: string, params?: object): Promise<T> {
    return this.instance.get(url, { params });
  }

  /* POST请求 */
  post<T = Result<never>>(url: string, data?: object): Promise<T> {
    return this.instance.post(url, data);
  }

  /* PUT请求 */
  put<T = Result<never>>(url: string, data?: object): Promise<T> {
    return this.instance.put(url, data);
  }

  /* DELETE请求 */
  delete<T = Result<never>>(url: string, data?: object): Promise<T> {
    return this.instance.delete(url, { data });
  }

  /* 图片上传 */
  upload<T = Result<never>>(url: string, params?: object): Promise<T> {
    return this.instance.post(url, params, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  }
}

export default new Http(config);
```

