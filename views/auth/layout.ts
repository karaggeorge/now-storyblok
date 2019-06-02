import {RouteOptions} from 'now-integration';
import {htm} from '@zeit/integration-utils';

import {LOGO_FULL} from '../../constants';

const applyAuthLayout = (options: RouteOptions, View: any) => {
  const {error, message} = options.utils.context
  return htm`
    <Page>
      <Box
        width="100%"
        height="100%"
        display="flex"
        flexDirection="column"
        alignItems="center"
        marginTop="30px"
      >
        <Img src=${LOGO_FULL} width="200px"/>
        <Box
          marginTop="30px"
          background="#eff1f5"
          display="flex"
          flex-direction="column"
          padding="30px"
          width="100%"
          maxWidth="360px"
          fontSize="12px"
          borderRadius="4px"
        >
          ${View}
        </Box>
        ${
          error ? htm`
            <Box width="100%" maxWidth="360px" marginTop="10px" fontSize="12px">
              <Notice type="error">${error}</Notice>
            </Box>
          ` : ''
        }
        ${
          message ? htm`
            <Box width="100%" maxWidth="360px" marginTop="10px" fontSize="12px">
              <Notice type="message">${message}</Notice>
            </Box>
          ` : ''
        }
      </Box>
    </Page>
  `;
};

export default applyAuthLayout;
