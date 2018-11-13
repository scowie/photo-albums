import React from "react";
import { Input } from "semantic-ui-react";

const TitleBarWithInput = props => {
  return (
    <div className="title-bar-container">
      <div className="title-bar-title-container">
        <h2>{props.title}</h2>
      </div>
      <Input
        type={props.inputType}
        placeholder={props.inputPlaceholder}
        action={{
          content: props.inputActionName,
          onClick: props.submitFunction
        }}
        name={props.inputName}
        value={props.inputValue}
        onChange={props.inputChangeFunction}
      />
    </div>
  );
};

export default TitleBarWithInput;
