import {RouteOptions} from 'now-integration';
import {htm} from '@zeit/integration-utils';

import StoryblokClient from '../../../utils/storyblok-client';

const SpaceList = async (options: RouteOptions) => {
  const {utils} = options;
  const {token} = utils.store;

  const query = utils.get('query') as string;
  const client = new StoryblokClient(token);
  const spaces = await client.getSpaces(query);

  if (spaces.length === 0) {
    return htm`
      <FsTitle>You have no spaces yet</FsTitle>
      <FsSubtitle>Create your first space below</FsSubtitle>
    `;
  }

  spaces.sort((a: any, b: any) => b.apiHits - a.apiHits);

  return htm`
    <FsTitle>Select a space to continue</FsTitle>
    <Box position="relative">
      <Box display="flex" flexDirection="column" width="100%" height="388px" overflowY="scroll" paddingTop="20px" paddingBottom="20px">
        <Box display="flex" width="100%" height="20px" position="absolute" top="0" background="linear-gradient(0deg, rgba(255,255,255,0) 0%, #fff 100%)" zIndex="1"/>
        <Box display="flex" width="100%" height="20px" position="absolute" bottom="0" background="linear-gradient(-180deg, rgba(255,255,255,0) 0%, #fff 100%)" zIndex="1"/>
        ${
          spaces.map((space: any) => htm`
            <Box
              display="flex"
              marginTop="5px"
              marginBottom="5px"
              borderRadius="5px"
              border="1px solid #eaeaea"
              background="#fafafa"
              alignItems="center"
              padding="20px"
            >
              <Box
                flex="1"
                fontSize="14px"
                fontWeight="500"
                overflow="hidden"
                textOverflow="ellipsis"
                whiteSpace="nowrap"
              >
                <Box width="max-content">
                  <Link href=${`https://app.storyblok.com/#!/me/spaces/${space.id}/dashboard`} target="_blank">
                    <Box color="#000" fontWeight="500">${space.name}</Box>
                  </Link>
                </Box>
              </Box>
              <Box paddingLeft="5px">
                ${space.apiHits > 0 ? `${space.apiHits} API hit${space.apiHits === 1 ? '' : 's'} this month` : ' '}
              </Box>
              <Box paddingLeft="50px">
                ${`${space.stories_count} Stor${space.stories_count === 1 ? 'y' : 'ies'}`}
              </Box>
              <Box paddingLeft="50px" display="flex" justifyContent="flex-end">
                <Button small highlight action=${`connect-space/${space.id}`}>Connect</Button>
              </Box>
            </Box>
          `)
        }
      </Box>
    </Box>
  `;
}

export default SpaceList;
