import Integration from 'now-integration';

import MainView from './views/main';
import authActions from './actions/auth';
import authViews from './views/auth/index';
import spacesActions from './actions/spaces';
import CreateSpaceView from './views/create-space';
import deployActions from './actions/deploy';
import DeployView from './views/deploy';

const app = new Integration({defaultRoute: MainView});

app.extend(authActions);
app.extend(authViews);
app.extend(spacesActions);
app.extend(deployActions);

app.render('view/create-space/:mode', CreateSpaceView);
app.render('view/deploy', DeployView);

export default app.handler;
