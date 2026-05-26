// API 响应接口
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// HTTP 客户端（单例）
export class HttpClient {
  private static instance: HttpClient;

  private baseUrl: string;
  private token: string | null = null;

  private constructor() {
    this.baseUrl = 'http://localhost:3000/api';
  }

  static getInstance(): HttpClient {
    if (!HttpClient.instance) {
      HttpClient.instance = new HttpClient();
    }
    return HttpClient.instance;
  }

  // 设置 Base URL
  setBaseUrl(url: string): void {
    this.baseUrl = url;
  }

  // 设置 JWT Token
  setToken(token: string): void {
    this.token = token;
    // 同时保存到本地存储
    localStorage.setItem('td_token', token);
  }

  // 清除 Token
  clearToken(): void {
    this.token = null;
    localStorage.removeItem('td_token');
  }

  // 从本地存储恢复 Token
  loadToken(): void {
    const saved = localStorage.getItem('td_token');
    if (saved) {
      this.token = saved;
    }
  }

  // 获取 Token
  getToken(): string | null {
    return this.token;
  }

  // GET 请求
  async get<T>(path: string): Promise<ApiResponse<T>> {
    return this.request<T>('GET', path);
  }

  // POST 请求
  async post<T>(path: string, body: object = {}): Promise<ApiResponse<T>> {
    return this.request<T>('POST', path, body);
  }

  // 通用请求方法
  private async request<T>(method: string, path: string, body?: object): Promise<ApiResponse<T>> {
    const url = path.startsWith('http') ? path : `${this.baseUrl}${path}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // 附加 JWT Token
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const options: RequestInit = {
      method,
      headers,
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: '网络请求失败' }));
      return { success: false, error: error.error || `HTTP ${response.status}` };
    }

    const data = await response.json();
    return data as ApiResponse<T>;
  }
}
