import React, { Component } from "react";
import { S3Image } from "aws-amplify-react";
import { Menu, Segment, Button, Icon, Divider, Sidebar } from "semantic-ui-react";
import { NavLink } from "react-router-dom";
import { API, graphqlOperation } from "aws-amplify";

class PhotoDetails extends Component {
  state = {
    photo: this.props.photo,
    sidebarVisible: true
  };

  toggleSidebarVisibility = () =>
    this.setState({ sidebarVisible: !this.state.sidebarVisible });

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
            <h2>
              {this.state.photo ? this.state.photo.title : "Add a title..."}
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
        <div style={{position:'relative'}}>
        <Button circular icon='settings' className="pm-button--sidebar-toggle" onClick={this.toggleSidebarVisibility}/>
        <Sidebar.Pushable as={Segment}>
          <Sidebar
            as={Menu}
            animation="overlay"
            icon="labeled"
            vertical
            visible={this.state.sidebarVisible}
            width="thin"
          >
            <Menu.Item as="a">
              <Icon name="home" />
              Home
            </Menu.Item>
          </Sidebar>

          <Sidebar.Pusher>
            <div className="pm-fullsize-image-container">
              <S3Image
                imgKey={this.props.photo.fullsize.key.replace("public/", "")}
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
