import React, { Component } from "react";
import { AuthCompleteNewPassword } from "../service";

export class EntrySignIn extends Component {
  constructor(props) {
    super(props);
    this.handleCompleteNewPassword = this.handleCompleteNewPassword.bind(this);
    this.state = {
      newPassword: "",
      error: null
    };
  }

  componentDidMount() {
    console.log(this.props);
  }

  handleCompleteNewPassword(e) {
    const { changeAuthStatus, authData } = this.props;
    e.preventDefault();
    AuthCompleteNewPassword(authData, this.state.newPassword)
      .then(({ authStatus, authData }) =>
        changeAuthStatus(authStatus, authData)
      )
      .catch(({ authStatus, authData, authError }) =>
        changeAuthStatus(authStatus, authData, authError)
      );
  }

  render() {
    return (
      <form onSubmit={this.handleCompleteNewPassword}>
        <h2>
          Welcome, ${`user`}. this looks to be your first time signing in...
        </h2>
        <p>Please update your password from your temporary password.</p>
        <div>
          <div>
            <label htmlFor="username">New Password</label>
          </div>
          <input
            id="newPassword"
            name="newPassword"
            type="newPassword"
            onChange={({ target: { value: newPassword } }) =>
              this.setState({ newPassword })
            }
            value={this.state.newPassword}
          />
        </div>
        <input
          onClick={this.handleCompleteNewPassword}
          type="submit"
          value="Update password"
        />
        {this.state.error ? (
          <div>Error! {JSON.stringify(this.state.error)}</div>
        ) : null}
      </form>
    );
  }
}

export default EntrySignIn;
