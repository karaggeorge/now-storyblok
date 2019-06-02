import Integration from 'now-integration';
import StoryblockClient from '../utils/storyblok-client';

const spacesActions = (app: Integration) => {
  app.use('connect-space/:spaceId', async ({utils, zeitClient}, next) => {
    const {token} = utils.store;
    const {spaceId} = utils.params;

    const client = new StoryblockClient(token);
    const space = await client.getSpace(spaceId);

    const secretName = await zeitClient.ensureSecret('storyblok-token', space.first_token);
    await zeitClient.upsertEnv(utils.projectId, 'STORYBLOK_TOKEN', secretName);

    utils.projectStore.connected = true;
    utils.projectStore.space = {
      accountId: utils.store.user.userId,
      id: space.id,
      name: space.name,
      webhook: space.story_published_hook
    };

    utils.store.projects = [...new Set([...(utils.store.projects || []), utils.projectId]).values()];

    await utils.saveStore();
    next();
  });

  app.use('disconnect-space/:projectId', async ({utils}, next) => {
    const {store, saveStore} = utils;
    const projectStore = store[utils.params.projectId];

    if (projectStore.hook) {
      const {token} = utils.store;
      const client = new StoryblockClient(token);

      await client.updateSpace(projectStore.space.id, {story_published_hook: null});

      delete projectStore.hook;
    }

    delete projectStore.space;

    projectStore.connected = false;
    utils.store.projects = (utils.store.projects || []).filter((projectId: string) => projectId !== utils.params.projectId);
    await saveStore();
    next();
  });

  app.use('set-webhook', async ({utils, zeitClient, payload}, next) => {
    const {team} = payload;
    const {token} = utils.store;

    const client = new StoryblockClient(token);

    const aliasId = utils.get('alias');
    const path = utils.get('path') as any || '';

    const {alias} = await zeitClient.fetchAndThrow(`/v2/now/aliases/${aliasId}${team ? `?teamId=${team.id}` : ''}`, {method: 'GET'}) as any;

    const prefixedPath = `${path.startsWith('/') ? '' : '/'}${path}`;
    const url = `https://${alias}${prefixedPath}`;

    await client.updateSpace(utils.projectStore.space.id, {story_published_hook: url});

    utils.projectStore.hook = {
      aliasId,
      alias,
      path: prefixedPath
    };

    await utils.saveStore();
    next();
  });

  app.use('create-space/:mode', async ({utils}, next) => {
    const {mode} = utils.params;

    if (!utils.get('name')) {
      utils.context.error = 'Please provide a name';
      return utils.renderRoute(`view/create-space/${mode}`);
    }

    const {token} = utils.store;
    const client = new StoryblockClient(token);

    await client.createSpace(utils.get('name'), utils.get('spaceId'));
    next();
  });
}

export default spacesActions;
