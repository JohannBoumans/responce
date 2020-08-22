import React, {Fragment} from 'react';
import NavBar from "./NavBar";
import Footer from "./Footer";


const Layout = ({children}) => {
  return (
    <Fragment>
      <NavBar/>
      <main id="main">
        {children}
      </main>

    </Fragment>
  );
};

export default Layout;
