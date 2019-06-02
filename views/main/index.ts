import {RouteOptions} from 'now-integration';
import ProjectView from './project';
import AccountView from './account';

const MainView = (options: RouteOptions) => {
  const {projectId} = options.utils;
  const View =  projectId ? ProjectView : AccountView;
  return View(options);
}

export default MainView;
