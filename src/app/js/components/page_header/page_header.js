import React from 'react'
import { Link } from 'react-router-dom'
import {
  EuiHeader,
  EuiHeaderLink,
  EuiHeaderLinks,
  EuiHeaderSectionItem,
  EuiHeaderSectionItemButton,
  EuiImage,
} from '@elastic/eui'

export class PageHeader extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      breadcrumbs: [],
    }
    this.updateBreadcrumbs = this.updateBreadcrumbs.bind(this)
  }

  componentDidMount() {
    window.addEventListener('hashchange', this.updateBreadcrumbs, false)
    this.updateBreadcrumbs()
  }

  componentWillUnmount() {
    window.removeEventListener('hashchange', this.updateBreadcrumbs, false)
  }

  updateBreadcrumbs() {
    const breadcrumbs = [
      {
        text: 'zentity',
        href: '/#/',
      },
    ]

    const hash = window.location.hash
    if (hash.match(/^#\/explore[\/\?\#]?$/)) {
      breadcrumbs.push({
        text: 'explore',
      })
    } else if (hash.match(/^#\/models[\/\?\#]?$/)) {
      breadcrumbs.push({
        text: 'models',
      })
    } else if (hash.match(/^#\/models\/([^\/\?\#]+)([\/\?\#]|$)/)) {
      breadcrumbs.push({
        text: 'models',
        href: '/#/models',
      })
      breadcrumbs.push({
        text: hash.match(/^#\/models\/([^\/\?\#]+)([\/\?\#]|$)/)[1],
      })
    }

    this.setState({
      breadcrumbs: breadcrumbs,
    })
  }

  render() {
    const logo = (
      <Link to="/">
        <EuiHeaderSectionItemButton>
          <EuiImage alt="zentity" size={32} url={require('/img/zentity-logo.png')} />
        </EuiHeaderSectionItemButton>
      </Link>
    )

    const links = (
      <EuiHeaderSectionItem>
        <EuiHeaderLinks aria-label="App navigation links example">
          <EuiHeaderLink
            href="https://github.com/zentity-io/zentity"
            target="_blank"
            color="primary"
            iconType="logoGithub"
          >
            Source
          </EuiHeaderLink>
          <EuiHeaderLink href="https://zentity.io/docs" target="_blank" color="primary" iconType="help">
            Docs
          </EuiHeaderLink>
        </EuiHeaderLinks>
      </EuiHeaderSectionItem>
    )

    const sections = [
      {
        items: [logo],
        borders: 'right',
        breadcrumbs: this.state.breadcrumbs,
      },
      {
        items: [links],
        borders: 'left',
      },
    ]

    return <EuiHeader position="fixed" sections={sections} />
  }
}
