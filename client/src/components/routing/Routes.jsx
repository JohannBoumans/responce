import React from 'react';
import Alert from "../layout/Alert";
import Register from "../auth/Register";
import Login from "../auth/Login";
import PrivateRoute from "./PrivateRoute";


import NotFound from "../layout/NotFound";
import { Route, Switch} from 'react-router-dom';


const Routes = () => {
  return (
    <section className="container">
      <Alert/>
      <Switch>
        <Route exact path='/register' component={Register} />
        <Route exact path='/login' component={Login} />
        <Route component={NotFound} />
      </Switch>
    </section>
  );
};

export default Routes;
