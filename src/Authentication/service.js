import Amplify, { Auth } from "aws-amplify";
import { config } from "./config";

export const INIT = "init";
export const SIGN_UP = "signUp";
export const SIGN_IN = "signIn";
export const CONFIRM_SIGN_IN = "confirmSignIn";
export const CONFIRM_SIGN_UP = "confirmSignUp";
export const REQUIRE_NEW_PASSWORD = "requireNewPassword";
export const TOTP_SETUP = "TOTPSetup";
export const SIGNED_IN = "signedIn";
export const VERIFY_CONTACT = "verifyContact";
export const ERROR = "error";

/**
 * Exported function to configure the Amplify service with the specific
 * credentials provided in the configuration file
 */
export const configureAmplifyAuth = () =>
  Amplify.configure({
    Auth: config.Auth
  });

/**
 * Checks to see if the contact is a particular point and if so
 * it will resolve the proper authStatus string
 * @param {object} user the Cognito user object
 */
export const AuthCheckContact = user => {
  return new Promise((resolve, reject) =>
    Auth.verifiedContact(user)
      .then(data => {
        if (!(Object.getOwnPropertyNames(data.verified).length === 0)) {
          resolve(SIGNED_IN);
        } else {
          user = Object.assign(user, data);
          resolve(VERIFY_CONTACT);
          return VERIFY_CONTACT;
        }
      })
      .catch(error => {
        console.log("Error in verifying the contact", error);
        reject(error);
      })
  );
};

/**
 * Determines which authStatus string should be returned based upon the
 * challenge that is provided from the AWS Cognito service.
 *
 * @param {object} user the user object that is returned from SignIn
 */
export const processUserChallenge = user => {
  if (
    user.challengeName === "SMS_MFA" ||
    user.challengeName === "SOFTWARE_TOKEN_MFA"
  ) {
    // console.log("confirm user with " + user.challengeName);
    return CONFIRM_SIGN_IN;
  } else if (user.challengeName === "NEW_PASSWORD_REQUIRED") {
    // console.log("require new password", challengeParam);
    return REQUIRE_NEW_PASSWORD;
  } else if (user.challengeName === "MFA_SETUP") {
    // console.log("TOTP setup", challengeParam);
    return TOTP_SETUP;
  } else {
    return AuthCheckContact(user)
      .then(authStatus => {
        return authStatus
      })
      .catch(error => error);
  }
};

/**
 * Determines which authStatus string should be returned based upon the
 * challenge that is provided from the AWS Cognito service.
 *
 * @param {object} user the user object that is returned from SignIn
 */
export const processUserException = ({ code }) =>
  code === "UserNotConfirmedException" ? CONFIRM_SIGN_UP : ERROR;

/**
 * Signs the user into the user pool and returns the Cognito session.
 * Based upon what the state of the user account is in, the promise
 * will resolve the property auth status string.
 *
 * @param {string} username the username of the user that they type in
 * @param {string} password the password of the user
 */
export const AuthSignIn = (username, password) =>
  new Promise((resolve, reject) =>
    {
      const resp = {
        authStatus: null,
        authData: null,
        authError: null
      }

      Auth.signIn(username, password)
      .then(user => resp.authData = user)
      .then(() => processUserChallenge(resp.authData))
      .then(status => resp.authStatus = status)
      .then(() => resolve(resp))
      .catch(authError => {
        reject({
          authStatus: processUserException(authError),
          authData: null,
          authError
        });
      })
    })

/**
 * Registers the user into user pool and returns the Cognito session.
 * Based upon what the state of the user account is in, the promise
 * will resolve the property auth status string.
 *
 * @param {string} username the username of the user that they type in
 * @param {string} password the password of the user
 * @param {object} attributes the attributes that should be assigned to the user
 */
export const AuthSignUp = (username, password, attributes) =>
  new Promise((resolve, reject) =>
    Auth.signUp({
      username,
      password,
      attributes
    })
      .then(user => {
        resolve({
          authStatus: CONFIRM_SIGN_UP,
          authData: username,
          authError: null
        });
      })
      .catch(authError => {
        reject({
          authStatus: processUserException(authError),
          authData: null,
          authError
        });
      })
  );

/**
 * Allows the user to update their password if they haven't been confirmed
 * before. Should be called when the user is required to enter a new password
 *
 * @param {object} user the Cognito user object of CognitoUser type
 * @param {string} newPassword the new password that the user decides to replace the temp one with
 */
export const AuthCompleteNewPassword = (user, newPassword) => {
  return new Promise((resolve, reject) => {
    Auth.completeNewPassword(
      user,
      newPassword,
      user.challengeParam.requiredAttributes
    )
      .then(user => {
        console.log(user);
        resolve({
          authStatus: processUserChallenge(user),
          authData: user,
          authError: null
        });
      })
      .catch(authError => {
        reject({
          authStatus: processUserException(authError),
          authData: null,
          authError
        });
      });
  });
};

/**
 * Gets the current session of the user
 */
export const AuthUserSession = Auth.currentSession;
