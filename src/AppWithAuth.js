import React, { Component } from 'react'
import Authentication, { configureAmplifyAuth } from "./Authentication"

configureAmplifyAuth()

class AppWithAuth extends Component {
    render(){
      return (
        <Authentication />
      );
    }
  }
  
  export default AppWithAuth;