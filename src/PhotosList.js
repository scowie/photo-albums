import React, { Component } from 'react'
import { Divider } from 'semantic-ui-react'
import { S3Image } from 'aws-amplify-react'

class PhotosList extends Component {
    photoItems () {
      return this.props.photos.map(photo => (
        <S3Image
          key={photo.thumbnail.key}
          imgKey={photo.thumbnail.key.replace('public/', '')}
          style={{ display: 'inline-block', paddingRight: '5px' }}
        />
      ))
    }
    render () {
      return (
        <div>
          <Divider hidden />
          {this.photoItems()}
        </div>
      )
    }
  }

export default PhotosList