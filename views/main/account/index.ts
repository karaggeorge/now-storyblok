import {RouteOptions} from 'now-integration';
import {htm} from '@zeit/integration-utils';

import applyMainLayout from '../layout';
import { CHECK } from '../../../constants';
import CreateProjectView from './create-project';

const ProjectsList = async (options: RouteOptions) => {
  const {projects = []} = options.utils.store;

  if (projects.length === 0) {
    return htm`
      <FsTitle>There are no connected projects yet</FsTitle>
      <FsSubtitle>Connect your first project below</FsSubtitle>
    `;
  }

  const {team, configurationId, user} = options.payload;
  const allProjects = await options.zeitClient.fetchAndThrow('/v1/projects/list', {method: 'GET'});
  const account = team ? team.slug : user.username;

  return htm`
    <FsTitle>Connected Projects</FsTitle>
    <Box display="flex" flexDirection="column" borderRadius="5px" border="1px solid #eaeaea" width="100%" marginTop="15px">
      <Box display="flex" fontWeight="500" fontSize="14px" padding="10px" background="#fafafa">
        <Box flex="1">Project Name</Box>
        <Box marginLeft="10px" width="100px">Space</Box>
        <Box marginLeft="40px" width="75px" display="flex" justifyContent="center">Webhook</Box>
        <Box marginLeft="50px" minWidth="165px">Actions</Box>
      </Box>
      ${
        projects.map((projectId: string) => {
          const project = options.utils.store[projectId];
          const {name} = allProjects.find(({id}: any) => id === projectId) || {name: ''};

          return htm`
            <Box display="flex" fontSize="12px" padding="10px" borderTop="1px solid #eaeaea">
              <Box flex="1">${name}</Box>
              <Box marginLeft="10px" width="100px" overflow="hidden">${project.space && project.space.name}</Box>
              <Box marginLeft="40px" width="75px" display="flex" justifyContent="center" alignItems="center">
                ${project.hook ? htm`<Img src=${CHECK} width="17px" height="17px"/>` : ''}
              </Box>
              <Box marginLeft="50px" minWidth="165px" display="flex" whiteSpace="nowrap" textOverflow="ellipsis">
                <Link href=${`https://zeit.co/${account}/${name}/integrations/${configurationId}`}><Button small secondary>View</Button></Link>
                <Box width="10px"/>
                <Button small warning action=${`disconnect-space/${projectId}`}>Disconnect</Button>
              </Box>
            </Box>
          `;
        })
      }
    </Box>
  `;
};

const AccountView = async (options: RouteOptions) => {
  const [projectsList, createProject] = await Promise.all([
    ProjectsList(options),
    CreateProjectView(options)
  ]);

  return applyMainLayout(options, htm`
    <H1>Existing projects</H1>
    <Fieldset>
      <FsContent>
        ${projectsList}
      </FsContent>
      <FsFooter>
        <Box width="100%" display="flex" justifyContent="space-between" alignItems="center">
          Connect a different project
          <ProjectSwitcher />
        </Box>
      </FsFooter>
    </Fieldset>
    <BR/>
    <H1>Create a new project</H1>
    ${createProject}
  `);
};

export default AccountView;
