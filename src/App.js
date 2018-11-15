import React, { Component } from "react";
import { withAuthenticator } from "aws-amplify-react";
import Main from "./Main";
import Amplify from "aws-amplify";
import "./App.css";
import aws_exports from "./aws-exports";

Amplify.configure(aws_exports);

class App extends Component {
  render() {
    return <Main />;
  }
}

export default withAuthenticator(App);
