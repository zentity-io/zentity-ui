import React from 'react'
import { Link } from 'react-router-dom'
import {
  EuiCard,
  EuiEmptyPrompt,
  EuiFlexGroup,
  EuiFlexItem,
  EuiIcon,
  EuiImage,
  EuiPage,
  EuiPageBody,
  EuiSpacer,
  EuiTitle,
} from '@elastic/eui'

export class HomePage extends React.Component {
  render() {
    return (
      <EuiPage className="zentity-home">
        <EuiPageBody style={{ margin: '0 auto', maxWidth: '800px' }}>
          <EuiEmptyPrompt
            title={
              <>
                <EuiImage
                  alt="zentity"
                  size={50}
                  url={require('/img/zentity-logo.png')}
                  style={{ height: 50, width: 50 }}
                />
                <EuiSpacer size="l" />
                <EuiImage alt="zentity" url={require('/img/zentity-heading.png')} style={{ height: 48, width: 140 }} />
                <EuiSpacer size="l" />
              </>
            }
          />
          <EuiFlexGroup>
            <EuiFlexItem>
              <Link to="/models">
                <EuiCard
                  icon={<EuiIcon size="xxl" type="gear" />}
                  title={
                    <EuiTitle>
                      <h2>Models</h2>
                    </EuiTitle>
                  }
                  description="Manage entity models"
                  betaBadgeLabel="Experimental"
                />
              </Link>
            </EuiFlexItem>
            <EuiFlexItem>
              <Link to="/explore">
                <EuiCard
                  icon={<EuiIcon size="xxl" type="inspect" />}
                  title={
                    <EuiTitle>
                      <h2>Explore</h2>
                    </EuiTitle>
                  }
                  description="Run entity resolution"
                  betaBadgeLabel="Experimental"
                />
              </Link>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiPageBody>
      </EuiPage>
    )
  }
}
