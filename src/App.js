import React, { Component } from 'react';
import { Header } from 'semantic-ui-react';
import Amplify from 'aws-amplify';
import aws_exports from './aws-exports';
import { withAuthenticator } from 'aws-amplify-react';
Amplify.configure(aws_exports);

class App extends Component { 
  render() { 
    return (
      <div>
        <Header as='h1'>Hello World!</Header>
      </div>
    );
  }
}

export default withAuthenticator(App, {includeGreetings: true});
