import {RouteOptions} from 'now-integration';
import {htm} from '@zeit/integration-utils';

import applyAuthLayout from './layout';

const LoginView = (options: RouteOptions) => {
  const {email = '', password = ''} = options.payload.clientState;
  return applyAuthLayout(options, htm`
    <Input type="email" name="email" placeholder="Email" value=${email}/>
    <BR/>
    <Input type="password" name="password" placeholder="Password" value=${password}/>
    <BR/>
    <Box display="flex" justifyContent="space-between" alignItems="center">
      <Button action="login/email" small highlight>Login</Button>
      <Link action="view/reset-password"> Forgot Password?</Link>
    </Box>
    <P>
      Use a token instead? <Link action="view/login/token">Click here</Link>
      <BR/>
      No account yet? <Link action="view/signup">Signup here</Link>
    </P>
  `);
};

export default LoginView;
