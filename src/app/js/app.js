// Third party components
import React from 'react'
import {
  HashRouter as Router,
  Route,
  Switch
} from 'react-router-dom'
import {
  EuiCodeBlock,
  EuiGlobalToastList,
  EuiText
} from '@elastic/eui'

// App components
import { HomePage } from './components/home_page'
import { ErrorPage } from './components/error_page'
import { ExplorePage } from './components/explore_page'
import { ModelsPage } from './components/models_page'
import { ModelPage } from './components/model_page'
import { PageHeader } from './components/page_header'
const utils = require('./utils')

// Styles
import '@elastic/eui/dist/eui_theme_light.css'
import '../css/index.sass'

// Preload the icons. Dynamic imports isn't working with the parcel bundler.
// Consider webpack instead of parcel.
import { appendIconComponentCache } from '@elastic/eui/es/components/icon/icon'
import { icon as EuiIconAlert } from '@elastic/eui/es/components/icon/assets/alert'
import { icon as EuiIconApps } from '@elastic/eui/es/components/icon/assets/apps'
import { icon as EuiIconArrowDown } from '@elastic/eui/es/components/icon/assets/arrow_down'
import { icon as EuiIconArrowLeft } from '@elastic/eui/es/components/icon/assets/arrow_left'
import { icon as EuiIconArrowRight } from '@elastic/eui/es/components/icon/assets/arrow_right'
import { icon as EuiIconArrowUp } from '@elastic/eui/es/components/icon/assets/arrow_up'
import { icon as EuiIconBoxesHorizontal } from '@elastic/eui/es/components/icon/assets/boxes_horizontal'
import { icon as EuiIconCheck } from '@elastic/eui/es/components/icon/assets/check'
import { icon as EuiIconCopy } from '@elastic/eui/es/components/icon/assets/copy'
import { icon as EuiIconCross } from '@elastic/eui/es/components/icon/assets/cross'
import { icon as EuiIconDatabase } from '@elastic/eui/es/components/icon/assets/database'
import { icon as EuiIconDocument } from '@elastic/eui/es/components/icon/assets/document'
import { icon as EuiIconDownload } from '@elastic/eui/es/components/icon/assets/download'
import { icon as EuiIconEmpty } from '@elastic/eui/es/components/icon/assets/empty'
import { icon as EuiIconFullScreen } from '@elastic/eui/es/components/icon/assets/full_screen'
import { icon as EuiIconGear } from '@elastic/eui/es/components/icon/assets/gear'
import { icon as EuiIconHelp } from '@elastic/eui/es/components/icon/assets/help'
import { icon as EuiIconIndexEdit } from '@elastic/eui/es/components/icon/assets/index_edit'
import { icon as EuiIconInspect } from '@elastic/eui/es/components/icon/assets/inspect'
import { icon as EuiIconLogoGithub } from '@elastic/eui/es/components/icon/assets/logo_github'
import { icon as EuiIconMinusInCircle } from '@elastic/eui/es/components/icon/assets/minus_in_circle'
import { icon as EuiIconPencil } from '@elastic/eui/es/components/icon/assets/pencil'
import { icon as EuiIconPlusInCircle } from '@elastic/eui/es/components/icon/assets/plus_in_circle'
import { icon as EuiIconRefresh } from '@elastic/eui/es/components/icon/assets/refresh'
import { icon as EuiIconReturnKey } from '@elastic/eui/es/components/icon/assets/return_key'
import { icon as EuiIconSearch } from '@elastic/eui/es/components/icon/assets/search'
import { icon as EuiIconSortDown } from '@elastic/eui/es/components/icon/assets/sort_down'
import { icon as EuiIconSortUp } from '@elastic/eui/es/components/icon/assets/sort_up'
import { icon as EuiIconTraining } from '@elastic/eui/es/components/icon/assets/training'
import { icon as EuiIconTrash } from '@elastic/eui/es/components/icon/assets/trash'
import { icon as EuiIconVisText } from '@elastic/eui/es/components/icon/assets/vis_text'
appendIconComponentCache({
  alert: EuiIconAlert,
  apps: EuiIconApps,
  arrowDown: EuiIconArrowDown,
  arrowLeft: EuiIconArrowLeft,
  arrowRight: EuiIconArrowRight,
  arrowUp: EuiIconArrowUp,
  boxesHorizontal: EuiIconBoxesHorizontal,
  check: EuiIconCheck,
  copy: EuiIconCopy,
  cross: EuiIconCross,
  database: EuiIconDatabase,
  document: EuiIconDocument,
  download: EuiIconDownload,
  empty: EuiIconEmpty,
  fullScreen: EuiIconFullScreen,
  gear: EuiIconGear,
  help: EuiIconHelp,
  indexEdit: EuiIconIndexEdit,
  inspect: EuiIconInspect,
  logoGithub: EuiIconLogoGithub,
  minusInCircle: EuiIconMinusInCircle,
  pencil: EuiIconPencil,
  plusInCircle: EuiIconPlusInCircle,
  refresh: EuiIconRefresh,
  returnKey: EuiIconReturnKey,
  search: EuiIconSearch,
  sortDown: EuiIconSortDown,
  sortUp: EuiIconSortUp,
  training: EuiIconTraining,
  trash: EuiIconTrash,
  visText: EuiIconVisText
})

export default class App extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      toasts: []
    }
    this.onAddToast = this.onAddToast.bind(this)
    this.onRemoveToast = this.onRemoveToast.bind(this)
  }

  componentDidCatch(error, errorInfo) {
    var text = 'Unknown error'
    try {
      if (error.message)
        title = error.message
      if (errorInfo.componentStack)
        text = error.message + errorInfo.componentStack
    } catch (e) {
      console.exception(e)
    }
    this.onAddToast({
      title: <EuiText>{error.message}</EuiText>,
      text: <EuiCodeBlock isCopyable style={{ maxHeight: '200px' }}>{text}</EuiCodeBlock>
    })
  }

  onAddToast(toast) {
    const _toast = {
      id: utils.uniqueKey(),
      title: toast.title,
      color: toast.color || 'danger',
      iconType: toast.iconType || 'alert',
      text: toast.text
    }
    this.setState({
      toasts: this.state.toasts.concat(_toast),
    })
  }

  onRemoveToast(removedToast) {
    this.setState(prevState => ({
      toasts: prevState.toasts.filter(toast => toast.id !== removedToast.id),
    }))
  }

  render() {
    return (
      <Router>

        {/* Page header */}
        <PageHeader />

        {/* Page content */}
        <Switch>
          <Route path='/' exact render={(props) => (
            <HomePage {...props} onAddToast={this.onAddToast} />
          )}/>
          <Route path='/models/:model_id/:tab/:selected' render={(props) => (
            <ModelPage {...props} onAddToast={this.onAddToast} />
          )}/>
          <Route path='/models/:model_id/:tab' render={(props) => (
            <ModelPage {...props} onAddToast={this.onAddToast} />
          )}/>
          <Route path='/models/:model_id' render={(props) => (
            <ModelPage {...props} onAddToast={this.onAddToast} />
          )}/>
          <Route path='/models' render={(props) => (
            <ModelsPage {...props} onAddToast={this.onAddToast} />
          )}/>
          <Route path='/explore' render={(props) => (
            <ExplorePage {...props} onAddToast={this.onAddToast} />
          )}/>
          <Route path='*' render={(props) => (
            <ErrorPage {...props} onAddToast={this.onAddToast} />
          )}/>
        </Switch>

        {/* Toasts */}
        <EuiGlobalToastList
          toasts={this.state.toasts}
          dismissToast={this.onRemoveToast}
          toastLifeTimeMs={10000}
        />
      </Router>
    )
  }
}
