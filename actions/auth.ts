import Integration from 'now-integration';
import StoryblockClient from '../utils/storyblok-client';

const authActions = (app: Integration) => {
  app.use('logout', async ({utils}, next) => {
    delete utils.store.token;
    delete utils.store.user;
    await utils.saveStore();
    next();
  });

  app.use('login/:type', async ({utils, payload}, next) => {
    const client = new StoryblockClient();
    const {token, meta, error} = await client.login(utils.params.type, payload.clientState);

    if (error) {
      utils.context.error = error.payload;
      return utils.renderRoute(error.route);
    }

    utils.store.user = meta;
    utils.store.token = token;
    await utils.saveStore();
    return utils.renderRoute('view/external-login');
  });

  app.use('signup', async ({utils, payload}, next) => {
    const client = new StoryblockClient();
    const {token, meta, error} = await client.signup(payload.clientState);

    if (error) {
      utils.context.error = error.payload;
      return utils.renderRoute(error.route);
    }

    utils.store.user = meta;
    utils.store.token = token;
    await utils.saveStore();
    return utils.renderRoute('view/external-login');
  });

  app.use('reset-password', async ({utils, payload}) => {
    const client = new StoryblockClient();
    const {error} = await client.resetPassword(payload.clientState);

    if (error) {
      utils.context.error = error.payload;
      return utils.renderRoute(error.route);
    }

    utils.context.message = 'An reset password email has been sent!';
    return utils.renderRoute('view/login');
  });

  app.use(async ({utils}, next) => {
    if (
      utils.store.token ||
      utils.action.startsWith('view/login') ||
      utils.action.startsWith('view/signup') ||
      utils.action.startsWith('view/reset-password')
    ) {
      next();
    } else {
      return utils.renderRoute('view/login');
    }
  });
};

export default authActions;
