import {RouteOptions} from 'now-integration';
import {htm} from '@zeit/integration-utils';

import {LOGO} from '../../constants';

const applyMainLayout = ({utils}: RouteOptions, View: any) => {
  const {user: {email, userId}, token} = utils.store;
  const loginUrl = `https://app.storyblok.com/#!/external_login?access_token=${token}&user_id=${userId}`;

  return htm`
    <Page>
      <Box
        width="100%"
        height="100%"
        display="flex"
        flexDirection="column"
        alignItems="center"
      >
        <Box marginBottom="40px" display="flex" justifyContent="space-between" alignItems="center" fontSize="12px" width="100%">
          <Box display="flex" alignItems="center">
            <Box marginTop="14px"><Img src=${LOGO} height="40px" width="auto"/></Box>
            <Box width="10px"/>
            Signed in as
            <Box width="4px"/>
            <B>${email}</B>
          </Box>
          <Box display="flex" alignItems="center">
            <Link href=${loginUrl} target="_blank">
              <Button small secondary>View Account</Button>
            </Link>
            <Box width="5px"/>
            <Button small warning action="logout">Logout</Button>
          </Box>
        </Box>
        <Box
          marginTop="5px"
          display="flex"
          flex-direction="column"
          width="100%"
          fontSize="14px"
        >
          ${View}
        </Box>
      </Box>
    </Page>
  `;
};

export default applyMainLayout;
