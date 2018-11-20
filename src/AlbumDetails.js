import React, { Component } from "react";
import PhotosList from "./PhotosList";
import S3ImageUpload from "./S3ImageUpload";
import { Form, Button, Icon, Divider, Dropdown } from "semantic-ui-react";
import { NavLink } from "react-router-dom";
import { API, graphqlOperation } from "aws-amplify";

class AlbumDetails extends Component {
  state = {
    saveInProgress: false,
    hasUnsavedChanges: false
  };

  saveAlbumChanges = async () => {
    const UpdateAlbum = `mutation UpdateAlbum($id: ID!, $name: String, $sortPosition: Int, $isVisible: Boolean) {
            updateAlbum(input: {id: $id, name: $name, sortPosition: $sortPosition, isVisible: $isVisible}) {
              id
              name
              sortPosition
              isVisible
            }
          }`;

    this.setState({ saveInProgress: true }, async () => {
      const result = await API.graphql(
        graphqlOperation(UpdateAlbum, {
          id: this.state.album.id,
          name: this.state.album.name,
          sortPosition: this.state.album.sortPosition,
          isVisible: this.state.album.isVisible
        })
      );
      this.setState({ saveInProgress: false });
      return result;
    });
  };

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.album !== this.props.album) {
      this.setState({ album: this.props.album });
    } else if (prevState.album && prevState.album !== this.state.album) {
      this.setState({ hasUnsavedChanges: true });
    }
  }

  render() {
    if (!this.props.album) return "Loading album...";
    return (
      <div>
        <div className="title-bar-container">
          <div className="title-bar-title-container">
            <h2>{this.props.album ? this.props.album.name : ""}</h2>
          </div>
          <div className="title-bar-actions-container">
            <NavLink to="/albums">
              <Button
                size="medium"
                style={{ marginLeft: "10px" }}
                className={"pm-button"}
              >
                <Icon name="left arrow" />
                Albums
              </Button>
            </NavLink>
            <S3ImageUpload albumId={this.props.album.id} />
            <Dropdown
              text="Actions&nbsp;&nbsp;&nbsp;"
              icon="content"
              floating
              button
              className="icon"
            >
              <Dropdown.Menu>
                <Dropdown.Item icon="attention" text="Important" />
                <Dropdown.Item icon="comment" text="Announcement" />
                <Dropdown.Item icon="conversation" text="Discussion" />
              </Dropdown.Menu>
            </Dropdown>
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

        <PhotosList photos={this.props.album.photos.items} />
        {this.props.hasMorePhotos && (
          <Form.Button
            onClick={this.props.loadMorePhotos}
            icon="refresh"
            disabled={this.props.loadingPhotos}
            content={
              this.props.loadingPhotos ? "Loading..." : "Load more photos"
            }
          />
        )}
      </div>
    );
  }
}

export default AlbumDetails;
