import React, { Component } from "react";
import PhotosList from "./PhotosList";
import S3ImageUpload from "./S3ImageUpload";
import {
  Form,
  Button,
  Icon,
  Divider,
  Dropdown,
  Sidebar,
  Segment
} from "semantic-ui-react";
import { NavLink } from "react-router-dom";
import { API, graphqlOperation } from "aws-amplify";

class AlbumDetails extends Component {
  state = {
    sidebarVisible: false,
    saveInProgress: false,
    hasUnsavedChanges: false
  };

  toggleSidebarVisibility = e => {
    e.preventDefault();
    this.setState({ sidebarVisible: !this.state.sidebarVisible });
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
          id: this.state.albumId,
          name: this.state.albumName,
          sortPosition: this.state.albumSortPosition,
          isVisible: this.state.albumIsVisible
        })
      );
      this.setState({ saveInProgress: false });
      return result;
    });
  };

  handleAlbumNameChange = e => {
    this.setState({ albumName: e.target.value });
  };

  toggleAlbumVisibility = e => {
    this.setState({ albumIsVisible: this.state.albumIsVisible ? false : true });
  };

  //   componentDidMount() {
  //     this.setState({ album: this.props.album });
  //   }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.album !== this.props.album) {
      this.setState({
        album: this.props.album,
        albumId: this.props.album.id,
        albumName: this.props.album.name,
        albumSortPosition: this.props.album.sortPosition,
        albumIsVisible: this.props.album.isVisible
      });
    } else if (
      prevState.albumName !== this.state.albumName ||
      prevState.albumIsVisible !== this.state.albumIsVisible ||
      prevState.album !== this.state.album
    ) {
      this.setState({ hasUnsavedChanges: true });
    }
  }

  render() {
    if (!this.props.album) return "Loading album...";
    return (
      <div>
        <div className="title-bar-container">
          <div className="title-bar-title-container">
            <h2>{this.state.albumName ? this.state.albumName : ""}</h2>
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
            <Dropdown
              text="Actions&nbsp;&nbsp;&nbsp;"
              icon="content"
              floating
              button
              className="icon"
              id="album-details-actions-dropdown"
            >
              <Dropdown.Menu>
                <Dropdown.Item>
                  <S3ImageUpload albumId={this.props.album.id} />
                </Dropdown.Item>
                <Dropdown.Item>
                  <Button
                    className="pm-button"
                    onClick={this.toggleSidebarVisibility}
                  >
                    <Icon name="pencil" />
                    Edit
                  </Button>
                </Dropdown.Item>
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
                <label>Name</label>
                <input
                  placeholder="Album Name"
                  onChange={this.handleAlbumNameChange}
                  value={this.state.albumName ? this.state.albumName : ""}
                />
              </Form.Field>

              <Form.Field>
                <label>Visibility</label>
                <Button
                  className="pm-button"
                  toggle
                  active={
                    this.state.albumIsVisible
                      ? this.state.albumIsVisible
                      : false
                  }
                  onClick={this.toggleAlbumVisibility}
                >
                  {this.state.albumIsVisible ? "Visible" : "Hidden"}
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
                  onClick={this.saveAlbumChanges}
                  size="medium"
                  style={{ marginLeft: "10px" }}
                  className={"pm-button"}
                >
                  Save
                </Button>
              </div>
            </Sidebar>

            <Sidebar.Pusher>
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
            </Sidebar.Pusher>
          </Sidebar.Pushable>
        </div>
      </div>
    );
  }
}

export default AlbumDetails;
