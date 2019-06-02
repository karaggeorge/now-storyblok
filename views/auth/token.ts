import {RouteOptions} from 'now-integration';
import {htm} from '@zeit/integration-utils';

import applyAuthLayout from './layout';

const TokenView = (options: RouteOptions) => {
  const {token = ''} = options.payload.clientState;
  return applyAuthLayout(options, htm`
    <Input name="token" placeholder="Token" value=${token}/>
    <BR/>
    <Box display="flex" alignItems="center">
      <Button action="login/token" small highlight>Connect</Button>
    </Box>
    <P>
      Use email/password instead? <Link action="view/login">Click here</Link>
      <BR/>
      No account yet? <Link action="view/signup">Signup here</Link>
    </P>
  `);
};

export default TokenView;
