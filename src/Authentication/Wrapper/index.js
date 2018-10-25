import React, { Component } from "react";
import SignIn from "../SignIn";
import SignUp from "../SignUp";
import RequireNewPassword from "../RequireNewPassword";
import App from "../../App"

import {
  INIT,
  SIGN_UP,
  SIGN_IN,
  CONFIRM_SIGN_UP,
  CONFIRM_SIGN_IN,
  REQUIRE_NEW_PASSWORD,
  TOTP_SETUP,
  VERIFY_CONTACT,
  // ERROR,
  SIGNED_IN
} from "../service";

export class Authentication extends Component {
  constructor(props) {
    super(props);
    this.handleChangeAuthStatus = this.handleChangeAuthStatus.bind(this);
    this.getAuthProps = this.getAuthProps.bind(this);
    this.state = {
      authStatus: INIT,
      authData: null,
      authError: null
    };
  }

  getAuthProps() {
    return {
      changeAuthStatus: this.handleChangeAuthStatus,
      ...this.state
    };
  }

  handleChangeAuthStatus(authStatus, authData = null, authError = null) {
    console.log(authStatus, authData, authError);
    this.setState({
      authStatus,
      authData,
      authError
    });
  }

  render() {
    const authProps = this.getAuthProps();
    switch (this.state.authStatus) {
      case INIT:
      case SIGN_IN:
        return <SignIn {...authProps} />;

      case SIGN_UP:
        return <SignUp {...authProps} />;

      case CONFIRM_SIGN_UP:
        return <div>{CONFIRM_SIGN_UP} - Placeholder</div>;

      case CONFIRM_SIGN_IN:
        return <div>{CONFIRM_SIGN_IN} - Placeholder</div>;

      case REQUIRE_NEW_PASSWORD:
        return <RequireNewPassword {...authProps} />;

      case TOTP_SETUP:
        return <div>{TOTP_SETUP} - Placeholder</div>;

      case VERIFY_CONTACT:
        return <div>{VERIFY_CONTACT} - Placeholder</div>;

      case SIGNED_IN:
          return <App />
        
      default:
        return <div>No Matching State for: {this.state.authStatus}</div>;
    }
  }
}

export default Authentication;
