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
import { arrayMove } from "react-sortable-hoc";

class AlbumDetails extends Component {
  constructor(props) {
    super(props);

    this.state = {
      sidebarVisible: false,
      saveInProgress: false,
      hasUnsavedChanges: false
    };
    this.autoSaveAlbumPhotoSortPositions = this.autoSaveAlbumPhotoSortPositions.bind(
      this
    );
  }

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

  onSortEnd = ({ oldIndex, newIndex }) => {
    const updatedPhotos = arrayMove(this.state.albumPhotos, oldIndex, newIndex);
    updatedPhotos.forEach((photo, index) => (photo.sortPosition = index));
    this.setState({ albumPhotos: updatedPhotos });
  };

  handleSaveAlbumPhotoSortPositionsClick = async () => {
    return await Promise.all(
      this.state.albumPhotos.map(async (photo, index) => {
        return await this.savePhotoChanges(photo);
      })
    );
  };

  savePhotoChanges = async photo => {
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
          id: photo.id,
          sortPosition: photo.sortPosition,
          title: photo.title,
          description: photo.description,
          isVisible: photo.isVisible
        })
      );
      this.setState({ saveInProgress: false });

      return result;
    });
  };

  autoSaveAlbumPhotoSortPositions = async photos => {
    photos.forEach(photo => this.autoSavePhotoChanges(photo));
  };

  autoSavePhotoChanges = async photo => {
    const UpdatePhoto = `mutation UpdatePhoto($id: ID!, $sortPosition: Int, $title: String, $description: String, $isVisible: Boolean) {
        updatePhoto(input: {id: $id, sortPosition: $sortPosition, title: $title, description: $description, isVisible: $isVisible}) {
          id
          sortPosition
          title
          description
          isVisible
        }
      }`;

    const result = await API.graphql(
      graphqlOperation(UpdatePhoto, {
        id: photo.id,
        sortPosition: photo.sortPosition,
        title: photo.title,
        description: photo.description,
        isVisible: photo.isVisible
      })
    );

    return result;
  };

  handleAlbumNameChange = e => {
    this.setState({ albumName: e.target.value });
  };

  toggleAlbumVisibility = e => {
    this.setState({ albumIsVisible: this.state.albumIsVisible ? false : true });
  };

  componentDidUpdate(prevProps, prevState) {
    if (prevProps !== this.props) {
      this.setState({
        albumPhotos: this.props.album ? this.props.album.photos.items : null,
        albumId: this.props.album ? this.props.album.id : null,
        albumName: this.props.album ? this.props.album.name : null,
        albumSortPosition: this.props.album
          ? this.props.album.sortPosition
          : null,
        albumIsVisible: this.props.album ? this.props.album.isVisible : null
      });
      if (prevProps.album && prevProps.album !== this.props.album) {
        this.setState({ hasUnsavedChanges: true });
      }
    } else if (
      (prevState.albumName && prevState.albumName !== this.state.albumName) ||
      (prevState.albumIsVisible &&
        prevState.albumIsVisible !== this.state.albumIsVisible) ||
      (prevState.albumPhotos &&
        prevState.albumPhotos !== this.state.albumPhotos)
    ) {
      this.setState({ hasUnsavedChanges: true });
    }
  }
  
  componentDidMount() {
      
    this.setState({
        albumPhotos: this.props.album ? this.props.album.photos.items : null,
        albumId: this.props.album ? this.props.album.id : null,
        albumName: this.props.album ? this.props.album.name : null,
        albumSortPosition: this.props.album
          ? this.props.album.sortPosition
          : null,
        albumIsVisible: this.props.album ? this.props.album.isVisible : null
      });
  }

  componentWillUnmount() {
    if (this.state.hasUnsavedChanges) {
      return this.autoSaveAlbumPhotoSortPositions(this.state.albumPhotos);
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
            <S3ImageUpload 
                albumId={this.props.album.id} 
                numPhotos={this.props.album.photos.items.length}/>
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
              loading={this.state.saveInProgress}
              disabled={
                this.state.saveInProgress || !this.state.hasUnsavedChanges
              }
              size="medium"
              style={{ marginLeft: "10px" }}
              className={"pm-button"}
              primary={this.state.hasUnsavedChanges}
              onClick={this.handleSaveAlbumPhotoSortPositionsClick}
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
          <Sidebar.Pushable
            as={Segment}
            id="pm-album-photos-list"
            className="pm-sidebar-container"
          >
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
              <PhotosList
                photos={this.state.albumPhotos ? this.state.albumPhotos : []}
                onSortEnd={this.onSortEnd.bind(this)}
              />
              {/* {this.props.hasMorePhotos && (
                <Form.Button
                  onClick={this.props.loadMorePhotos}
                  icon="refresh"
                  disabled={this.props.loadingPhotos}
                  content={
                    this.props.loadingPhotos ? "Loading..." : "Load more photos"
                  }
                />
              )} */}
            </Sidebar.Pusher>
          </Sidebar.Pushable>
        </div>
      </div>
    );
  }
}

export default AlbumDetails;
