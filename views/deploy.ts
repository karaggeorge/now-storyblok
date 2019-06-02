import {RouteOptions} from 'now-integration';
import {htm} from '@zeit/integration-utils';
import applyMainLayout from './main/layout';
import TECHS from '../utils/deploy-project';
import StoryblockClient from '../utils/storyblok-client';

const getColor = (state: string) => {
  switch(state) {
    case 'READY':
      return '#51e3c2';
    default:
      return '#f5a523';
  }
};

const DoneView = async (options: RouteOptions) => {
  const {utils, payload: {team, user, configurationId}} = options;
  const projectId = options.utils.get('projectId') as string;

  const projectStore = utils.store[projectId];
  const {meta, space} = projectStore;
  const tech = TECHS[meta.tech];
  const account = team ? team.slug : user.username;

  const {token} = utils.store;
  const client = new StoryblockClient(token);
  const stories = await client.getStories(space.id);

  const published = stories.filter((story: any) => story.published);

  return htm`
    <Fieldset>
      <FsContent>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <FsTitle>
            <Box display="flex" alignItems="center">
              Project
              <Box width="5px"/>
              <Link href=${`https://zeit.co/${account}/${meta.projectName}`} target="_blank">
                <Box cursor="pointer">${meta.projectName}</Box>
              </Link>
            </Box>
          </FsTitle>
          <Box display="flex" alignItems="center" lineHeight="1">
            ${tech.name}
            <Box width="20px"/>
            <Box width="10px" height="10px" borderRadius="50%" background=${getColor(meta.readyState)}/>
            <Box width="5px"/>
            <Box fontSize="12px">${meta.readyState}</Box>
          </Box>
        </Box>
        <P>
          Your deployment,
          <Link href=${`https://${meta.deploymentUrl}`} target="_blank">
            ${meta.deploymentUrl}
          </Link>
          is ready! If you have any published stories, you can now view them in that url.
        </P>
      </FsContent>
      <FsFooter>
        <Box width="100%" display="flex" justifyContent="space-between" alignItems="center">
          <P>
            If you want to further manage the project you can switch to the
            <Link href=${`https://zeit.co/${account}/${meta.projectName}/integrations/${configurationId}`}>project view</Link>
          </P>
          <Box display="flex" alignItems="center">
            <Link href=${`https://api.github.com/repos/${tech.repo}/zipball/${tech.ref}`} target="_blank"><Button small secondary>Download Source</Button></Link>
            ${
              tech.tutorial ? htm`
                <Box width="10px"/>
                <Link href=${tech.tutorial} target="_blank"><Button small secondary>Tutorial</Button></Link>
              ` : ''
            }
          </Box>
        </Box>
      </FsFooter>
    </Fieldset>
    <Fieldset>
      <FsContent>
        <Box display="flex" justifyContent="space-between">
          <FsTitle>Space</FsTitle>
          <Box>${space.name}</Box>
        </Box>
        <P>
          An environment <B>${meta.projectName}</B> has been setup in your space and linked to this deployment.
          <BR/>
          <BR/>
          You can use that to easily
          <Link href=${`https://app.storyblok.com/#!/me/spaces/${space.id}/stories?env=${meta.projectName}`} target="_blank">edit</Link>
          your deployment's content
        </P>
      </FsContent>
      <FsFooter>
          <Box width="100%" display="flex" justifyContent="flex-end">
            <Link href=${`https://app.storyblok.com/#!/me/spaces/${space.id}/stories?env=${meta.projectName}`} target="_blank"><Button small secondary>Edit content</Button></Link>
            <Box width="10px"/>
            <Link href=${`https://app.storyblok.com/#!/me/spaces/${space.id}`} target="_blank"><Button small secondary>Manage Space</Button></Link>
          </Box>
      </FsFooter>
    </Fieldset>
  `;
}

const Deployment = async (options: RouteOptions) => {
  const {utils, zeitClient, payload: {team, user}} = options;
  const projectId = options.utils.get('projectId') as string;

  const projectStore = utils.store[projectId];
  const {meta, space} = projectStore;
  const tech = TECHS[meta.tech];

  if (meta.done) {
    return DoneView(options);
  }

  const deployment = await zeitClient.fetchAndThrow(`/v9/now/deployments/${meta.deploymentId}`, {method: 'GET'});

  meta.readyState = deployment.readyState;
  meta.done = deployment.readyState === 'READY' || deployment.readyState === 'ERROR';
  await utils.saveStore();

  if (meta.done) {
    return DoneView(options);
  }

  const {token} = utils.store;
  const client = new StoryblockClient(token);
  const stories = await client.getStories(space.id);

  const published = stories.filter((story: any) => story.published);
  const account = team ? team.slug : user.username;

  return htm`
    <AutoRefresh timeout="3000" action="view/deploy"/>
    <Fieldset>
      <FsContent>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <FsTitle>
            <Box display="flex" alignItems="center">
              Deploying
              <Box width="5px"/>
              <Link href=${`https://zeit.co/${account}/${meta.projectName}`} target="_blank">
                <Box cursor="pointer">${meta.projectName}</Box>
              </Link>
            </Box>
          </FsTitle>
          <Box display="flex" alignItems="center" lineHeight="1">
            ${tech.name}
            <Box width="20px"/>
            <Box width="10px" height="10px" borderRadius="50%" background=${getColor(meta.readyState)}/>
            <Box width="5px"/>
            <Box fontSize="12px">${meta.readyState}</Box>
          </Box>
        </Box>
        <P>
          This might take a few minutes. This page will automatically update when it's ready
          <BR/>
          <BR/>
          Until then, you can
          <Link href=${`https://api.github.com/repos/${tech.repo}/zipball/${tech.ref}`} target="_blank">download</Link>
          the source code and start exploring it
          ${
            tech.tutorial ? htm`
              or go through the <Link href=${tech.tutorial} target="_blank">tutorial</Link>
            ` : ''
          }
        </P>
      </FsContent>
    </Fieldset>
    <Fieldset>
      <FsContent>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <FsTitle>Space</FsTitle>
          <Box>${space.name}</Box>
        </Box>
        <P>
          An environment <B>${meta.projectName}</B> has been setup in your space and linked to this deployment.
        </P>
        ${
          published.length ? htm`
            You have ${published.length} published ${`stor${published.length === 1 ? 'y.' : 'ies.'}`} You'll be able to view and edit them when the deployment is ready!
          ` : htm`
            <P>
              You have no published stories. The deployment won't be able to display any pages until you
              <Link href=${`https://app.storyblok.com/#!/me/spaces/${space.id}/stories`} target="_blank">publish some stories</Link>
            </P>
          `
        }
      </FsContent>
      <FsFooter>
          <Box width="100%" display="flex" justifyContent="flex-end">
            <Link href=${`https://app.storyblok.com/#!/me/spaces/${space.id}`}><Button small secondary>Manage Space</Button></Link>
          </Box>
      </FsFooter>
    </Fieldset>
  `;
};

const DeployView = async (options: RouteOptions) => {
  const projectId = options.utils.get('projectId');

  if (!projectId) {
    return options.utils.renderRoute('view');
  }

  return applyMainLayout(options, htm`
    <Box display="flex" flexDirection="column">
      <Box display="none">
        <Input name="projectId" value=${projectId}/>
      </Box>
      ${await Deployment(options)}
    </Box>
  `);
}

//<Button action="view/deploy">Refresh</Button>

export default DeployView;
