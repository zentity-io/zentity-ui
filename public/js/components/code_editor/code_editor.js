import React from 'react';
import {
  EuiCodeEditor
} from "@elastic/eui";

import 'brace/theme/github';
import 'brace/mode/json';
import 'brace/ext/language_tools';

export function CodeEditor(props) {
  return (
    <EuiCodeEditor
      mode="json"
      theme="github"
      height={props.height}
      width={props.width || "100%"}
      isReadOnly={props.isReadOnly || false}
      setOptions={{
        fontSize: 13,
        showPrintMargin: false
      }}
      tabSize={2}
      value={props.value || ""}
      onChange={props.onChange || ((value) => console.debug(value)) }
    />
  );
}
