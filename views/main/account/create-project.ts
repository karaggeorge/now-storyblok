import {RouteOptions} from 'now-integration';
import {htm} from '@zeit/integration-utils';

import StoryblokClient from '../../../utils/storyblok-client';
import DeploymentTechs from './deployment-techs';

const CreateProjectView = async (options: RouteOptions) => {
  const {utils} = options;
  const {token} = utils.store;

  const selectedSpace = utils.get('selectedSpace') || '';

  const client = new StoryblokClient(token);
  const spaces = await client.listSpaces();

  if (spaces.length === 0) {
    return htm`
      <FsTitle>You have no spaces yet</FsTitle>
      <FsSubtitle>Create your first space below</FsSubtitle>
    `;
  }

  spaces.sort((a: any, b: any) => a.name.localeCompare(b.name));

  return htm`
    <Box display="flex" height="400px">
      <Box flex="2" height="100%" position="relative">
        <Box display="none">
          <Input name="selectedSpace" value=${selectedSpace} />
        </Box>
        <Box
          width="100%"
          height="100%"
          overflowY="scroll"
          display="flex"
          flexDirection="column"
          paddingTop="20px"
          paddingBottom="20px"
          paddingRight="15px"
        >
          <Box display="flex" width="100%" height="20px" position="absolute" top="0" background="linear-gradient(0deg, rgba(250,250,250,0) 0%, #fafafa 100%)" zIndex="2"/>
          <Box display="flex" width="100%" height="20px" position="absolute" bottom="0" background="linear-gradient(-180deg, rgba(250,250,250,0) 0%, #fafafa 100%)" zIndex="2"/>
          ${
            spaces.map((space: any) => htm`
              <Box
                display="flex"
                marginTop="5px"
                marginBottom="5px"
                border=${`1px solid ${selectedSpace === space.id.toString() ? '#000': '#eaeaea'}`}
                background="#fff"
                alignItems="center"
                borderRadius="5px"
                position="relative"
                height="45px"
                zIndex="1"
              >
                <Link action=${`select-project/${space.id}`} target="_blank">
                  <Box
                    height="45px"
                    width="calc((100vw - 40px) * 0.4)"
                    maxWidth="416px"
                    color="#000"
                    background="transparent"
                  />
                </Link>
                <Box
                  position="absolute"
                  width="100%"
                  height="100%"
                  top="0"
                  left="0"
                  padding="10px 15px"
                  display="flex"
                  alignItems="center"
                  zIndex="-1"
                >
                  ${space.name}
                </Box>
              </Box>
            `)
          }
        </Box>
      </Box>
      <Box flex="3" padding="20px 0">
          ${await DeploymentTechs(options)}
      </Box>
    </Box>
  `;
}

export default CreateProjectView;
