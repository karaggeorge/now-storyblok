import {RouteOptions} from 'now-integration';
import {htm} from '@zeit/integration-utils';

import StoryblokClient from '../../../utils/storyblok-client';
import TECHS from '../../../utils/deploy-project';

const Tech = ({name, image, tutorial, slug, selected}: {name: string; image: string; tutorial: string, slug: string, selected: boolean}) => htm`
  <Box margin="0 10px" position="relative" zIndex="1">
    <Box
      padding="10px"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      width="150px"
      height="165px"
      border=${`1px solid ${selected ? '#000' : '#e0e0e0'}`}
      borderRadius="5px"
      background="#fff"
      position="absolute"
      top="0"
      left="0"
      zIndex="3"
      pointerEvents="none"
    >
      <Img src=${image} width=${tutorial ? '75px' : '55px'}/>
      <P><Box color="#000" textDecorationColor="#000">${name}</Box></P>
      <Box display="flex" justifyContent="center">
        <Box pointerEvents="all"><Button secondary small action=${`deploy/${slug}`}>🚀</Button></Box>
        <Box width="5px"/>
        ${
          tutorial ? htm`
            <Box pointerEvents="all"><Link href=${tutorial} target="_blank"><Button secondary small>Tutorial</Button></Link></Box>
          ` : ''
        }
      </Box>
    </Box>
    <Link action=${`select-tech/${slug}`}>
      <Box width="150px" height="165px" background="transparent" zIndex="2"/>
    </Link>
  </Box>
`;

const DeploymentTechs = async (options: RouteOptions) => {
  const {utils} = options;

  const selectedSpace = utils.get('selectedSpace');
  const selectedTech = utils.get('selectedTech') || '';

  if (!selectedSpace) {
    return htm`
      <Box width="100%" height="100%" display="flex" justifyContent="center" alignItems="center">
        <Box fontSize="20px" fontWeight="bold">←</Box>
        <Box width="10px"/>
        <H2>1. Please select a space from the list</H2>
      </Box>
    `;
  }

  return htm`
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100%" width="100%">
      <Box display="none">
        <Input name="selectedTech" value=${selectedTech} />
      </Box>
      <H2>2. Select a framework</H2>
      <Box display="flex" justifyContent="center" marginBottom="30px">
        ${
          Object.values(TECHS).map((tech: any) => htm`
            <${Tech}
              name=${tech.name}
              image=${tech.image}
              tutorial=${tech.tutorial}
              slug=${tech.slug}
              selected=${selectedTech === tech.slug}
            />
          `)
        }
      </Box>
      ${
        selectedTech ? htm`
          <H2>3. Deploy</H2>
          <Button highlight shadow action=${`deploy/${selectedTech}`}>Deploy</Button>
        ` : ''
      }
    </Box>
  `;
}

export default DeploymentTechs;
