import React from 'react';
import {
  EuiButton,
  EuiComboBox,
  EuiFieldSearch,
  EuiFilterButton,
  EuiFilterGroup,
  EuiFilterSelectItem,
  EuiFlexGroup,
  EuiFlexItem,
  EuiForm,
  EuiPopover,
  EuiPopoverTitle,
  EuiSearchBar,
  EuiText,
} from '@elastic/eui';

import { cloneDeep } from 'lodash';
const queryString = require('query-string');

const utils = require('../../utils');

export class ExploreSearch extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      form: this.defaultForm(),
      models: this.props.models,
      loading: this.props.loading,
      isEntityTypePopoverOpen: false,
      isIndicesPopoverOpen: false
    };

    this.onChangeEntityTypeOption = this.onChangeEntityTypeOption.bind(this);
    this.onChangeEntityTypeQuery = this.onChangeEntityTypeQuery.bind(this);
    this.onClickEntityTypeButton = this.onClickEntityTypeButton.bind(this);
    this.onCloseEntityTypePopover = this.onCloseEntityTypePopover.bind(this);
    this.onChangeIndicesQuery = this.onChangeIndicesQuery.bind(this);
    this.onChangeSearchQuery = this.onChangeSearchQuery.bind(this);
    this.onClickIndicesButton = this.onClickIndicesButton.bind(this);
    this.onCloseIndicesPopover = this.onCloseIndicesPopover.bind(this);
    this.onSubmitSearchQuery = this.onSubmitSearchQuery.bind(this);
    this.onToggleIndex = this.onToggleIndex.bind(this);
  };

  // When the parent updates the models properties,
  // update this state and reset the form.
  componentDidUpdate(oldProps) {
    if (this.props.models !== oldProps.models) {
      this.setState({
        models: this.props.models
      }, () => {
        this.resetForm();
      });
    }
    if (this.props.loading !== oldProps.loading) {
      this.setState({
        loading: this.props.loading
      });
    }
  };

  componentDidCatch(error, info) {
    this.props.onAddToast({
      title: error,
      text: (
        <p>
          {info}
        </p>
      )
    });
  };

  defaultForm() {
    const form = {
      input: {
        entityType: null,
        entityTypeQuery: '',
        attributes: {},
        indices: [],
        indicesQuery: '',
        query: ''
      },
      options: {
        entityTypes: [],
        attributes: [],
        indices: [],
        resolvers: []
      },
      optionsSelected: {
        entityType: [],
        numIndices: 0
      }
    };
    return form;
  };

  resetForm() {
    console.debug('Reset form: Started');
    const form = this.state.form;

    // Set form options for entity types
    for (var entityType in this.state.models) {
      const entityTypeOption = {
        label: entityType,
        name: entityType
      };
      form.options.entityTypes.push(entityTypeOption);
    }
    form.options.entityTypes.sort((a, b) => (a.label > b.label) ? 1 : -1);

    this.setState({
      form: form
    }, () => {
      console.debug('Reset form: State');
      console.debug(this.state);
    });
  };

  onChangeEntityTypeOption(item) {
    console.debug('Change entity type: Start');
    console.debug(item);

    // Set entity type
    const form = cloneDeep(this.state.form);
    form.input.entityType = item.name;
    for (var i in form.options.entityTypes) {
      if (item.name === form.options.entityTypes[i].name) {
        if (form.options.entityTypes[i].checked !== 'on')
          form.options.entityTypes[i].checked = 'on';
        else
          return; // Entity type hasn't changed. Don't change anything else.
      } else {
        form.options.entityTypes[i].checked = undefined;
      }
    }

    // Reset form options
    const model = this.state.models[item.name];

    // Reset form options for attributes
    form.options.attributes = [];
    for (var attributeName in model.attributes) {
      var attribute = model.attributes[attributeName];
      var attributesOption = {
        label: attributeName,
        name: attributeName
      };
      form.options.attributes.push(attributesOption);
      form.input.attributes[attributeName] = [];
    }
    form.options.attributes.sort((a, b) => (a.label > b.label) ? 1 : -1);

    // Reset form options for indices
    form.options.indices = [];
    for (var indexName in model.indices) {
      var index = model.indices[indexName];
      var indicesOption = {
        name: indexName,
        label: indexName,
        checked: 'on'
      };
      form.options.indices.push(indicesOption);
      form.input.indices.push(indicesOption);
    }
    form.options.indices.sort((a, b) => (a.label > b.label) ? 1 : -1);
    form.optionsSelected.numIndices = 0;
    for (var i in form.options.indices)
      if (form.options.indices[i].checked === 'on')
        form.optionsSelected.numIndices++;

    // Apply new state
    this.setState({
      form: form
    }, () => {
      console.debug('Change entity type: State');
      console.debug(this.state);
    });
  };

  onClickEntityTypeButton() {
    this.setState({
      isEntityTypePopoverOpen: !this.state.isEntityTypePopoverOpen,
    });
  };

  onCloseEntityTypePopover() {
    this.setState({
      isEntityTypePopoverOpen: false,
    });
  };

  onChangeEntityTypeQuery(event) {
    console.debug('onChangeEntityTypeQuery()');
    const form = this.state.form;
    form.input.entityTypeQuery = event.target.value;
    this.setState({
      form: form,
    }, () => {
      console.debug(this.state);
    });
  };

  /**
   * If index selection was on, set it to undefined and decrement count.
   * If index selection was undefined, set it to on and increment count.
   */
  onToggleIndex(item, idx) {
    console.debug('Toggle index: Start');
    console.debug(idx);
    console.debug(item);
    const form = this.state.form;
    if (item.checked === 'on') {
      form.options.indices[idx].checked = undefined;
      form.optionsSelected.numIndices--;
    } else if (item.checked === undefined) {
      form.options.indices[idx].checked = 'on';
      form.optionsSelected.numIndices++;
    }
    this.setState({
      form: form
    }, () => {
      console.debug('Toggle index: State');
      console.debug(this.state);
    });
  };

  onClickIndicesButton() {
    this.setState({
      isIndicesPopoverOpen: !this.state.isIndicesPopoverOpen,
    });
  };

  onCloseIndicesPopover() {
    this.setState({
      isIndicesPopoverOpen: false,
    });
  };

  onChangeIndicesQuery(event) {
    console.debug('onChangeIndicesQuery()');
    const form = this.state.form;
    form.input.indicesQuery = event.target.value;
    this.setState({
      form: form,
    }, () => {
      console.debug(this.state);
    });
  };

  onChangeSearchQuery(event) {
    console.debug('onChangeSearchQuery()');
    const form = this.state.form;
    form.input.query = event.target.value;
    this.setState({
      form: form,
    }, () => {
      console.debug(this.state);
    });
  };

  onSubmitSearchQuery() {
    try {
      console.debug('onSubmitSearchQuery()');
      if (this.state.loading) {
        console.debug('Aborting: Already loading.');
        return;
      }
      const entityType = this.state.form.input.entityType;
      const model = this.state.models[entityType];
      const esQuery = EuiSearchBar.Query.parse(this.state.form.input.query);
      console.debug('Search bar query:');
      console.debug(this.state.form.input.query);
      console.debug('Parsed query:');
      console.debug(esQuery);
      if (esQuery && model) {

        // Parse query from search bar and submit resolution query
        const input = utils.esQueryToResolutionInput(esQuery, model.attributes);
        const request = {
          entity_type: this.state.form.input.entityType,
          params: {
            _explanation: true,
            _score: true
          },
          data: {}
        };
        if (Object.keys(input.attributes).length > 0)
            request.data.attributes = input.attributes;
        if (input.terms.length > 0)
            request.data.terms = input.terms;

        // Scope the resolution to specific indices.
        if (this.state.form.optionsSelected.numIndices != this.state.form.options.indices.length) {
          if (request.data.scope === undefined)
            request.data.scope = {}
          for (var i in this.state.form.options.indices) {
            const index = this.state.form.options.indices[i];
            if (index.checked === 'on') {
              if (request.data.scope.include === undefined)
                request.data.scope.include = {}
              if (request.data.scope.include.indices === undefined)
                request.data.scope.include.indices = [];
              request.data.scope.include.indices.push(index.name);
            }
          }
        }

        // Submit the resolution request
        this.props.onSubmitResolution(request);
      }
    } catch (error) {
      this.props.onAddToast(utils.errorToast(error));
    }
  };

  render() {

    const entityTypeButton = (
      <EuiFilterButton
        iconType="arrowDown"
        isLoading={this.state.loading}
        onClick={this.onClickEntityTypeButton}
        isSelected={this.state.isEntityTypePopoverOpen}
        hasActiveFilters={!!this.state.form.input.entityType}
        grow={true}>
        { !this.state.form.input.entityType &&
          <>Entity type</>
        }
        { !!this.state.form.input.entityType &&
          <>{this.state.form.input.entityType}</>
        }
      </EuiFilterButton>
    );

    const entityTypesFiltered = [];
    var entityTypesFilteredMatches = false;
    for (var i = 0; i < this.state.form.options.entityTypes.length; i++) {
      const idx = i;
      const item = this.state.form.options.entityTypes[idx];
      const q = this.state.form.input.entityTypeQuery.toLowerCase().trim();
      if (q === '' || item.name.toLowerCase().includes(q)) {
        entityTypesFilteredMatches = true;
        entityTypesFiltered.push(
          <EuiFilterSelectItem onClick={() => this.onChangeEntityTypeOption(item)} checked={item.checked} key={idx}>
            {item.name}
          </EuiFilterSelectItem>
        )
      }
    }
    if (!entityTypesFilteredMatches) {
      entityTypesFiltered.push(
        <EuiText key="0" size="s" color="subdued" textAlign="center" style={{ "padding": "10px" }}>
          No matching entity types.
        </EuiText>
      )
    }

    const indicesButton = (
      <EuiFilterButton
        iconType="arrowDown"
        onClick={this.onClickIndicesButton}
        isSelected={this.state.isIndicesPopoverOpen}
        numFilters={0}
        hasActiveFilters={this.state.form.optionsSelected.numIndices > 0}
        isDisabled={this.state.form.options.indices.length == 0}
        numActiveFilters={this.state.form.optionsSelected.numIndices}
        grow={true}>
        Indices
      </EuiFilterButton>
    );

    const indicesFiltered = [];
    var indicesFilteredMatches = false;
    for (var i = 0; i < this.state.form.options.indices.length; i++) {
      const idx = i;
      const item = this.state.form.options.indices[idx];
      const q = this.state.form.input.indicesQuery.toLowerCase().trim();
      if (q === '' || item.name.toLowerCase().includes(q)) {
        indicesFilteredMatches = true;
        indicesFiltered.push(
          <EuiFilterSelectItem onClick={() => this.onToggleIndex(item, idx)} checked={item.checked} key={idx}>
            {item.name}
          </EuiFilterSelectItem>
        )
      }
    }
    if (!indicesFilteredMatches) {
      indicesFiltered.push(
        <EuiText key="0" size="s" color="subdued" textAlign="center" style={{ "padding": "10px" }}>
          No matching indices.
        </EuiText>
      )
    }

    return (
      <EuiForm>
        <EuiFlexGroup gutterSize="s">

          <EuiFlexItem grow={2}>
            <EuiFlexGroup gutterSize="s" responsive={false}>
              <EuiFlexItem grow={true}>
                <EuiFilterGroup>
                  <EuiPopover
                    id="popover"
                    ownFocus
                    button={entityTypeButton}
                    isOpen={this.state.isEntityTypePopoverOpen}
                    closePopover={this.onCloseEntityTypePopover}
                    panelPaddingSize="none">
                    <EuiPopoverTitle>
                      <EuiFieldSearch
                        value={this.state.form.input.entityTypeQuery}
                        onChange={this.onChangeEntityTypeQuery}
                      />
                    </EuiPopoverTitle>
                    <div className="euiFilterSelect__items" style={{ maxHeight: "200px", width: "400px" }}>
                      { entityTypesFiltered }
                    </div>
                  </EuiPopover>
                </EuiFilterGroup>
              </EuiFlexItem>

              <EuiFlexItem grow={true}>
                <EuiFilterGroup>
                  <EuiPopover
                    id="popover"
                    ownFocus
                    button={indicesButton}
                    isOpen={this.state.isIndicesPopoverOpen}
                    closePopover={this.onCloseIndicesPopover}
                    panelPaddingSize="none">
                    <EuiPopoverTitle>
                      <EuiFieldSearch
                        value={this.state.form.input.indicesQuery}
                        onChange={this.onChangeIndicesQuery}
                      />
                    </EuiPopoverTitle>
                    <div className="euiFilterSelect__items" style={{ maxHeight: "200px", width: "400px" }}>
                      { indicesFiltered }
                    </div>
                  </EuiPopover>
                </EuiFilterGroup>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlexItem>

          <EuiFlexItem grow={7}>
            <EuiFieldSearch
              fullWidth
              placeholder="Search..."
              value={this.state.form.input.query}
              onChange={this.onChangeSearchQuery}
              onSearch={this.onSubmitSearchQuery}
              disabled={this.state.loading}
              isLoading={this.state.loading}
              />
          </EuiFlexItem>

          <EuiFlexItem grow={1}>
            <EuiButton
              type="submit"
              fill
              fullWidth
              iconType="inspect"
              onClick={this.onSubmitSearchQuery}
              isDisabled={this.state.loading || this.state.form.optionsSelected.numIndices === 0 || this.state.form.input.query.trim() === ''}
            >
              Resolve
            </EuiButton>
          </EuiFlexItem>

        </EuiFlexGroup>
      </EuiForm>
    );
  };
};
