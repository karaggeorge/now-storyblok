import {RouteOptions} from 'now-integration';
import {htm} from '@zeit/integration-utils';

import applyAuthLayout from './layout';

const SignupView = (options: RouteOptions) => {
  const {email = '', password = '', confirmPassword = ''} = options.payload.clientState;
  return applyAuthLayout(options, htm`
    <Input type="email" name="email" placeholder="Email" value=${email}/>
    <BR/>
    <Input type="password" name="password" placeholder="Password" value=${password}/>
    <BR/>
    <Input type="password" name="confirmPassword" placeholder="Confirm Password" value=${confirmPassword}/>
    <Box fontSize="11px" marginTop="3px" marginLeft="1px">
      <P>By clicking "Signup" you accept the <Link href="https://www.storyblok.com/terms" target="_blank">terms of use</Link>.</P>
    </Box>
    <BR/>
    <Box display="flex" alignItems="center">
      <Button action="signup" small highlight>Signup</Button>
    </Box>
    <P>
      Already have an account? <Link action="view/login">Switch to login</Link>
    </P>
  `);
};

export default SignupView;
