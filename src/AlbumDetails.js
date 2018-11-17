import React, { Component } from "react";
import PhotosList from "./PhotosList";
import S3ImageUpload from "./S3ImageUpload";
import { Form, Button, Icon, Divider } from "semantic-ui-react";
import { NavLink } from "react-router-dom";

class AlbumDetails extends Component {
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
