# zentity-ui

zentity-ui is the official user interface for **[zentity](https://zentity.io/)**.

**⚠️ Experimental - Not ready for production.** zentity-ui is suitable only for development at this time. Things are expected to be unstable until its first beta release, which is targeted for May 2021. Currently there is little documentation, little automated testing, no semantic versioning, and no settled conventions for its interfaces or configurations.


## Getting started for development

**Step 1.** Install [Elasticsearch](https://www.elastic.co/downloads/elasticsearch) and [zentity](https://zentity.io/docs/installation/), or simply download and run the [zentity sandbox](https://zentity.io/sandbox/).

**Step 2.** Install these pre-requisites for development.

- [nvm](https://github.com/nvm-sh/nvm)
- [yarn](https://classic.yarnpkg.com/en/docs/install/)

**Step 3.** Clone this repository and navigate into the cloned directory.

```sh
git clone https://github.com/zentity-io/zentity-ui.git && cd zentity-ui
```

**Step 4.** Use the version of Node.js specified in the `.nvmrc` file.

```sh
nvm install
```

**Step 5.** Install the dependencies in `package.json`.

```sh
yarn install
```

**Step 6.** Copy `zentity-ui.yml` and modify your copy. Do not track your copy with git.

```sh
cp zentity-ui.yml zentity-ui-custom.yml
```

**Step 7.** Start the project in development mode...

...using your custom configuration file from the prior step:

```sh
yarn dev -c zentity-ui-custom.yml
```

...using the default configuration file:

```sh
yarn dev
```

It should take less than a minute for the build to complete the first time. If you open zentity-ui in your browser before the build completes, you may see an error message that says `Error: ENOENT: no such file or directory`.

**Step 8.** Open zentity-ui in your web browser. The default endpoint is: http://localhost:2048


## <a name="license">License</a>

```
This software is licensed under the Apache License, version 2 ("ALv2"), quoted below.

Licensed under the Apache License, Version 2.0 (the "License"); you may not
use this file except in compliance with the License. You may obtain a copy of
the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
License for the specific language governing permissions and limitations under
the License.
```
