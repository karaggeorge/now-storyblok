import got from 'got';
import { ZeitClient } from '@zeit/integration-utils';
import { NEXT_LOGO, GATSBY_LOGO, NUXT_LOGO } from '../constants';

const sha1 = require('sha1');

const getFiles = async (repo: string, path: string, ref?: string) => {
  const {body} = await got.get(`https://api.github.com/repos/${repo}/contents/${path}${ref ? `?ref=${ref}` : ''}`, {json: true});
  return body;
};

const uploadFile = async (zeitClient: ZeitClient, content: string) => {
  const {token, teamId} = zeitClient.options;
  const sha = sha1(content);

  const res = await got.post(`https://zeit.co/api/v2/now/files${teamId ? `?teamId=${teamId}` : ''}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Length': content.length,
      'x-now-digest': sha
    },
    body: content
  });

  return sha;
};

const getNowConfig = async (repo: string, ref?: string) => {
  const {body} = await got.get(`https://raw.githubusercontent.com/${repo}/${ref}/now.json`);
  return JSON.parse(body);
};

const uploadFiles = async (zeitClient: ZeitClient, repo: string, path: string, ref?: string) => {
  const ghFiles = await getFiles(repo, path, ref);

  return Promise.all(ghFiles.map(async (file: any) => {
    if (file.type === 'file') {
      const {body: content} = await got.get(file.download_url);
      const sha = await uploadFile(zeitClient, content);

      return {
        sha,
        size: content.length,
        file: file.path
      };
    }

    return uploadFiles(zeitClient, repo, file.path, ref);
  }));
};

const flatten = (acc: any, x: any): any => [...acc, ...(Array.isArray(x) ? x.reduce(flatten, []) : [x])];

const deployRepo = async (zeitClient: ZeitClient, token: string, repo: string, ref?: string): Promise<any> => {
  const uploadedFiles = await uploadFiles(zeitClient, repo, '', ref);
  const files = uploadedFiles.reduce(flatten, []);
  const nowConfig = await getNowConfig(repo, ref);

  const {id, name} = await zeitClient.fetchAndThrow(`/v1/projects/ensure-project`, {
    method: 'POST',
    data: {name: nowConfig.name}
  });

  const secretName = await zeitClient.ensureSecret('storyblok-token', token);
  await zeitClient.upsertEnv(id, 'STORYBLOK_TOKEN', secretName);

  const deployment = await zeitClient.fetchAndThrow(`/v9/now/deployments`, {
    method: 'POST',
    data: {
      ...nowConfig,
      files
    }
  });

  return {
    projectId: id,
    projectName: name,
    deployment
  }
};

interface Tech {
  name: string;
  tutorial?: string;
  repo: string;
  ref: string;
  image: string;
  slug: string;
}

const TECHS: {[key: string]: Tech} = {
  next: {
    name: 'React/Next.js',
    image: NEXT_LOGO,
    tutorial: 'https://www.storyblok.com/tp/next-js-react-guide',
    repo: 'storyblok/react-next-boilerplate',
    ref: 'now-integration',
    slug: 'next'
  },
  nuxt: {
    name: 'Vue.js/Nuxt.js',
    image: NUXT_LOGO,
    tutorial: 'https://www.storyblok.com/tp/nuxt-js-multilanguage-website-tutorial',
    repo: 'storyblok/vue-nuxt-boilerplate',
    ref: 'now-integration',
    slug: 'nuxt'
  },
  gatsby: {
    name: 'React/Gatsby',
    image: GATSBY_LOGO,
    tutorial: 'https://www.storyblok.com/tp/gatsby-multilanguage-website-tutorial',
    repo: 'karaggeorge/gatsby-storyblok-boilerplate',
    ref: 'now-integration',
    slug: 'gatsby'
  }
};

export const deployTech = (slug: string, zeitClient: ZeitClient, token: string) => {
  const {repo, ref} = TECHS[slug];
  return deployRepo(zeitClient, token, repo, ref);
}

export default TECHS;
