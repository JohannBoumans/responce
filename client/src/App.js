import React, {Fragment, useEffect} from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import Landing from './components/homepage/Landing';
import Routes from "./components/routing/Routes";

//Redux
import { Provider } from 'react-redux';
import store from './store';
import './App.css';
import setAuthToken from "./utils/setAuthToken";
import {loadUser} from "./actions/auth";
import Layout from "./components/layout/Layout";



if(localStorage.token){
  setAuthToken(localStorage.token);
}

const App = () => {

  useEffect(() => {
    store.dispatch(loadUser());
  }, []);

  return(
    <Provider store={store}>
      <Router>
        <Fragment>
          <Layout>
            <Switch>
              <Route exact path='/' component={Landing}/>
              <Routes component={Routes}/>
            </Switch>
          </Layout>
        </Fragment>
      </Router>
    </Provider>
  );
};


export default App;
