import React, { Component } from "react";
import PhotosList from "./PhotosList";
import S3ImageUpload from "./S3ImageUpload";
import { Form, Button, Icon, Divider } from "semantic-ui-react";
import { NavLink } from "react-router-dom";
import { API, graphqlOperation } from "aws-amplify";

class PhotoDetails extends Component {
  state = {
    photo: this.props.photo
  };

  saveImageChanges = async (
    photoId,
    photoSortPosition,
    photoTitle,
    photoDescription
  ) => {
    const UpdatePhoto = `mutation UpdatePhoto($id: ID!, $sortPosition: Int, $title: String, $description: String) {
        updatePhoto(input: {id: $id, sortPosition: $sortPosition, title: $title, description: $description}) {
          id
          sortPosition
          title
          description
        }
      }`;
    const result = await API.graphql(
      graphqlOperation(UpdatePhoto, {
        id: photoId,
        sortPosition: photoSortPosition,
        title: photoTitle,
        description: photoDescription
      })
    );
    console.log(result);
    return result;
  };

  handlePhotoTitleChange = event => {
    const newPhoto = Object.assign({}, this.state.photo);
    newPhoto.title = event.target.value;
    this.setState({ photo: newPhoto });
  };

  componentDidMount() {
    this.setState({ photo: this.props.photo });
  }

  render() {
    if (!this.props.photo) return "Loading photo...";
    return (
      <div>
        <div className="title-bar-container">
          <div className="title-bar-title-container">
            <h2>{this.state.photo ? this.state.photo.title : "Add a title..."}</h2>
          </div>
          <div className="title-bar-actions-container">
            <NavLink to={`/albums/${this.props.photo.album.id}`}>
              <Button
                size="medium"
                style={{ marginLeft: "10px" }}
                className={"pm-button"}
              >
                <Icon name="left arrow" />
                Album
              </Button>
            </NavLink>
            <Button
              size="medium"
              style={{ marginLeft: "10px" }}
              className={"pm-button"}
            >
              Save
            </Button>
          </div>
        </div>
        <Divider />
      </div>
    );
  }
}

export default PhotoDetails;
