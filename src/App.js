import React, { Component } from 'react'
import { withAuthenticator } from 'aws-amplify-react'
import Navbar from './Navbar'
import Main from './Main'
import Amplify from 'aws-amplify'
import './App.css'
import aws_exports from './aws-exports'

Amplify.configure(aws_exports)

class App extends Component {
  render () {
    return (
      <div>
        <Navbar />
          <main className="layout-main">
            <div className="layout-main__content">
              <Main />
            </div>
          </main>
      </div>
    )
  }
}

export default withAuthenticator(App)
