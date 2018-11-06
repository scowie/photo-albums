import React, { Component } from 'react'
import { withAuthenticator } from 'aws-amplify-react'
import Navbar from './Navbar'
import Main from './Main'
import Amplify from 'aws-amplify'
import aws_exports from './aws-exports'

Amplify.configure(aws_exports)

class App extends Component {
  render () {
    return (
      <div>
        <Navbar />
        <Main />
      </div>
    )
  }
}

export default withAuthenticator(App)
