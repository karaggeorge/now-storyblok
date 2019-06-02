import Integration from 'now-integration';
import TECHS, {deployTech} from '../utils/deploy-project';

import StoryblockClient from '../utils/storyblok-client';

const deployActions = (app: Integration) => {
  app.use('deploy/:slug', async ({zeitClient, utils, payload}, next) => {
    const {slug} = utils.params;

    if (TECHS[slug]) {
      const {token, user, projects} = utils.store;
      const client = new StoryblockClient(token);

      const space = await client.getSpace(utils.get('selectedSpace'));

      const {deployment, projectId, projectName} = await deployTech(slug, zeitClient, space.first_token);

      if (!utils.store[projectId]) {
        utils.store[projectId] = {};
      }
      const projectStore = utils.store[projectId];

      projectStore.connected = true;
      projectStore.space = {
        accountId: user.userId,
        id: space.id,
        name: space.name,
        webhook: space.story_published_hook
      }
      projectStore.meta = {
        tech: slug,
        deploymentId: deployment.id,
        deploymentUrl: deployment.url,
        projectName: projectName,
        readyState: 'INITIALIZING',
        done: false
      }

      utils.store.projects = [...new Set([...(projects || []), projectId]).values()];

      await utils.saveStore();
      await client.updateSpace(space.id, {
        domain: `https://${deployment.url}/`,
        environments: [
          ...(space.environments || []),
          { name: projectName, location: `https://${deployment.url}/` }
        ]
      });

      payload.clientState.projectId = projectId;
      return utils.renderRoute(`view/deploy/${projectId}`)
    } else {
      next();
    }
  });

  app.use('select-project/:spaceId', async ({utils, payload}, next) => {
    payload.clientState.selectedSpace = utils.params.spaceId;
    next();
  });

  app.use('select-tech/:slug', async ({utils, payload}, next) => {
    payload.clientState.selectedTech = utils.params.slug;
    next();
  });

  app.use('view/deploy/:projectId', async ({utils, payload}, next) => {
    payload.clientState.projectId = utils.params.projectId;
    next();
  });
}

export default deployActions;
