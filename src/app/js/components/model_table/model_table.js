import React from 'react'

import { cloneDeep, get } from 'lodash'

import {
  EuiBadge,
  EuiButton,
  EuiEmptyPrompt,
  EuiInMemoryTable,
  EuiLink,
  EuiSpacer,
  EuiText,
  EuiTitle,
} from '@elastic/eui'

/**
 * Expected props:
 *
 * - onClickActionClone  // Action to perform when choosing to clone an object.
 * - onClickActionCreate // Action to perform when choosing to create an object.
 * - onClickActionDelete // Action to perform when choosing to delete an object.
 * - onClickActionEdit   // Action to perform when choosing to edit an object.
 * - onClickActionRename // Action to perform when choosing to rename an object.
 * - modelCopy
 * - modelDiff
 * - section             // 'attributes', 'resolvers', 'matchers', or 'indices'
 * - selected            // The selected item.
 * - columns             // Extra columns besides 'name' to include in the table.
 */
export function ModelTable(props) {
  const items = []
  if (props.modelCopy && props.modelCopy[props.section]) {
    for (var name in props.modelCopy[props.section]) {
      const obj = cloneDeep(props.modelCopy[props.section][name])
      obj.name = name
      items.push(obj)
    }
  }

  const actions = [
    {
      name: 'Edit',
      description: 'Edit',
      icon: 'pencil',
      type: 'icon',
      onClick: (item) => props.onClickActionEdit(item.name),
      isPrimary: true,
    },
    {
      name: 'Rename',
      description: 'Rename',
      icon: 'visText',
      type: 'icon',
      onClick: (item) => props.onClickActionRename(item.name),
    },
    {
      name: 'Clone',
      description: 'Clone',
      icon: 'copy',
      type: 'icon',
      onClick: (item) => props.onClickActionClone(item.name),
    },
    {
      name: 'Delete',
      description: 'Delete',
      icon: 'trash',
      type: 'icon',
      color: 'danger',
      onClick: (item) => props.onClickActionDelete(item.name),
    },
  ]

  const columns = [
    {
      field: 'name',
      name: 'Name',
      sortable: true,
      truncateText: true,
      render: (name) => (
        <EuiLink name={name} onClick={(e) => props.onClickActionEdit(e.currentTarget.name)}>
          <EuiText>
            <span>{name}</span>

            {/* Apply a 'new' badge if the object only exists in modelCopy. */}
            {!props.model[props.section][name] && (
              <EuiBadge size="s" style={{ margin: '0 10px' }}>
                new
              </EuiBadge>
            )}

            {/* Apply a 'changed' badge if the object in model, but also exists in the 'added' or 'updated' modelDiff. */}
            {!!props.model[props.section][name] &&
              (get(props.modelDiff, `added.${props.section}.${name}`) ||
                get(props.modelDiff, `updated.${props.section}.${name}`)) && (
                <EuiBadge size="s" style={{ margin: '0 10px' }}>
                  changed
                </EuiBadge>
              )}
          </EuiText>
        </EuiLink>
      ),
      mobileOptions: {
        width: '100%',
      },
    },
  ]
  const extraColumns = props.columns || []
  for (var i in extraColumns) {
    columns.push(extraColumns[i])
  }
  columns.push({
    name: 'Actions',
    actions,
  })

  const createButton = (
    <EuiButton
      fill
      iconType="plusInCircle"
      isDisabled={props.loading}
      key="createObject"
      onClick={props.onClickActionCreate}
    >
      New{' '}
      {(() => {
        switch (props.section) {
          case 'attributes':
            return 'Attribute'
          case 'resolvers':
            return 'Resolver'
          case 'matchers':
            return 'Matcher'
          case 'indices':
            return 'Index'
        }
      })()}
    </EuiButton>
  )

  const search = {
    box: {
      incremental: true,
      placeholder: 'Search...',
    },
    filters: [],
    toolsLeft: [createButton],
  }

  const sorting = {
    sort: {
      field: 'name',
      direction: 'asc',
    },
  }

  return (
    <>
      {items.length > 0 && (
        <EuiInMemoryTable
          columns={columns}
          items={items}
          itemId="_id"
          hasActions={true}
          loading={props.loading}
          message={
            <EuiEmptyPrompt
              title={
                <EuiTitle>
                  <h3>No Results</h3>
                </EuiTitle>
              }
              titleSize="xs"
              body={`No ${props.section} matched your query.`}
              actions={createButton}
            />
          }
          pagination={false}
          search={search}
          sorting={sorting}
        />
      )}

      {/* Content to display when the given 'attributes' is empty. */}
      {items.length === 0 && props.section == 'attributes' && (
        <EuiEmptyPrompt
          title={
            <EuiTitle>
              <h3>Define Attributes</h3>
            </EuiTitle>
          }
          titleSize="xs"
          body={
            <>
              <EuiText>
                <a href="https://zentity.io/docs/entity-models/specification/#attributes" target="_blank">
                  Attributes
                </a>{' '}
                are the identity elements of an entity. You will reference them in the 'resolvers' and 'indices'
                sections of this entity model.
                <EuiTitle size="s">
                  <h3>Examples</h3>
                </EuiTitle>
                <EuiBadge size="s">name</EuiBadge>
                <EuiBadge size="s">address</EuiBadge>
                <EuiBadge size="s">phone</EuiBadge>
                <EuiBadge size="s">ip</EuiBadge>
                <EuiBadge size="s">hostname</EuiBadge>
                <EuiBadge size="s">timestamp</EuiBadge>
              </EuiText>
              <EuiSpacer size="s" />
            </>
          }
          actions={
            <EuiButton
              fill
              iconType="plusInCircle"
              isDisabled={props.loading}
              key="newObj"
              onClick={props.onClickActionCreate}
            >
              Create Attribute
            </EuiButton>
          }
        />
      )}

      {/* Content to display when the given 'resolvers' is empty. */}
      {items.length === 0 && props.section == 'resolvers' && (
        <EuiEmptyPrompt
          title={
            <EuiTitle>
              <h3>Define Resolvers</h3>
            </EuiTitle>
          }
          titleSize="xs"
          body={
            <>
              <EuiText>
                <a href="https://zentity.io/docs/entity-models/specification/#resolvers" target="_blank">
                  Resolvers
                </a>{' '}
                are sets of attributes that constitute a matching document.
                <EuiTitle size="s">
                  <h3>Examples</h3>
                </EuiTitle>
                <EuiBadge size="s">id</EuiBadge>
                <EuiBadge size="s">name+phone</EuiBadge>
                <EuiBadge size="s">name+street+city+state</EuiBadge>
                <EuiBadge size="s">name+street+zip</EuiBadge>
                <EuiBadge size="s">phone+email</EuiBadge>
              </EuiText>
              <EuiSpacer size="s" />
            </>
          }
          actions={
            <>
              {!!Object.keys(get(props.modelCopy, 'attributes') || []).length && (
                <EuiButton
                  fill
                  iconType="plusInCircle"
                  isDisabled={props.loading}
                  key="newObj"
                  onClick={props.onClickActionCreate}
                >
                  Create Resolver
                </EuiButton>
              )}
              {!Object.keys(get(props.modelCopy, 'attributes') || []).length && (
                <>
                  <EuiText color="subdued">
                    Resolvers require attributes, but this model has no attributes defined.
                  </EuiText>
                  <EuiSpacer size="m" />
                  <EuiButton
                    iconType="arrowLeft"
                    isDisabled={props.loading}
                    key="toAttributes"
                    onClick={() => props.onChangeTab('attributes')}
                  >
                    Define Attributes
                  </EuiButton>
                </>
              )}
            </>
          }
        />
      )}

      {/* Content to display when the given 'matchers' is empty. */}
      {items.length === 0 && props.section == 'matchers' && (
        <EuiEmptyPrompt
          title={
            <EuiTitle>
              <h3>Define Matchers</h3>
            </EuiTitle>
          }
          titleSize="xs"
          body={
            <>
              <EuiText>
                <a href="https://zentity.io/docs/entity-models/specification/#matchers" target="_blank">
                  Matchers
                </a>{' '}
                are templated Elasticsearch query clauses. You will reference them the 'indices' section of this entity
                model to control how zentity queries the indices.
                <EuiTitle size="s">
                  <h3>Examples</h3>
                </EuiTitle>
                <EuiBadge size="s">
                  <a
                    href="https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-match-query.html"
                    target="_blank"
                  >
                    match
                  </a>
                </EuiBadge>
                <EuiBadge size="s">
                  <a
                    href="https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-term-query.html"
                    target="_blank"
                  >
                    term
                  </a>
                </EuiBadge>
                <EuiBadge size="s">
                  <a
                    href="https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-fuzzy-query.html"
                    target="_blank"
                  >
                    fuzzy
                  </a>
                </EuiBadge>
                <EuiBadge size="s">
                  <a
                    href="https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-range-query.html"
                    target="_blank"
                  >
                    range
                  </a>
                </EuiBadge>
                <EuiBadge size="s">
                  <a
                    href="https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-script-query.html"
                    target="_blank"
                  >
                    script
                  </a>
                </EuiBadge>
              </EuiText>
              <EuiSpacer size="s" />
            </>
          }
          actions={
            <EuiButton
              fill
              iconType="plusInCircle"
              isDisabled={props.loading}
              key="newObj"
              onClick={props.onClickActionCreate}
            >
              Create Matcher
            </EuiButton>
          }
        />
      )}

      {/* Content to display when the given 'indices' is empty. */}
      {items.length === 0 && props.section == 'indices' && (
        <EuiEmptyPrompt
          title={
            <EuiTitle>
              <h3>Define Indices</h3>
            </EuiTitle>
          }
          titleSize="xs"
          body={
            <>
              <EuiText>
                <a href="https://zentity.io/docs/entity-models/specification/#indices" target="_blank">
                  Indices
                </a>{' '}
                control how zentity searches for attributes in Elasticsearch. You will associate index fields with
                attributes and matchers.
                <br />
                <br />
                By clicking 'Create Index,' you are not creating an Elasticsearch index, but rather a definition of how
                zentity will search that index.
              </EuiText>
              <EuiSpacer size="s" />
            </>
          }
          actions={
            <EuiButton
              fill
              iconType="plusInCircle"
              isDisabled={props.loading}
              key="newObj"
              onClick={props.onClickActionCreate}
            >
              Create Index
            </EuiButton>
          }
        />
      )}
    </>
  )
}
