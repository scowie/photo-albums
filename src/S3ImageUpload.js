import React, { Component } from "react";
import { Form } from "semantic-ui-react";
import { Storage } from "aws-amplify";
import { v4 as uuid } from "uuid";
import EXIF from "exif-js";

class S3ImageUpload extends Component {
  constructor(props) {
    super(props);
    this.state = { uploading: false };
  }
  onChange = async e => {
    const self = this;
    const file = e.target.files[0];

    let deviceMake;
    let deviceModel;
    let dateTime;

    return await self.setState({uploading: true}, async () => {
        return await EXIF.getData(file, async function() {
            deviceMake = EXIF.getTag(this, "Make");
            deviceModel = EXIF.getTag(this, "Model");
            dateTime = EXIF.getTag(this, "DateTime");
      
            const fileName = uuid();
            try {
              const result = await Storage.put(fileName, file, {
                customPrefix: { public: "uploads/" },
                metadata: {
                  albumid: self.props.albumId,
                  deviceMake: deviceMake,
                  deviceModel: deviceModel,
                  dateTime: dateTime
                }
              });
              console.log("Uploaded file: ", result);
              self.setState({ uploading: false });
            } catch (err) {
              console.log(err);
            }
          });
    })
  };

  render() {
    return (
      <div>
        <Form.Button
          onClick={() =>
            document.getElementById("add-image-file-input").click()
          }
          disabled={this.state.uploading}
          icon="file image outline"
          content={this.state.uploading ? "Uploading..." : "Add Image"}
          loading={this.state.uploading}
        />
        <input
          id="add-image-file-input"
          type="file"
          accept="image/*"
          onChange={this.onChange}
          style={{ display: "none" }}
        />
      </div>
    );
  }
}

export default S3ImageUpload;
