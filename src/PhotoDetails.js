import React, { Component } from "react";
import { S3Image } from "aws-amplify-react";
import {
  Form,
  Segment,
  Button,
  Icon,
  Divider,
  Sidebar
} from "semantic-ui-react";
import { NavLink } from "react-router-dom";
import { API, graphqlOperation } from "aws-amplify";

class PhotoDetails extends Component {
  state = {
    sidebarVisible: false,
    hasUnsavedChanges: false,
    saveInProgress: false
  };

  toggleSidebarVisibility = e => {
    e.preventDefault();
    this.setState({ sidebarVisible: !this.state.sidebarVisible });
  };

  savePhotoChanges = async () => {
    const UpdatePhoto = `mutation UpdatePhoto($id: ID!, $sortPosition: Int, $title: String, $description: String, $isVisible: Boolean) {
        updatePhoto(input: {id: $id, sortPosition: $sortPosition, title: $title, description: $description, isVisible: $isVisible}) {
          id
          sortPosition
          title
          description
          isVisible
        }
      }`;

    this.setState({ saveInProgress: true }, async () => {
      const result = await API.graphql(
        graphqlOperation(UpdatePhoto, {
          id: this.state.photo.id,
          sortPosition: this.state.photo.sortPosition,
          title: this.state.photo.title,
          description: this.state.photo.description,
          isVisible: this.state.photo.isVisible
        })
      );
      this.setState({ saveInProgress: false });
      return result;
    });
  };

  handlePhotoTitleChange = event => {
    const newPhoto = Object.assign({}, this.state.photo);
    newPhoto.title = event.target.value;
    this.setState({ photo: newPhoto });
  };

  handlePhotoDescriptionChange = event => {
    const newPhoto = Object.assign({}, this.state.photo);
    newPhoto.description = event.target.value;
    this.setState({ photo: newPhoto });
  };

  togglePhotoVisibility = event => {
    const newPhoto = Object.assign({}, this.state.photo);
    newPhoto.isVisible = this.state.photo.isVisible ? false : true;
    this.setState({ photo: newPhoto });
  };

  componentDidMount() {
    this.setState({ photo: this.props.photo });
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.photo !== this.props.photo) {
      this.setState({ photo: this.props.photo });
    } else if (prevState.photo && prevState.photo !== this.state.photo) {
      this.setState({ hasUnsavedChanges: true });
    }
  }

  render() {
    if (!this.props.photo) return "Loading photo...";
    return (
      <div>
        <div className="title-bar-container">
          <div className="title-bar-title-container">
            <h2>
              {this.state.photo && this.state.photo.title
                ? this.state.photo.title
                : "Add a title..."}
            </h2>
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
              <Button
                className="pm-button"
                onClick={this.toggleSidebarVisibility}
              >
                <Icon name="pencil" />
                Edit
              </Button>
            </NavLink>
          </div>
        </div>
        <Divider />
        <div style={{ position: "relative" }}>
          {this.state.sidebarVisible && (
            <Button
              circular
              icon={"arrow left"}
              className="pm-button--sidebar-toggle"
              onClick={this.toggleSidebarVisibility}
            />
          )}
          <Sidebar.Pushable as={Segment} className="pm-sidebar-container">
            <Sidebar
              as={Form}
              animation="overlay"
              icon="labeled"
              vertical="true"
              visible={this.state.sidebarVisible}
              width="very wide"
            >
              <Form.Field>
                <label>Title</label>
                <input
                  placeholder="Photo Title"
                  onChange={this.handlePhotoTitleChange}
                  value={
                    this.state.photo && this.state.photo.title
                      ? this.state.photo.title
                      : ""
                  }
                />
              </Form.Field>
              <Form.Field>
                <label>Description</label>
                <textarea
                  rows={2}
                  onChange={this.handlePhotoDescriptionChange}
                  value={
                    this.state.photo && this.state.photo.description
                      ? this.state.photo.description
                      : ""
                  }
                />
              </Form.Field>
              <Form.Field>
                <label>Visibility</label>
                <Button
                  className="pm-button"
                  toggle
                  active={
                    this.state.photo && this.state.photo.isVisible
                      ? this.state.photo.isVisible
                      : false
                  }
                  onClick={this.togglePhotoVisibility}
                >
                  {this.state.photo && this.state.photo.isVisible
                    ? "Visible"
                    : "Hidden"}
                </Button>
              </Form.Field>
              <div
                style={{
                  marginTop: "50px",
                  display: "flex",
                  justifyContent: "flex-end"
                }}
              >
                <Button
                  primary={this.state.hasUnsavedChanges}
                  loading={this.state.saveInProgress}
                  disabled={
                    this.state.saveInProgress || !this.state.hasUnsavedChanges
                  }
                  onClick={this.savePhotoChanges}
                  size="medium"
                  style={{ marginLeft: "10px" }}
                  className={"pm-button"}
                >
                  Save
                </Button>
              </div>
            </Sidebar>

            <Sidebar.Pusher>
              <div className="pm-fullsize-image-container">
                <S3Image
                  imgKey={this.props.photo.fullsizeKey.replace("public/", "")}
                />
              </div>
            </Sidebar.Pusher>
          </Sidebar.Pushable>
        </div>
      </div>
    );
  }
}

export default PhotoDetails;
