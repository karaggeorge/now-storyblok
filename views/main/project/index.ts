import {RouteOptions} from 'now-integration';
import {htm} from '@zeit/integration-utils';

import applyMainLayout from '../layout';
import ManageProject from './manage';
import SpaceList from './space-list';

const ConnectProject = async (options: RouteOptions) => {
  const query = options.utils.get('query') || '';

  return htm`
    <H2>Connect your project to a Storyblok space</H2>
    <Fieldset>
      <FsContent>
        ${await SpaceList(options)}
      </FsContent>
      <FsFooter>
        <Box width="100%" display="flex" justifyContent="space-between" paddingRight="20px" alignItems="center">
          <Box display="flex" alignItems="center">
            <Input value=${query} name="query" placeholder="Search Projects"/>
            <Box width="10px"/>
            <Button small>Search</Button>
          </Box>
          <Button small highlight action="view/create-space/new">Create new space</Button>
        </Box>
      </FsFooter>
    </Fieldset>
  `;
}


const Project = (options: RouteOptions) => {
  if (options.utils.projectStore.connected) {
    return ManageProject(options);
  }

  return ConnectProject(options);
};

const ProjectView = async (options: RouteOptions) => {
  return applyMainLayout(options, htm`
    ${await Project(options)}
    <Box display="flex" justifyContent="flex-end" marginTop="20px">
      Working with
      <Box width="6px"/>
      <ProjectSwitcher/>
    </Box>
  `);
};

export default ProjectView;
