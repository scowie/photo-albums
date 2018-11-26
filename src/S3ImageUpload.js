import React, { Component } from "react";
import { Form } from "semantic-ui-react";
import { Storage } from "aws-amplify";
import { API, graphqlOperation } from "aws-amplify";
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

class S3ImageUpload extends Component {
  constructor(props) {
    super(props);
    this.state = { uploading: false };
  }

  onChange = async e => {
    // 1.  get the file
    // 2.  read the file with FileReader
    // 3.  create a new Image for thumbnail
    // 4.  make a file out of the image blob
    // 5.  get exif data
    // 6.  put files to s3
    // 7.  graphQL createPhoto (dynamo db entry)
    const self = this;
    const file = e.target.files[0];

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

          return await self.setState({ uploading: true }, async () => {
            return await EXIF.getData(file, async function() {
              const deviceMake = EXIF.getTag(this, "Make");
              const deviceModel = EXIF.getTag(this, "Model");
              const dateTime = EXIF.getTag(this, "DateTime");

              const fileName = uuid();

              try {
                const dynamoResults = await Promise.all([
                  Storage.put(`resized/${fileName}`, thumbnailFile, {
                    metadata: {
                      albumid: self.props.albumId
                    }
                  }),
                  Storage.put(fileName, file, {
                    metadata: {
                      albumid: self.props.albumId
                    }
                  })
                ]);

                const graphQlResult = await API.graphql(
                  graphqlOperation(NewPhoto, {
                    bucket: "photoalbums76f3acc6a3cb48d9911ad6df8f67351e",
                    id: fileName,
                    photoAlbumId: self.props.albumId,
                    deviceMake: deviceMake,
                    deviceModel: deviceModel,
                    dateTime: dateTime,
                    thumbnailKey: `public/resized/${fileName}`,
                    fullsizeKey: `public/${fileName}`,
                    createdAt: new Date().getTime(),
                    sortPosition: self.props.numPhotos
                  })
                );

                return self.setState({ uploading: false });
              } catch (err) {
                console.log(err);
              }
            });
          });
        });
      };

      img.src = reader.result;
    };

    reader.readAsDataURL(file);
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
