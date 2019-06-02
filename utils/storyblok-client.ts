import got from 'got';

type AuthReturn = ApiError & {
  token?: string;
  meta?: {
    userId: string;
    email: string;
  };
};

type ApiError = {
  error?: {
    payload: string;
    route: string;
  }
}

export default class StoryblockClient {
  token?: string;

  constructor(token?: string) {
    this.token = token;
  }

  request = async (path: string, method: 'get' | 'post' | 'put' | 'head' = 'get', payload?: object): Promise<any> => {
    const headers = this.token ? {Authorization: this.token} : {};
    const response = await got[method](`https://app.storyblok.com/v1/${path}`, {
      headers,
      json: true,
      body: payload
    });

    return method === 'head' ? response : response.body;
  }

  login = async (type: 'email' | 'token', state: {[key: string]: string}): Promise<AuthReturn> => {
    if (type === 'email') {
      if (!state.email || !state.password) {
        return {error: {payload: 'All fields are required', route: 'view/login'}};
      }

      try {
        const data = await this.request('users/login', 'post', {
          email: state.email,
          password: state.password,
          otp_attempt: null
        });

        return {
          token: data.access_token,
          meta: {
            userId: data.user_id,
            email: data.email
          }
        };
      } catch(error) {
        return {
          error: {
            payload: error.body && error.body.error || 'Oops, something went wrong',
            route: 'view/login'
          }
        };
      }
    }

    if (!state.token) {
      return {error: {payload: 'Please provide a token', route: 'view/login/token'}};
    }

    this.token = state.token;
    try {
      const {user} = await this.getUser();

      return {
        token: state.token,
        meta: {
          userId: user.id,
          email: user.email
        }
      };
    } catch (error) {
      if (error.statusCode === 401) {
        return {error: {payload: 'Invalid token', route: 'view/login/token'}};
      }

      return {error: {payload: 'Oops, something went wrong', route: 'view/login/token'}};
    }
  }

  signup = async (state: {[key: string]: string}): Promise<AuthReturn> => {
    if (!state.email || !state.password || !state.confirmPassword) {
      return {error: {payload: 'All fields are required', route: 'view/signup'}};
    }

    if (state.password !== state.confirmPassword) {
      return {error: {payload: 'Passwords don\'t match', route: 'view/signup'}};
    }

    try {
      const data = await this.request('users/signup', 'post', {
        user: {
          email: state.email,
          password: state.password,
          otp_attempt: null
        },
        email: state.email
      });

      return {
        token: data.access_token,
        meta: {
          userId: data.user_id,
          email: data.email
        }
      };
    } catch (error) {
      return {
        error: {
          payload: (
            error.body && (
              (error.body.email && `Email ${error.body.email[0]}`) ||
              (error.body.password && `Password ${error.body.password[0]}`) ||
              error.body.error
            ) || 'Oops, something went wrong'
          ),
          route: 'view/signup'
        }
      };
    }
  }

  resetPassword = async (state: {[key: string]: string}): Promise<ApiError> => {
    if (!state.email) {
      return {error: {payload: 'Please provide your email', route: 'view/reset-password'}};
    }

    try {
      await this.request('users/reset_password', 'post', {email: state.email});
      return {};
    } catch (error) {
      return {
        error: {
          payload: error.body && error.body.error || 'Oops, something went wrong',
          route: 'view/reset-password'
        }
      };
    }
  }

  getUser = async () => {
    return this.request('users/me');
  }

  getStories = async (id: string) => {
    const {stories} = await this.request(`spaces/${id}/stories`);
    return stories;
  }

  listSpaces = async (search?: string) => {
    const {spaces} = await this.request(`spaces${search ? `?search=${search}` : ''}`);
    return spaces;
  }

  getSpaces = async (search?: string) => {
    const spaces = await this.listSpaces(search);
    return Promise.all(spaces.map(async (space: any) => this.getSpace(space.id))) as any;
  }

  getSpace = async (id: string) => {
    const {space} = await this.request(`spaces/${id}`);
    const apiHits = await this.getApiHitsThisMonth(id);
    return {...space, apiHits};
  }

  getSummary = async (space: any) => {
    const metrics = ['Asset', 'Component', 'Datasource'];
    const {stories_count: stories, id} = space;

    const data = await Promise.all(metrics.map(async metric => {
      const plural = `${metric}s`;
      const {[plural.toLowerCase()]: list} = await this.request(`spaces/${id}/${plural.toLowerCase()}`);

      if (list.length === 0) {
        return null;
      }

      return {
        text: `${list.length} ${list.length === 1 ? metric : plural}`,
        link: `https://app.storyblok.com/#!/me/spaces/${id}/${plural.toLowerCase()}`
      };
    }));

    return [
      stories > 0 ? {
        text: `${stories} Stor${stories === 1 ? 'y' : 'ies'}`,
        link: `https://app.storyblok.com/#!/me/spaces/${id}/stories`
      } : null,
      ...data].filter(Boolean);
  }

  getApiHitsThisMonth = async (id: string) => {
    const {api_logs_per_month: logs} = await this.request(`spaces/${id}/statistics`);
    return logs.reduce((sum: number, item: any) => sum + (new Date().getMonth() === new Date(item.created_at).getMonth() ? item.counting : 0), 0);
  }

  updateSpace = async (id: string, space: any) => {
    return this.request(`spaces/${id}`, 'put', {space});
  }

  createSpace = async (name: string, spaceId: string) => {
    return this.request('spaces', 'post', {
      create_demo: false,
      dup_id: spaceId,
      space: {name}
    });
  }
}
