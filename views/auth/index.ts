import Integration from "now-integration";

import TokenView from './token';
import LoginView from './login';
import SignupView from './signup';
import ResetPasswordView from './rest-password';

const authViews = (app: Integration) => {
  app.render('view/login/token', TokenView);
  app.render('view/login', LoginView);
  app.render('view/signup', SignupView);
  app.render('view/reset-password', ResetPasswordView);
};

export default authViews;
