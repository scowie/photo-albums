import React, { Component } from "react";
import PhotosList from "./PhotosList";
import {
  Form,
  Button,
  Icon,
  Divider,
  Dropdown,
  Sidebar,
  Segment,
  Loader
} from "semantic-ui-react";
import { NavLink } from "react-router-dom";
import { API, graphqlOperation } from "aws-amplify";
import { arrayMove } from "react-sortable-hoc";
import { Storage } from "aws-amplify";
import { v4 as uuid } from "uuid";
import EXIF from "exif-js";

const NewPhoto = `mutation NewPhoto(
  $bucket: String!, 
  $id: ID, 
  $photoAlbumId: ID, 
  $deviceMake: String,
  $deviceModel: String,
  $dateTime: String,
  $thumbnailKey: String,
  $fullsizeKey: String,
  $createdAt: Float,
  $sortPosition: Int
  ) {
createPhoto(input: {
    bucket: $bucket, 
    id: $id, 
    photoAlbumId: $photoAlbumId, 
    deviceMake: $deviceMake, 
    deviceModel: $deviceModel, 
    dateTime: $dateTime, 
    thumbnailKey: $thumbnailKey,
    fullsizeKey: $fullsizeKey,
    createdAt: $createdAt,
    sortPosition: $sortPosition
}) {
    id
    album {
        id
    }
    sortPosition
    title
    description
    deviceMake
    deviceModel
    isVisible
    bucket
    fullsizeKey
    thumbnailKey
}
}`;

class AlbumDetails extends Component {
  constructor(props) {
    super(props);

    this.state = {
      filesActivelyUploading: {},
      checkedStatuses: {},
      filesToBeUploaded: null,
      filesToBeDeleted: [],
      uploading: false,
      sidebarVisible: false,
      saveInProgress: false,
      deleteInProgress: false,
      hasUnsavedChanges: false
    };
    this.autoSaveAlbumPhotoSortPositions = this.autoSaveAlbumPhotoSortPositions.bind(
      this
    );
  }

  async handleSelectionClick(id) {
    let statuses = Object.assign({}, this.state.checkedStatuses);
    if (statuses[id] === true) {
      statuses[id] = false;
      this.setState({ checkedStatuses: statuses }, async () => {
        return await this.removeFileToBeDeleted(id);
      });
    } else {
      statuses[id] = true;
      this.setState({ checkedStatuses: statuses }, async () => {
        return await this.addFileToBeDeleted(id);
      });
    }
  }

  cleanFileName(name) {
    let cleanedName = name.replace(" ", "");
    cleanedName = cleanedName.replace(".", "");
    return cleanedName;
  }

  async addFileToBeDeleted(id) {
    let fileIds = [...this.state.filesToBeDeleted];
    fileIds.push(id);
    return await this.setState({ filesToBeDeleted: fileIds });
  }

  async removeFileToBeDeleted(id) {
    let fileIds = [...this.state.filesToBeDeleted.filter(i => i !== id)];
    return await this.setState({ filesToBeDeleted: fileIds });
  }

  onChange = async e => {
    const self = this;
    const files = Array.from(e.target.files);

    let uploadingFiles = {};
    files.forEach(f => {
      uploadingFiles[this.cleanFileName(f.name)] = true;
    });
    let fileUploadPromises = [];
    self.setState(
      {
        uploading: true,
        filesToBeUploaded: files,
        filesActivelyUploading: uploadingFiles
      },
      async () => {
        files.forEach(file => {
          fileUploadPromises.push(
            new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = event => {
                var img = new Image();
                img.onload = function() {
                  var canvas = document.createElement("canvas");
                  var ctx = canvas.getContext("2d");
                  ctx.drawImage(img, 0, 0);

                  var MAX_WIDTH = 300;
                  var MAX_HEIGHT = 1000;
                  var width = img.width;
                  var height = img.height;

                  if (width > height) {
                    if (width > MAX_WIDTH) {
                      height *= MAX_WIDTH / width;
                      width = MAX_WIDTH;
                    }
                  } else {
                    if (height > MAX_HEIGHT) {
                      width *= MAX_HEIGHT / height;
                      height = MAX_HEIGHT;
                    }
                  }
                  canvas.width = width;
                  canvas.height = height;

                  ctx.drawImage(img, 0, 0, width, height);

                  const makeThumbnailFile = new Promise((resolve, reject) => {
                    ctx.canvas.toBlob(
                      blob => {
                        const thumbnailFile = new File([blob], uuid(), {
                          type: "image/jpeg",
                          lastModified: Date.now()
                        });
                        resolve(thumbnailFile);
                      },
                      "image/jpeg",
                      1
                    );
                  });

                  makeThumbnailFile.then(async thumbnailFile => {
                    return await EXIF.getData(file, async function() {
                      const deviceMake = EXIF.getTag(this, "Make");
                      const deviceModel = EXIF.getTag(this, "Model");
                      const dateTime = EXIF.getTag(this, "DateTime");

                      const fileName = uuid();

                      try {
                        const dynamoResults = await Promise.all([
                          Storage.put(`resized/${fileName}`, thumbnailFile, {
                            metadata: {
                              albumid: self.props.album.id
                            }
                          }),
                          Storage.put(fileName, file, {
                            metadata: {
                              albumid: self.props.album.id
                            }
                          })
                        ]);

                        const graphQlResult = await API.graphql(
                          graphqlOperation(NewPhoto, {
                            bucket:
                              "photoalbums76f3acc6a3cb48d9911ad6df8f67351e",
                            id: fileName,
                            photoAlbumId: self.props.album.id,
                            deviceMake: deviceMake,
                            deviceModel: deviceModel,
                            dateTime: dateTime,
                            thumbnailKey: `public/resized/${fileName}`,
                            fullsizeKey: `public/${fileName}`,
                            createdAt: new Date().getTime(),
                            sortPosition: self.props.album.photos.items.length
                          })
                        );

                        const updatedFilesActivelyUploading = Object.assign(
                          {},
                          self.state.filesActivelyUploading
                        );
                        updatedFilesActivelyUploading[
                          self.cleanFileName(file.name)
                        ] = false;
                        self.setState({
                          filesActivelyUploading: updatedFilesActivelyUploading
                        });
                        resolve();
                      } catch (err) {
                        console.log(err);
                        reject(err);
                      }
                    });
                  });
                };

                img.src = reader.result;
              };

              reader.readAsDataURL(file);
            })
          );
        });
        Promise.all(fileUploadPromises).then(() =>
          self.setState({ uploading: false })
        );
      }
    );
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

  deleteSelectedPhotos = async () => {
    let fileDeletePromises = [];
    const DeletePhoto = `mutation DeletePhoto($id: ID!) {
      deletePhoto(input: {id: $id}) {
        id
      }
    }`;

    this.setState({ deleteInProgress: true }, async () => {
      this.state.filesToBeDeleted.forEach(async fileId => {
        fileDeletePromises.push(
          new Promise(async (resolve, reject) => {
            await API.graphql(
              graphqlOperation(DeletePhoto, {
                id: fileId
              })
            );
            this.setState({
              filesToBeDeleted: this.state.filesToBeDeleted.filter(
                i => i !== fileId
              )
            });
            resolve();
          })
        );
      });

      Promise.all(fileDeletePromises).then(() =>
        this.setState({ deleteInProgress: false, filesToBeDeleted: [] })
      );
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
    this.setState({ albumIsVisible: this.state.albumIsVisible === true ? false : true });
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

  getDropdown() {
    if (this.state.uploading) {
      return (
        <Dropdown
          text={"Uploading..."}
          icon={null}
          floating
          loading
          button
          className="icon"
          id="album-details-uploading-dropdown"
          open
          direction="left"
        >
          <Dropdown.Menu>
            {this.state.filesToBeUploaded &&
              this.state.filesToBeUploaded.map(f => {
                return (
                  <Dropdown.Item key={f.name}>
                    <span>{f.name}</span>
                    <Loader
                      active={
                        this.state.filesActivelyUploading[
                          this.cleanFileName(f.name)
                        ]
                      }
                      inline
                      size="tiny"
                    />
                    {!this.state.filesActivelyUploading[
                      this.cleanFileName(f.name)
                    ] && <Icon color={"green"} name="check circle outline" />}
                  </Dropdown.Item>
                );
              })}
          </Dropdown.Menu>
        </Dropdown>
      );
    } else {
      return (
        <Dropdown
          icon={"ellipsis horizontal"}
          floating
          button
          className="icon"
          id="album-details-actions-dropdown"
          direction="left"
        >
          <Dropdown.Menu>
            <Dropdown.Item>
              <div>
                <Form.Button
                  onClick={() =>
                    document.getElementById("add-image-file-input").click()
                  }
                  disabled={this.state.uploading}
                  icon="file image outline"
                  content={"Add Images"}
                />
                <input
                  id="add-image-file-input"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={this.onChange}
                  style={{ display: "none" }}
                />
              </div>
            </Dropdown.Item>
            {/* <Dropdown.Item>
              <Button
                className="pm-button"
                onClick={this.toggleSidebarVisibility}
              >
                <Icon name="pencil" />
                Edit
              </Button>
            </Dropdown.Item> */}
            {/* <Dropdown.Item>
              <Button
                className="pm-button"
                onClick={this.deleteSelectedPhotos}
                disabled={!this.state.filesToBeDeleted.length}
              >
                <Icon name="trash" />
                Delete{" "}
                {this.state.filesToBeDeleted.length > 0
                  ? this.state.filesToBeDeleted.length
                  : ""}{" "}
                Photos
              </Button>
            </Dropdown.Item> */}
          </Dropdown.Menu>
        </Dropdown>
      );
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
            {this.state.deleteInProgress && (
              <span>
                Deleting {this.state.filesToBeDeleted.length}{" "}
                Photos&nbsp;&nbsp;&nbsp;
                <Loader
                  active={this.state.deleteInProgress}
                  inline
                  size="tiny"
                />
              </span>
            )}
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

            <Button
              size="medium"
              className={"pm-button"}
              onClick={this.toggleSidebarVisibility}
            >
              <Icon name="pencil" />
              Edit
            </Button>

            <Button
              className="pm-button"
              onClick={this.deleteSelectedPhotos}
              disabled={!this.state.filesToBeDeleted.length}
            >
              <Icon name="trash" />
              Delete{" "}
              {this.state.filesToBeDeleted.length > 0
                ? this.state.filesToBeDeleted.length
                : ""}{" "}
              Photos
            </Button>

            {this.getDropdown()}

            {/* <Button
              loading={this.state.saveInProgress}
              disabled={
                this.state.saveInProgress || !this.state.hasUnsavedChanges
              }
              size="medium"
              className={"pm-button"}
              primary={this.state.hasUnsavedChanges}
              onClick={this.handleSaveAlbumPhotoSortPositionsClick}
            >
              Save
            </Button> */}
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
                    this.state.albumIsVisible === true
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
                  primary
                  loading={this.state.saveInProgress}
                  disabled={this.state.saveInProgress}
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
                handleSelectionClick={this.handleSelectionClick.bind(this)}
              />
            </Sidebar.Pusher>
          </Sidebar.Pushable>
        </div>
      </div>
    );
  }
}

export default AlbumDetails;
