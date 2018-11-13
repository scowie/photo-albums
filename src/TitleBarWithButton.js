import React from "react";
import { Button, Icon } from "semantic-ui-react"

const TitleBarWithButton = props => (
  <div className="title-bar-container">
    <div className="title-bar-title-container">
      <h2>{ props.title }</h2>
    </div>
    <Button icon onClick={ props.buttonClickFunction }>
      { props.buttonText } &nbsp;&nbsp;
      <Icon name={ props.buttonIconName } />
    </Button>
  </div>
);

export default TitleBarWithButton;
