import React, { Component } from 'react'
import { withAuthenticator } from 'aws-amplify-react'
import Navbar from './Navbar'
import Main from './Main'


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
