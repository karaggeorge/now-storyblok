import {RouteOptions} from 'now-integration';
import {htm} from '@zeit/integration-utils';

import {LOGO_FULL} from '../constants';

const ExternalLoginView = ({utils}: RouteOptions) => {
  const {user: {userId}, token} = utils.store;
  const loginUrl = `https://app.storyblok.com/#!/external_login?access_token=${token}&user_id=${userId}`;

  return htm`
    <Page>
      <Box
        width="100%"
        height="100%"
        display="flex"
        flexDirection="column"
        alignItems="center"
        marginTop="30px"
        textAlign="center"
      >
        <Img src=${LOGO_FULL} width="200px"/>
        <Box
          marginTop="30px"
          display="flex"
          flex-direction="column"
          padding="30px"
          width="100%"
          maxWidth="360px"
        >
          <H2>Welcome to the Storyblok integration!</H2>
          <Box>If you're not logged in on the Storyblok website with this account, click the button below to be automatically connected</Box>
          <BR/>
          <Link href=${loginUrl} target="_blank">
            <Button highlight shadow>Connect</Button>
          </Link>
          <Box dispaly="flex" justifyContent="center" marginTop="10px">
            <Link action="view">Skip →</Link>
          </Box>
        </Box>
      </Box>
    </Page>
  `;
}

export default ExternalLoginView;
