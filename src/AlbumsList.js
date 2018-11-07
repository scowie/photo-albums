import React, { Component } from 'react'
import { Header, List, Segment, Button, Icon } from 'semantic-ui-react'
import { NavLink } from 'react-router-dom'


function makeComparator (key, order = 'asc') {
    return (a, b) => {
      if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) return 0
  
      const aVal = typeof a[key] === 'string' ? a[key].toUpperCase() : a[key]
      const bVal = typeof b[key] === 'string' ? b[key].toUpperCase() : b[key]
  
      let comparison = 0
      if (aVal > bVal) comparison = 1
      if (aVal < bVal) comparison = -1
  
      return order === 'desc' ? comparison * -1 : comparison
    }
}

class AlbumsList extends Component {
  albumItems () {
    return this.props.albums.sort(makeComparator('name')).map(album => (
      <List.Item key={album.id}>
      <Segment>
        <NavLink to={`/albums/${album.id}`}>{album.name}</NavLink>
      </Segment>
      </List.Item>
    ))
  }

  render () {
    return (
      <div>
        <div style={styles.titleBarContainer}>
        <div style={styles.titleBarTitleContainer}><h2>Galleries</h2>
            
        </div>
        <Button icon>
            Create New Gallery&nbsp;&nbsp;<Icon name="plus"></Icon>
        </Button>
        </div>
        <List divided relaxed>
          {this.albumItems()}
        </List>
        <NavLink to={'/newalbum'}>Add New Album</NavLink>
      </div>
    )
  }
}

const styles = {
    titleBarContainer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    titleBarTitleContainer: {
        display: 'flex',
        alignItems: 'center'
    }

}
export default AlbumsList
