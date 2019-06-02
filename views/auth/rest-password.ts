import {RouteOptions} from 'now-integration';
import {htm} from '@zeit/integration-utils';

import applyAuthLayout from './layout';

const ResetPasswordView = (options: RouteOptions) => {
  const {email = ''} = options.payload.clientState;
  return applyAuthLayout(options, htm`
    <Input name="email" placeholder="Email" value=${email}/>
    <BR/>
    <Box display="flex" alignItems="center">
      <Button action="reset-password" small highlight>Send password reset link</Button>
    </Box>
    <P><Link action="view/login">Switch to login</Link></P>
  `);
};

export default ResetPasswordView;
