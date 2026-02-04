This file is a merged representation of a subset of the codebase, containing files not matching ignore patterns, combined into a single document by Repomix.

# File Summary

## Purpose
This file contains a packed representation of a subset of the repository's contents that is considered the most important context.
It is designed to be easily consumable by AI systems for analysis, code review,
or other automated processes.

## File Format
The content is organized as follows:
1. This summary section
2. Repository information
3. Directory structure
4. Repository files (if enabled)
5. Multiple file entries, each consisting of:
  a. A header with the file path (## File: path/to/file)
  b. The full contents of the file in a code block

## Usage Guidelines
- This file should be treated as read-only. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.

## Notes
- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Files matching these patterns are excluded: src/assets
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Files are sorted by Git change count (files with more changes are at the bottom)

# Directory Structure
```
.babelrc
.circleci/config.yml
.eslintrc.yml
.github/ISSUE_TEMPLATE.md
.github/ISSUE_TEMPLATE/bug_report.md
.github/ISSUE_TEMPLATE/feature_request.md
.github/workflows/build-on-push.yml
.gitignore
AGENTS.md
bkp/favicomatic.zip
bkp/IceTab_banner2-ChromeWebStore.png
bkp/key.txt
CHANGELOG.md
config.js
CREDITS.md
crx/dist.crx
crx/dist.pem
IceTab_banner.png
LICENSE
package.json
README.md
scripts/validate-build.sh
server.js
server/database.py
server/docker-compose.yml
server/Dockerfile
server/icetab.db
server/main.py
server/README.md
server/requirements.txt
server/seed_db.py
server/test_health.py
src/_locales/de/messages.json
src/_locales/en/messages.json
src/_locales/zh_CN/messages.json
src/app/App.svelte
src/app/component/main/Drawer.svelte
src/app/component/main/Snackbar.svelte
src/app/component/main/Toolbar.svelte
src/app/component/sync/SyncStatusBadge.svelte
src/app/component/tags/TagInput.svelte
src/app/index.css
src/app/index.html
src/app/index.js
src/app/page/main/DetailList.svelte
src/app/page/settings/SettingsView.svelte
src/app/router/index.js
src/app/store/bridge.js
src/app/store/index.js
src/app/store/lists.js
src/app/store/syncStore.svelte.js
src/background/browserAction.js
src/background/commandHandler.js
src/background/contextMenus.js
src/background/index.js
src/background/init.js
src/background/installedEventHandler.js
src/background/messageHandler.js
src/common/autoreload.js
src/common/constants.js
src/common/exchange.js
src/common/helper.js
src/common/i18n.js
src/common/intents.js
src/common/list.js
src/common/listManager.d.ts
src/common/listManager.js
src/common/logger.svelte.js
src/common/migrate.js
src/common/options.js
src/common/runtimeContext.js
src/common/service/boss.js
src/common/service/custom-sync.js
src/common/storage.js
src/common/sync-logger.js
src/common/tab.js
src/common/tabs.js
src/common/tracker.js
src/common/utils.js
src/content.js
src/exchanger.js
src/manifest.json
src/mock/index.js
vue.config.js
webpack.common.js
webpack.dev.js
webpack.prod.js
webpack.serve.js
```

# Files

## File: src/common/autoreload.js
````javascript
const filesInDirectory = dir => new Promise(resolve => {
  dir.createReader().readEntries(entries => {
    Promise.all(entries.filter(e => e.name[0] !== '.').map(e => e.isDirectory ? filesInDirectory(e) : new Promise(resolve => e.file(resolve)))).then(files => [].concat(...files)).then(resolve)
  })
})

const timestampForFilesInDirectory = dir => filesInDirectory(dir).then(files => files.map(f => f.name + f.lastModifiedDate).join())

const reload = () => {
  chrome.runtime.openOptionsPage()
}

const watchChanges = (dir, lastTimestamp) => {
  timestampForFilesInDirectory(dir).then(timestamp => {
    if (!lastTimestamp || (lastTimestamp === timestamp)) {
      setTimeout(() => watchChanges(dir, timestamp), 1000)
    } else {
      reload()
    }
  })
}

export const autoreload = () => {
  chrome.management.getSelf(self => {
    if (self.installType === 'development') {
      console.log('autoreload watching changes')
      chrome.runtime.getPackageDirectoryEntry(dir => watchChanges(dir))
    }
  })
}

export default autoreload
````

## File: src/common/i18n.js
````javascript
export default (...args) => chrome.i18n.getMessage(...args)
````

## File: src/common/listManager.d.ts
````typescript
declare class ListManager {
  addList(list: object): Promise<void>
  updateListById(listId: string, list: object, time?: number): Promise<void>
  removeListById(listId: string): Promise<void>
  changeListOrderRelatively(listId: string, diff: number): Promise<void>

  init(): Promise<void>
  mapMutations(): object
  createVuexPlugin(): object
  idle(): Promise<void>
}

declare const listManager: ListManager

export default listManager
````

## File: src/common/tab.js
````javascript
import _ from 'lodash'
import {PICKED_TAB_PROPS} from './constants'

// it also be applied for the browser Tab object
export const normalizeTab = tab => {
  const normalizedTab = _.pick(tab, PICKED_TAB_PROPS)
  normalizedTab.muted = normalizedTab.muted || tab.mutedInfo && tab.mutedInfo.muted
  return normalizedTab
}
````

## File: src/content.js
````javascript
import {SYNC_SERVICE_URL} from './common/constants'
import {sendMessage} from './common/utils'

console.debug('content_script loaded')
const main = async () => {
  if (!document.URL.startsWith(SYNC_SERVICE_URL)) return
  const token = localStorage._BOSS_TOKEN
  console.debug('token', token)
  if (!token) return
  await sendMessage({login: {token}})
}

main()
````

## File: .github/ISSUE_TEMPLATE.md
````markdown
<!--

如果你来自中国请尽量用英语描述（或复述）你的问题，因为中国人普遍学习过英语而其他国家的人则通常无法阅读中文。这有助于获得来自其他国家的人的帮助。

请在提交一个 issue 之前在 issue 列表中搜索是否有重复的 issue。如果有请在其之下评论或者点击 +1 按钮
请在标题中简要描述你的问题，而不是采用诸如“一个建议”，“提个问题”之类笼统的标题

（你可以在提交前删除这些注释）

Please find is there a duplicate issue in the issue list. If it exists, please comment under that issue or click +1 button.
Please describe your problem in the title, instead of using a general title like "a suggestion" or "a question".

(You can remove this comment before submitting)

-->
````

## File: .github/ISSUE_TEMPLATE/bug_report.md
````markdown
---
name: Bug report
about: Create a report to help us improve

---

<!--

如果你来自中国请尽量用英语描述（或复述）你的问题，因为中国人普遍学习过英语而其他国家的人则通常无法阅读中文。这有助于获得来自其他国家的人的帮助。

请在提交一个 issue 之前在 issue 列表中搜索是否有重复的 issue。如果有请在其之下评论或者点击 +1 按钮
请在标题中简要描述你的问题，而不是采用诸如“一个建议”，“提个问题”之类笼统的标题

（你可以在提交前删除这些注释）

Please find is there a duplicate issue in the issue list. If it exists, please comment under that issue or click +1 button.
Please describe your problem in the title, instead of using a general title like "a suggestion" or "a question".

(You can remove this comment before submitting)

-->

扩展版本 (extension version):
浏览器版本 (browser version):
操作系统 (operating system):
问题描述 (problem description):

实际行为 (actual behavior):

期望行为 (expected behavior):

重现步骤 (reproduce step):
````

## File: .github/ISSUE_TEMPLATE/feature_request.md
````markdown
---
name: Feature request
about: Suggest an idea for this project

---

<!--

如果你来自中国请尽量用英语描述（或复述）你的问题，因为中国人普遍学习过英语而其他国家的人则通常无法阅读中文。这有助于获得来自其他国家的人的帮助。

请在提交一个 issue 之前在 issue 列表中搜索是否有重复的 issue。如果有请在其之下评论或者点击 +1 按钮
请在标题中简要描述你的问题，而不是采用诸如“一个建议”，“提个问题”之类笼统的标题

（你可以在提交前删除这些注释）

Please find is there a duplicate issue in the issue list. If it exists, please comment under that issue or click +1 button.
Please describe your problem in the title, instead of using a general title like "a suggestion" or "a question".

(You can remove this comment before submitting)

-->
````

## File: .github/workflows/build-on-push.yml
````yaml
name: Build Extension on Push

# This workflow will run on any push to the 'main' branch
# but only if files in the 'src/' directory have changed.
on:
  push:
    branches:
      - main  # Or 'master' if that's your default branch
    paths:
      - 'src/**'
      - 'package.json'
      - 'yarn.lock'

jobs:
  build-and-package:
    # Use the latest stable version of Ubuntu to run the job
    runs-on: ubuntu-latest

    steps:
      # Step 1: Check out your repository's code
      - name: Checkout repository
        uses: actions/checkout@v4

      # Step 2: Set up a Node.js environment.
      # Using Node.js v18, which is a stable long-term support (LTS) version.
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'yarn'

      # Step 3: Install all project dependencies from yarn.lock
      - name: Install dependencies
        run: yarn install --frozen-lockfile

      # Step 4: Run the build script defined in your package.json
      # NOTE: Your README mentions using a special flag for older dependencies.
      # If the build fails, you may need to use the command from your README:
      # NODE_OPTIONS=--openssl-legacy-provider yarn build
      - name: Build extension
        run: yarn build

      # Step 5: Create a zip file from the 'dist' directory
      # This command is based on the 'package' script in your package.json
      - name: Package extension
        run: |
          cd dist
          zip -r ../dist.zip . -x "*.map"

      # Step 6: Upload the 'dist.zip' file as a workflow artifact
      - name: Upload build artifact
        uses: actions/upload-artifact@v4
        with:
          name: icetab-package
          path: dist.zip
````

## File: AGENTS.md
````markdown
# AGENTS.md

This repository is actively maintained and does not rely on external agent configuration
beyond what is documented here.

## Purpose of this file

This file exists to:

- Declare how automated coding agents (e.g. Codex) should operate in this repository
- Prevent agents from searching for missing or implied instructions
- Define scope, priorities, and constraints clearly

If you are an automated agent: **do not look for additional agent instructions elsewhere**.

---

## Project Overview

This is a browser extension / web app for stashing, organising, and restoring browser tabs.
It includes:
- A Svelte-based UI
- Centralised state management for lists, tags, pinning, restore semantics
- Optional remote sync and AI-assisted categorisation
- A Webpack-based build pipeline

The codebase builds successfully in its current state.

---

## Agent Operating Rules

When making changes, agents must follow these rules:

1. **Sequential work**
   - Work on one logical concern at a time.
   - Do not mix refactors, feature work, and cosmetic changes in the same step.

2. **No scope expansion**
   - Do not add new features beyond what is already implied by the UI or existing store logic.
   - Prefer fixing, completing, or removing over inventing.

3. **Truth over appearance**
   - Behavioural correctness and truthful state (especially sync state) take priority over UI polish.
   - The app must not claim actions succeeded when they did not.

4. **Remove dead ends**
   - No visible UI control should be inert.
   - If a control cannot be fully implemented, it should be removed or hidden.

5. **Respect existing architecture**
   - Business logic belongs in stores/services, not UI components.
   - UI components should remain thin and declarative.

---

## Sync-Specific Guidance

Sync is a sensitive area.

Agents must ensure:
- Failed syncs are surfaced honestly
- Local-only states are not reported as successful syncs
- Empty state changes can propagate correctly
- Remote state is not silently orphaned

Do not optimise sync logic at the expense of correctness.

---

## AI Features

AI-assisted categorisation is optional and secondary.

If touching AI-related code:
- Do not make it automatic or implicit
- Ensure users trigger it deliberately
- Clearly define whether AI output overwrites or merges with user data
- Handle loading and error states explicitly

---

## Build & Tooling

- The project builds successfully using the existing Webpack configuration.
- Do not introduce new build tools or migrate frameworks unless explicitly instructed.
- Historical or archival files (e.g. old build logs) should not be treated as current failures.

---

## Definition of Done (for any agent task)

A task is done only if:
- The app builds successfully
- The affected feature works end-to-end
- The UI does not imply unavailable functionality
- State transitions are truthful and predictable

---

## Final Note for Automated Agents

Do not infer missing requirements.
Do not search for undocumented agent prompts.
Do not assume this repository is incomplete because this file exists.

This file is the authoritative agent instruction.
````

## File: bkp/key.txt
````
"key": "MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCvt1uCJaPGznWoI8HK00/TIt3z08dh56ysBL/10ZULl2ixJ7sh4NAFyADcXPItdPj/zF1s+1XdHHhCRv3aF4YwdJCwWX6Ybd0TD+g6XqAdW6LS4T/beLUdbJ08nyX0hq1yYbdwAyb58hxcN7/1ivwnJbn9qzukcJjRy0DFK/PNWh7C8Q7zGpgaryml37ecdcIoOlzqEEY/EiSUhxVGe7jtXl5mgVmZnrLBePTRvn8NadcaXWXyPY7BvP2WJLHIAqTHoDeJNNbP3knufgc63KJZL8uWzK2+2+mTGjW2W3ZEV4/S0CcT7Ii0E5uXny2s5RN1MIVBMrFnwEBnhcyywEyHAgMBAAECggEAGgrRzCMp98AHngjWounYjdFAFfAQP8lnRQNbM+KA9XvWL1NVH7tC+WhgAEjiN6x7buXp/sntOt0KUcBVxSnxYGMWQpyw74Rw3G9iGqyFjHRVWG272ho0tYywbRilNm1zbV1gI4DEGQ0x+NTmZUzY/DBSNW9YYpGxhH5cNhzCgG+Yw7BzpqAPZNn/1myHfZ1ToGk18eH/4isDiENzjvV2r8Qd3/itP1uvvg+MN+k6e8mCKZiCG1mcYImLg1/j5UwwZ5Q4S3nnDs+MyZuVaPAyyhYOW9+1q/tuhprBQ0Y43kVSK4uXKVyWm7Ho8ON2bSypa0WNPkUsmvVNH/JoOMumqQKBgQDmepvvgU3m2K2Ne+BLGvQQqIeFEGHgThxzSoAiCMd37ZlOEC25W3VN+U+xUM+EIloCdPh/Wdy0JAsKqjSHttlGGrdAgyjMeAN9Lb+y+wfhwUfSvdvuaDxtpqk71TWu4O/tPXYjHw/y2rbndTDSzg4o81h9/T4ZepteUMqutU0TuwKBgQDDLGOVYzSrA4E8bSTuabYpo2p1gxNSuRY5aa6Ar2e5Y6O0vw11mOHcE+bkDg93nC1gpg/Nvq6B1/iisd1Cd9gRbkwKxcjsQG8k9rYvOy0h8lARd1c7sjV3ErQVQ1a+zzlXcdsXMqyQkgBpvFDNFRrmZbjqCnYIfbznpLmwgAXvpQKBgBucNpADknyEGo5nd6Ans3NHbSywoLkJQnlBRIZPPO4OBZ6Ha6LX5P6ZTkW0o5d1sgi3UImZD0p5QuVdLHvRmMfALZHJ5JpSCkD1uRBM6E3QJLWHTxCJZivQmldznEG96qAmC7/7WaLDNsQVkuq+Co43ULOPIeBVgsVSsmUpjPk/AoGBAJrsADwTXDom9Q23ASqyBKO2kImouszeGBMInTiOgwH4YnjVcmSXLykXLx51PrfN44MlLcQ+CJ0OhtD16FCbeooTiA7BAoTtfIvVvbVt/pxEkGPc3ASJp8DVutZp9lBNgxGzUZpvYeT7z5IepfC0QP8DXa2BEkIZNLqW2cKNTKj1AoGBAKpKDLbp9DM+V1A6l8kjlbk33TKxHevKu3CkKQoYBt5vegAbcYh2IvJnBiV0/nNFJAxwbT+fiq1jscYnLpmoFMbs6JdbGOiq2bPs65Ceivo14mUDvzbbg8nQUSAwRAqABsQJq/F7d1Tz1tm7ag/4M1/JFmb1SRcvDeqAfJURIE5Q"
````

## File: CREDITS.md
````markdown
# Original Developer

* cnwangjie (GitHub: https://github.com/cnwangjie) - Original creator and maintainer of Better OneTab.

# Current Maintainer

* elijahcommits (GitHub: https://github.com/elijahcommits) - Myself.
````

## File: scripts/validate-build.sh
````bash
#!/bin/bash
set -euo pipefail

log_and_run() {
  echo "[$1] $2"
}

log_and_run "lint" "Running ESLint"
npm run lint

log_and_run "build" "Building production bundle"
build_log="$(mktemp)"
trap 'rm -f "$build_log"' EXIT
npm run build 2>&1 | tee "$build_log"

log_and_run "check" "Scanning build output for warnings"
if grep -qi "deprecated" "$build_log"; then
  echo "[error] Build contains deprecation warnings"
  exit 1
fi

if grep -qi "a11y" "$build_log"; then
  echo "[error] Build contains accessibility warnings"
  exit 1
fi

echo "[ok] Build validation passed"
````

## File: server.js
````javascript
const http = require('http');

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // The extension specifically looks for these properties
  const mockResponse = {
    status: 'success',
    updated_at: new Date().toISOString(),
    lists: [] 
  };

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(mockResponse));
});

server.listen(8000, () => {
  console.log('Sync server active on port 8000');
});
````

## File: server/Dockerfile
````
FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
````

## File: server/README.md
````markdown
# IceTab Backend Server

A lightweight FastAPI backend for tab synchronization and AI-powered categorization.

## Features
- **Sync**: Persistent tab lists stored in SQLite.
- **AI Categorization**: Simple API to categorize tabs and find duplicates using OpenAI.
- **Docker Ready**: Includes `Dockerfile` and `docker-compose.yml`.

## Quick Start (Local)
1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
2. Set your environment variables (create a `.env` file):
   ```env
   OPENAI_API_KEY=your_key_here
   ```
3. Run the server:
   ```bash
   python main.py
   ```
   The server will be available at `http://localhost:8000`.

## Quick Start (Docker)
1. Set your `OPENAI_API_KEY` in `.env`.
2. Run:
   ```bash
   docker-compose up -d
   ```

## Development Contract
For details on the API endpoints and request/response formats, please see the [API Contract](../.gemini/antigravity/brain/39ddb5b8-89ab-4527-b899-f5eeda2f25e8/api_contract.md) (or refer to the `api_contract.md` in your artifacts).
````

## File: server/requirements.txt
````
fastapi
uvicorn
sqlalchemy
openai
pydantic-settings
python-dotenv
httpx
````

## File: server/seed_db.py
````python
from database import SessionLocal, User

def seed():
    db = SessionLocal()
    # Check if test key already exists
    exists = db.query(User).filter(User.api_key == "test-key-123").first()
    if not exists:
        test_user = User(api_key="test-key-123")
        db.add(test_user)
        db.commit()
        print("Success: Created test user with API key: test-key-123")
    else:
        print("Test user already exists.")
    db.close()

if __name__ == "__main__":
    seed()
````

## File: server/test_health.py
````python
import httpx
import json

BASE_URL = "http://localhost:8000"

def test_health():
    print("Testing Health Check...")
    try:
        response = httpx.get(f"{BASE_URL}/health")
        print(f"Status: {response.status_code}")
        print(f"Body: {response.json()}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_health()
````

## File: src/app/component/sync/SyncStatusBadge.svelte
````svelte
<script>
  import { syncStore } from "../../store/syncStore.svelte.js"
  import { SYNC_PHASES } from "@/common/constants"

  let syncMeta = $derived(syncStore.syncStatus)

  const phaseConfig = {
    [SYNC_PHASES.SYNCED]: {
      label: "Synced",
      icon: "fa-check",
      class: "success",
    },
    [SYNC_PHASES.SYNCING]: {
      label: "Syncing...",
      icon: "fa-sync",
      class: "syncing",
    },
    [SYNC_PHASES.AUTH_ERROR]: {
      label: "Auth Failed",
      icon: "fa-lock",
      class: "error",
    },
    [SYNC_PHASES.OFFLINE]: {
      label: "Offline",
      icon: "fa-wifi",
      class: "warning",
    },
    [SYNC_PHASES.SERVER_ERROR]: {
      label: "Sync Error",
      icon: "fa-exclamation-triangle",
      class: "error",
    },
    [SYNC_PHASES.LOCAL_ONLY]: {
      label: "Local Only",
      icon: "fa-hdd",
      class: "neutral",
    },
    [SYNC_PHASES.NEVER_SYNCED]: {
      label: "Not Synced",
      icon: "fa-circle",
      class: "neutral",
    },
    [SYNC_PHASES.IDLE]: {
      label: "Idle",
      icon: "fa-circle",
      class: "neutral",
    },
  }

  let config = $derived(phaseConfig[syncMeta.phase] || phaseConfig[SYNC_PHASES.LOCAL_ONLY])
  let isRetryVisible = $derived(
    syncMeta.phase === SYNC_PHASES.AUTH_ERROR || syncMeta.phase === SYNC_PHASES.SERVER_ERROR
  )
</script>

<div class={`sync-badge ${config.class}`} title={syncMeta.error?.message || config.label}>
  <span class={`icon ${syncMeta.syncing ? "spin" : ""}`}>
    <i class={`fas ${config.icon}`}></i>
  </span>
  <span class="label">{config.label}</span>
  {#if syncMeta.pendingRetry}
    <span class="retry-indicator" title="Retry scheduled">
      <i class="fas fa-sync"></i>
    </span>
  {/if}
</div>

{#if isRetryVisible}
  <button class="retry-btn" onclick={() => syncStore.manualRetry()}>
    Retry Sync
  </button>
{/if}

<style>
  .sync-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border-radius: 14px;
    font-size: 0.85rem;
    font-weight: 600;
    border: 1px solid transparent;
    transition: all 0.2s ease;
  }

  .icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .icon.spin {
    animation: spin 1s linear infinite;
  }

  .success {
    background: rgba(64, 192, 87, 0.12);
    border-color: rgba(64, 192, 87, 0.4);
    color: #40c057;
  }

  .syncing {
    background: rgba(77, 171, 247, 0.12);
    border-color: rgba(77, 171, 247, 0.4);
    color: #4dabf7;
  }

  .error {
    background: rgba(250, 82, 82, 0.12);
    border-color: rgba(250, 82, 82, 0.4);
    color: #fa5252;
  }

  .warning {
    background: rgba(255, 192, 120, 0.12);
    border-color: rgba(255, 192, 120, 0.4);
    color: #ffc078;
  }

  .neutral {
    background: rgba(156, 163, 175, 0.12);
    border-color: rgba(156, 163, 175, 0.4);
    color: #9195a1;
  }

  .retry-indicator {
    display: inline-flex;
    align-items: center;
    color: inherit;
    opacity: 0.7;
    animation: pulse 1.6s ease-in-out infinite;
  }

  .retry-btn {
    margin-left: 12px;
    padding: 6px 14px;
    border-radius: 999px;
    border: 1px solid rgba(250, 82, 82, 0.4);
    background: transparent;
    color: #fa5252;
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s ease;
  }

  .retry-btn:hover {
    background: rgba(250, 82, 82, 0.1);
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 0.4;
    }
    50% {
      opacity: 1;
    }
  }
</style>
````

## File: src/app/component/tags/TagInput.svelte
````svelte
<script>
  let { 
    existingTags = [], 
    allKnownTags = [], 
    onAdd,
    placeholder = "Add a tag..."
  } = $props();
  
  let inputValue = $state("");
  let showSuggestions = $state(false);
  let focusedIndex = $state(-1);
  
  // Filter suggestions based on input
  let suggestions = $derived(() => {
    if (!inputValue.trim()) return [];
    const needle = inputValue.toLowerCase();
    return allKnownTags
      .filter(tag => 
        tag.toLowerCase().includes(needle) && 
        !existingTags.includes(tag)
      )
      .slice(0, 5);
  });
  
  function handleKeyDown(event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      if (focusedIndex >= 0 && suggestions.length > 0) {
        addTag(suggestions[focusedIndex]);
      } else if (inputValue.trim()) {
        addTag(inputValue.trim());
      }
    } else if (event.key === 'Escape') {
      showSuggestions = false;
      inputValue = "";
    } else if (event.key === 'ArrowDown' && suggestions.length > 0) {
      event.preventDefault();
      focusedIndex = Math.min(focusedIndex + 1, suggestions.length - 1);
    } else if (event.key === 'ArrowUp' && suggestions.length > 0) {
      event.preventDefault();
      focusedIndex = Math.max(focusedIndex - 1, -1);
    }
  }
  
  function addTag(tag) {
    const trimmed = tag.trim();
    if (!trimmed || existingTags.includes(trimmed)) return;
    
    if (onAdd) onAdd(trimmed);
    inputValue = "";
    showSuggestions = false;
    focusedIndex = -1;
  }
  
  function handleInput() {
    showSuggestions = inputValue.trim().length > 0;
    focusedIndex = -1;
  }
  
  function handleBlur() {
    // Delay to allow click on suggestion
    setTimeout(() => {
      showSuggestions = false;
      focusedIndex = -1;
    }, 200);
  }
</script>

<div class="tag-input-wrapper">
  <div class="tag-input-container">
    <i class="fas fa-tag input-icon"></i>
    <input
      type="text"
      class="tag-input"
      bind:value={inputValue}
      {placeholder}
      onkeydown={handleKeyDown}
      oninput={handleInput}
      onfocus={() => showSuggestions = inputValue.trim().length > 0}
      onblur={handleBlur}
    />
    {#if inputValue}
      <button 
        class="clear-input" 
        onclick={() => { inputValue = ""; showSuggestions = false; }}
        aria-label="Clear"
      >
        <i class="fas fa-times"></i>
      </button>
    {/if}
  </div>
  
  {#if showSuggestions && suggestions.length > 0}
    <div class="suggestions-panel">
      {#each suggestions as suggestion, index}
        <button
          class="suggestion-item"
          class:focused={index === focusedIndex}
          onclick={() => addTag(suggestion)}
        >
          <i class="fas fa-tag"></i>
          <span>{suggestion}</span>
        </button>
      {/each}
    </div>
  {/if}
</div>

<style>
  .tag-input-wrapper {
    position: relative;
    width: 100%;
  }
  
  .tag-input-container {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background: #25262b;
    border: 1px solid #2c2e33;
    border-radius: 8px;
    transition: all 0.2s;
  }
  
  .tag-input-container:focus-within {
    background: #2c2e33;
    border-color: #ff922b;
    box-shadow: 0 0 0 3px rgba(255, 146, 43, 0.1);
  }
  
  .input-icon {
    color: #5c5f66;
    font-size: 0.875rem;
  }
  
  .tag-input {
    flex: 1;
    background: transparent;
    border: none;
    color: #e4e4e7;
    font-size: 0.875rem;
    outline: none;
  }
  
  .tag-input::placeholder {
    color: #5c5f66;
  }
  
  .clear-input {
    background: transparent;
    border: none;
    color: #5c5f66;
    padding: 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
    border-radius: 4px;
    transition: all 0.2s;
  }
  
  .clear-input:hover {
    background: #3c3e44;
    color: #909296;
  }
  
  .suggestions-panel {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    right: 0;
    background: #1a1b1e;
    border: 1px solid #2c2e33;
    border-radius: 8px;
    padding: 4px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
    z-index: 100;
    max-height: 200px;
    overflow-y: auto;
  }
  
  .suggestion-item {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 8px 12px;
    background: transparent;
    border: none;
    color: #c1c2c5;
    font-size: 0.875rem;
    text-align: left;
    cursor: pointer;
    border-radius: 6px;
    transition: all 0.15s;
  }
  
  .suggestion-item:hover,
  .suggestion-item.focused {
    background: #25262b;
    color: #e4e4e7;
  }
  
  .suggestion-item i {
    color: #5c5f66;
    font-size: 0.75rem;
  }
</style>
````

## File: src/app/index.css
````css
/* SquirrlTab Global Styles */
/* Dark theme design system with cohesive aesthetics */

:root {
  /* Color Palette - Dark Theme */
  --bg-primary: #141517;
  --bg-secondary: #1a1b1e;
  --bg-tertiary: #25262b;
  --bg-elevated: #2c2e33;

  --text-primary: #e4e4e7;
  --text-secondary: #c1c2c5;
  --text-tertiary: #909296;
  --text-muted: #5c5f66;

  --border-subtle: #2c2e33;
  --border-default: #3c3e44;
  --border-hover: #4c4e54;

  /* Brand Colors */
  --brand-primary: #ff922b;
  --brand-secondary: #ff6b35;
  --brand-gradient: linear-gradient(135deg, #ff922b 0%, #ff6b35 100%);

  /* Semantic Colors */
  --success: #40c057;
  --error: #fa5252;
  --warning: #ffc078;
  --info: #4dabf7;
  --purple: #7950f2;

  /* Shadows */
  --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.2);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.3);
  --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.4);
  --shadow-xl: 0 16px 48px rgba(0, 0, 0, 0.5);

  /* Border Radius */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 12px;
  --radius-xl: 16px;

  /* Spacing */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 12px;
  --space-lg: 16px;
  --space-xl: 24px;
  --space-2xl: 32px;

  /* Typography */
  --font-primary: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  --font-mono: "SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace;

  /* Transitions */
  --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-base: 200ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow: 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

/* Reset & Base Styles */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html,
body {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

body {
  font-family: var(--font-primary);
  font-size: 14px;
  line-height: 1.5;
  background: var(--bg-primary);
  color: var(--text-primary);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}

/* Typography */
h1,
h2,
h3,
h4,
h5,
h6 {
  font-weight: 700;
  line-height: 1.2;
  color: var(--text-primary);
}

h1 {
  font-size: 2rem;
}

h2 {
  font-size: 1.5rem;
}

h3 {
  font-size: 1.25rem;
}

h4 {
  font-size: 1.125rem;
}

h5 {
  font-size: 1rem;
}

h6 {
  font-size: 0.875rem;
}

p {
  line-height: 1.6;
  color: var(--text-secondary);
}

/* Links */
a {
  color: var(--brand-primary);
  text-decoration: none;
  transition: color var(--transition-fast);
}

a:hover {
  color: var(--brand-secondary);
}

/* Buttons */
button {
  font-family: inherit;
  font-size: inherit;
  cursor: pointer;
  border: none;
  outline: none;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Inputs */
input,
textarea,
select {
  font-family: inherit;
  font-size: inherit;
  color: inherit;
}

input::placeholder,
textarea::placeholder {
  color: var(--text-muted);
  opacity: 1;
}

/* Focus Styles */
*:focus-visible {
  outline: 2px solid var(--brand-primary);
  outline-offset: 2px;
}

button:focus-visible {
  outline: 2px solid var(--brand-primary);
  outline-offset: 2px;
}

/* Scrollbar Styling */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: var(--bg-elevated);
  border-radius: 4px;
  transition: background var(--transition-base);
}

::-webkit-scrollbar-thumb:hover {
  background: var(--border-hover);
}

::-webkit-scrollbar-corner {
  background: transparent;
}

/* Selection */
::selection {
  background: rgba(255, 146, 43, 0.3);
  color: var(--text-primary);
}

/* Utility Classes */
.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Animation Classes */
@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }

  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes slideDown {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }

  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

@keyframes pulse {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.5;
  }
}

/* Accessibility */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

/* Print Styles */
@media print {
  * {
    background: white !important;
    color: black !important;
  }
}

/* Responsive Design Breakpoints */
/* Mobile: < 640px */
/* Tablet: 640px - 1024px */
/* Desktop: > 1024px */

@media (max-width: 640px) {
  html {
    font-size: 14px;
  }
}

@media (min-width: 1024px) {
  html {
    font-size: 15px;
  }
}

/* Performance Optimizations */
.gpu-accelerated {
  transform: translateZ(0);
  will-change: transform;
}

/* Prevent text selection on UI elements */
.no-select {
  user-select: none;
  -webkit-user-select: none;
}

/* Image optimization */
img {
  max-width: 100%;
  height: auto;
  display: block;
}

/* Improve performance of animations */
@media (prefers-reduced-motion: reduce) {

  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Dark mode specific adjustments */
@media (prefers-color-scheme: dark) {
  /* Already dark by default, but we can add overrides here if needed */
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  :root {
    --border-subtle: #4c4e54;
    --border-default: #5c5f66;
  }
}
````

## File: src/app/store/bridge.js
````javascript
import listManager from '@/common/listManager'
import browser from 'webextension-polyfill'

// Initialize the listManager for the frontend context
listManager.init()

/**
 * Bridge function to handle listManager mutations in a Svelte-friendly way.
 * This can be used by the Svelte stores to listen for changes from the background
 * or other tabs.
 */
export const listenForChanges = (callback) => {
  // Listen for 'refresh' messages from listManager (via sendMessage)
  const listener = (message) => {
    if (message.refresh || message.listModifed) {
      callback(message)
    }
  }
  browser.runtime.onMessage.addListener(listener)
  return () => browser.runtime.onMessage.removeListener(listener)
}

export default listManager
````

## File: src/background/index.js
````javascript
import 'regenerator-runtime/runtime'
import init from './init'

init()
````

## File: src/common/helper.js
````javascript
export const clearStorage = () => chrome.storage.local.get()
  .then(Object.keys).then(chrome.storage.local.remove)
````

## File: src/common/logger.svelte.js
````javascript
let logs = $state([]);

export const logger = {
  get entries() { return logs; },

  add(type, message, data = null) {
    const entry = {
      timestamp: new Date().toISOString(),
      type,
      message,
      data: data ? JSON.parse(JSON.stringify(data)) : null // snapshot
    };
    logs.push(entry);
    if (logs.length > 100) logs.shift(); // keep it light

    // Also log to console for dev
    console[type === 'error' ? 'error' : 'log'](`[IceTab] ${message}`, data || '');
  },

  clear() {
    logs = [];
  },

  // Bridge methods for compatibility with old logger
  log(message, ...args) {
    this.add('log', message, args.length > 0 ? args : null);
  },
  error(message, ...args) {
    this.add('error', message, args.length > 0 ? args : null);
  },
  warn(message, ...args) {
    // Map warn to log or error, or add specific type
    this.add('warn', message, args.length > 0 ? args : null);
  },
  info(message, ...args) {
    this.add('info', message, args.length > 0 ? args : null);
  },
  debug(message, ...args) {
    // debug might be verbose, maybe optional?
    this.add('debug', message, args.length > 0 ? args : null);
  },
  init() {
    // No-op for compatibility
  }
};

export default logger;
````

## File: src/common/runtimeContext.js
````javascript
const POPUP_CONTEXT = 'popup';

export const getRuntimeSource = () => {
  if (typeof window === 'undefined' || typeof window.location === 'undefined') {
    return 'app';
  }
  const params = new URLSearchParams(window.location.search || '');
  return params.get('context') === POPUP_CONTEXT ? POPUP_CONTEXT : 'app';
};

export const isPopupContext = () => getRuntimeSource() === POPUP_CONTEXT;
````

## File: src/common/sync-logger.js
````javascript
const MAX_LOG_ENTRIES = 100

const logs = []

export const logSyncEvent = (event, details = {}) => {
  const entry = {
    timestamp: Date.now(),
    event,
    ...details,
  }

  logs.push(entry)
  if (logs.length > MAX_LOG_ENTRIES) {
    logs.shift()
  }

  console.log(`[SyncLog] ${event}`, details)
}

export const getSyncLogs = () => [...logs]

export const clearSyncLogs = () => {
  logs.length = 0
}

export const exportSyncLogs = () => {
  return JSON.stringify(logs, null, 2)
}
````

## File: src/common/tracker.js
````javascript
let imported = false
export const tracker = () => {
  if (imported) return
  /*eslint-disable */
  // Commenting out the Google Analytics script loading to prevent CSP violations.
  // (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  // (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  // m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  // })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');
  imported = true
  // ga('create', 'UA-65598064-4', 'auto'); // Also comment out ga calls if not needed.
  // ga('set', 'checkProtocolTask', function(){});
}
````

## File: src/exchanger.js
````javascript
const parseLists = (compatible, data) => {
  const lists = compatible ? data.split('\n\n')
    .filter(i => i.trim())
    .map(i => i.split('\n')
      .filter(j => j)
      .map(j => {
        const [url, ...title] = j.split('|')
        return {
          url: url.trim(),
          title: title.join().trim(),
        }
      }))
    .map(tabs => ({tabs}))
    : JSON.parse(data)

  return lists
}

addEventListener('message', msg => {
  const {compatible, data} = msg.data
  if (compatible == null || !data) throw new Error('wrong message')
  const listsData = parseLists(compatible, data)
  if (!Array.isArray(listsData)) throw new Error('data must be an array')
  postMessage(listsData)
})
````

## File: src/mock/index.js
````javascript
// Basic Mock for Chrome Extension API
const storage = {};

const mockBrowser = {
  runtime: {
    getURL: (path) => window.location.origin + '/' + (path || ''),
    id: 'mock-extension-id',
    onMessage: { addListener: () => { } },
    sendMessage: () => Promise.resolve(),
    getManifest: () => ({ version: '0.0.0' }),
  },
  tabs: {
    query: async () => {
      // Return some dummy tabs
      return [
        { id: 1, title: 'Google', url: 'https://google.com', favIconUrl: 'https://www.google.com/favicon.ico', pinned: false, highlighted: true, windowId: 1 },
        { id: 2, title: 'GitHub', url: 'https://github.com', favIconUrl: 'https://github.com/favicon.ico', pinned: false, highlighted: false, windowId: 1 },
        { id: 3, title: 'Svelte', url: 'https://svelte.dev', favIconUrl: 'https://svelte.dev/favicon.png', pinned: true, highlighted: false, windowId: 1 },
        { id: 4, title: 'Twitter', url: 'https://twitter.com', favIconUrl: '', pinned: false, highlighted: false, windowId: 1 },
      ];
    },
    create: async (props) => {
      console.log('Mock: Creating tab', props);
      return { id: Math.floor(Math.random() * 1000), ...props };
    },
    update: async (id, props) => {
      console.log('Mock: Updating tab', id, props);
      return { id, ...props };
    },
    remove: async (ids) => {
      console.log('Mock: Removing tabs', ids);
    },
    onActivated: { addListener: () => { } },
    onUpdated: { addListener: () => { } },
    onRemoved: { addListener: () => { } },
    onMoved: { addListener: () => { } },
  },
  windows: {
    getCurrent: async () => ({ id: 1 }),
    getAll: async () => ([{ id: 1 }]),
    create: async () => ({ id: 2, tabs: [] }),
  },
  storage: {
    local: {
      get: async (keys) => {
        if (!keys) return storage;
        if (typeof keys === 'string') keys = [keys];
        const result = {};
        if (Array.isArray(keys)) {
          keys.forEach(k => result[k] = storage[k]);
        } else {
          // object with default values
          Object.keys(keys).forEach(k => result[k] = storage[k] || keys[k]);
        }
        return JSON.parse(JSON.stringify(result)); // Deep clone
      },
      set: async (items) => {
        Object.assign(storage, items);
        // Persist to localStorage for DX
        localStorage.setItem('mock_storage', JSON.stringify(storage));
        // Trigger onChanged
        if (mockBrowser.storage.onChanged.listeners) {
          const changes = {};
          Object.keys(items).forEach(k => {
            changes[k] = { newValue: items[k] };
          });
          mockBrowser.storage.onChanged.listeners.forEach(l => l(changes, 'local'));
        }
      },
      remove: async (keys) => {
        if (typeof keys === 'string') keys = [keys];
        keys.forEach(k => delete storage[k]);
        localStorage.setItem('mock_storage', JSON.stringify(storage));
      },
      clear: async () => {
        Object.keys(storage).forEach(key => delete storage[key]);
        localStorage.removeItem('mock_storage');
      }
    },
    onChanged: {
      listeners: [],
      addListener: (cb) => mockBrowser.storage.onChanged.listeners.push(cb),
      removeListener: (cb) => {
        mockBrowser.storage.onChanged.listeners = mockBrowser.storage.onChanged.listeners.filter(l => l !== cb);
      }
    }
  },
  i18n: {
    getMessage: (key) => {
      const messages = {
        ui_my_tab_lists: 'My Tab Lists',
        ui_clean_all: 'Clean All',
        ui_tabs: 'Tabs',
        ui_created: 'Created',
        ui_untitled_list: 'Untitled List',
        ui_unpin: 'Unpin',
        ui_pin: 'Pin',
        ui_restore_all: 'Restore All',
        ui_nightmode: 'Night Mode',
        ext_name: 'IceTab Dev',
        ext_desc: 'Development Mode'
      };
      return messages[key] || key;
    },
    getUILanguage: () => 'en'
  },
  commands: {
    getAll: async () => []
  }
};

// Initialize storage from localStorage
try {
  const saved = localStorage.getItem('mock_storage');
  if (saved) Object.assign(storage, JSON.parse(saved));
} catch (e) {
  console.warn('Failed to load mock storage', e);
}

// Expose globally
window.browser = mockBrowser;
window.chrome = mockBrowser;

export default mockBrowser;
````

## File: vue.config.js
````javascript
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  configureWebpack: {
    plugins: [
      new CopyWebpackPlugin({
        patterns: [
          {
            from: 'src/_locales',
            to: '_locales'
          }
        ]
      })
    ]
  },
  // This line is important for Chrome Extensions
  filenameHashing: false
};
````

## File: webpack.serve.js
````javascript
/* eslint-disable */
const { merge } = require('webpack-merge')
const common = require('./webpack.common.js')
const path = require('path')
const webpack = require('webpack')

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  entry: {
    // Only build the app entry point, inject mock before it
    app: ['./src/mock/index.js', './src/app/index.js']
  },
  devServer: {
    hot: true,
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    compress: true,
    port: 3000,
    historyApiFallback: {
      index: 'index.html'
    },
    devMiddleware: {
      writeToDisk: false,
    }
  },
  resolve: {
    alias: {
      // Redirect webextension-polyfill to our mock
      'webextension-polyfill': path.resolve(__dirname, 'src/mock/index.js')
    }
  },
  plugins: [
    new webpack.NormalModuleReplacementPlugin(
      /webextension-polyfill/,
      path.resolve(__dirname, 'src/mock/index.js')
    ),
  ]
})
````

## File: .gitignore
````
# Combined ignores
# (will remove duplicates later)
node_modules/**/*
yarn-error.log
dist
dist.zip
.sonar*
.scanner*
stats.json
.DS_Store

# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*
.pnpm-debug.log*

# Diagnostic reports (https://nodejs.org/api/report.html)
report.[0-9]*.[0-9]*.[0-9]*.[0-9]*.json

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Directory for instrumented libs generated by jscoverage/JSCover
lib-cov

# Coverage directory used by tools like istanbul
coverage
*.lcov

# nyc test coverage
.nyc_output

# Grunt intermediate storage (https://gruntjs.com/creating-plugins#storing-task-files)
.grunt

# Bower dependency directory (https://bower.io/)
bower_components

# node-waf configuration
.lock-wscript

# Compiled binary addons (https://nodejs.org/api/addons.html)
build/Release

# Dependency directories
node_modules/
jspm_packages/

# Snowpack dependency directory (https://snowpack.dev/)
web_modules/

# TypeScript cache
*.tsbuildinfo

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Optional stylelint cache
.stylelintcache

# Microbundle cache
.rpt2_cache/
.rts2_cache_cjs/
.rts2_cache_es/
.rts2_cache_umd/

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variable files
.env
.env.development.local
.env.test.local
.env.production.local
.env.local

# parcel-bundler cache (https://parceljs.org/)
.cache
.parcel-cache

# Next.js build output
.next
out

# Nuxt.js build / generate output
.nuxt
dist

# Gatsby files
.cache/
# Comment in the public line in if your project uses Gatsby and not Next.js
# https://nextjs.org/blog/next-9-1#public-directory-support
# public

# vuepress build output
.vuepress/dist

# vuepress v2.x temp and cache directory
.temp
.cache

# vitepress build output
**/.vitepress/dist

# vitepress cache directory
**/.vitepress/cache

# Docusaurus cache and generated files
.docusaurus

# Serverless directories
.serverless/

# FuseBox cache
.fusebox/

# DynamoDB Local files
.dynamodb/

# TernJS port file
.tern-port

# Stores VSCode versions used for testing VSCode extensions
.vscode-test

# yarn v2
.yarn/cache
.yarn/unplugged
.yarn/build-state.yml
.yarn/install-state.gz
.pnp.*
````

## File: config.js
````javascript
/* eslint-disable */
module.exports = {
  development: {
    __CLIENT_ID__: '530831729511-eq8apt6dhjimbmdli90jp2ple0lfmn3l.apps.googleusercontent.com',
    __DEV_CSP__: process.env.MOZ ? '' : ' http://localhost:8098 chrome-extension://nhdogjmejiglipccpnnnanhbledajbpd',
    __EXT_NAME__: 'IceTab (dev)',
    __CONTENT_SCRIPTS_MATCHES__: process.env.MOZ ? '*://*/*' : 'http://127.0.0.1:8000/*',
  },
  production: {
    __CLIENT_ID__: '530831729511-dclgvblhv7var13mvpjochb5f295a6vc.apps.googleusercontent.com',
    __DEV_CSP__: '',
    __EXT_NAME__: '__MSG_ext_name__',
    __CONTENT_SCRIPTS_MATCHES__: 'https://boss.cnwangjie.com/*',
  }
}
````

## File: LICENSE
````
MIT License

Better OneTab ~ Copyright (c) 2018-2019 Wang Jie
Better OneTab: RELOADED ~ Copyright (c) 2025 Elijah

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
````

## File: server/database.py
````python
import datetime
from sqlalchemy import create_engine, Column, Integer, String, DateTime, ForeignKey, Boolean, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship

SQLALCHEMY_DATABASE_URL = "sqlite:///./icetab.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    api_key = Column(String, unique=True, index=True)
    last_synced_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    tab_lists = relationship("TabList", back_populates="user")

class TabList(Base):
    __tablename__ = "tab_lists"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    remote_id = Column(String, index=True) # Extension's ID
    title = Column(String)
    tabs = Column(String)  # JSON string
    category = Column(String)
    tags = Column(String)  # JSON string
    time = Column(Integer)
    pinned = Column(Boolean, default=False)
    color = Column(String)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    user = relationship("User", back_populates="tab_lists")

def init_db():
    Base.metadata.create_all(bind=engine)
    ensure_columns()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def ensure_columns():
    """Best-effort migration to add new sync-related columns without losing existing data."""
    with engine.connect() as conn:
        table_info = conn.execute(text("PRAGMA table_info('tab_lists')")).fetchall()
        existing = {row[1] for row in table_info}
        if "time" not in existing:
            conn.execute(text("ALTER TABLE tab_lists ADD COLUMN time INTEGER"))
        if "pinned" not in existing:
            conn.execute(text("ALTER TABLE tab_lists ADD COLUMN pinned INTEGER DEFAULT 0"))
        if "color" not in existing:
            conn.execute(text("ALTER TABLE tab_lists ADD COLUMN color VARCHAR"))

        user_info = conn.execute(text("PRAGMA table_info('users')")).fetchall()
        user_cols = {row[1] for row in user_info}
        if "last_synced_at" not in user_cols:
            conn.execute(text("ALTER TABLE users ADD COLUMN last_synced_at TEXT"))
````

## File: server/docker-compose.yml
````yaml
version: '3.8'

services:
  server:
    build: .
    ports:
      - "6745:8000"
    volumes:
      - .:/app
      - db_data:/app/data
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    restart: always

volumes:
  db_data:
````

## File: src/app/page/settings/SettingsView.svelte
````svelte
<script>
  import browser from "webextension-polyfill";
  import { syncStore } from "../../store/syncStore.svelte.js";
  import CustomSync from "@/common/service/custom-sync";
  
  let { onBack } = $props();
  
  // Settings state
  let settings = $state({
    syncBaseUrl: "",
    syncApiKey: "",
    autoSyncEnabled: false,
    autoSyncInterval: 300, // seconds
    confirmBeforeRestore: true,
    defaultRestoreBehavior: "current-window", // "current-window" | "new-window"
    deleteUnpinnedOnRestore: true,
  });
  
  let saveStatus = $state(null); // "saving" | "success" | "error"
  let testStatus = $state(null); // "testing" | "success" | "error"
  let testMessage = $state("");
  
  // Load settings on mount
  $effect(() => {
    loadSettings();
  });
  
  async function loadSettings() {
    const opts = await browser.storage.local.get("opts");
    if (opts.opts) {
      settings.syncBaseUrl = opts.opts.syncBaseUrl || "http://localhost:8000";
      settings.syncApiKey = opts.opts.syncApiKey || "";
      settings.autoSyncEnabled = opts.opts.autoSyncEnabled ?? false;
      settings.autoSyncInterval = opts.opts.autoSyncInterval || 300;
      settings.confirmBeforeRestore = opts.opts.confirmBeforeRestore ?? true;
      settings.defaultRestoreBehavior = opts.opts.defaultRestoreBehavior || "current-window";
      settings.deleteUnpinnedOnRestore = opts.opts.deleteUnpinnedOnRestore ?? true;
    }
  }
  
  async function saveSettings() {
    saveStatus = "saving";
    try {
      const opts = await browser.storage.local.get("opts");
      const updatedOpts = {
        ...(opts.opts || {}),
        syncBaseUrl: settings.syncBaseUrl.trim(),
        syncApiKey: settings.syncApiKey.trim(),
        autoSyncEnabled: settings.autoSyncEnabled,
        autoSyncInterval: settings.autoSyncInterval,
        confirmBeforeRestore: settings.confirmBeforeRestore,
        defaultRestoreBehavior: settings.defaultRestoreBehavior,
        deleteUnpinnedOnRestore: settings.deleteUnpinnedOnRestore,
      };
      
      await browser.storage.local.set({ opts: updatedOpts });
      saveStatus = "success";
      setTimeout(() => {
        saveStatus = null;
      }, 2000);
      
      syncStore.updateSnackbar("Settings saved successfully");
    } catch (error) {
      console.error("Failed to save settings:", error);
      saveStatus = "error";
      setTimeout(() => {
        saveStatus = null;
      }, 3000);
    }
  }
  
  async function testConnection() {
    testStatus = "testing";
    testMessage = "Testing connection...";
    
    try {
      const opts = await browser.storage.local.get("opts");
      const tempOpts = {
        ...(opts.opts || {}),
        syncBaseUrl: settings.syncBaseUrl.trim(),
        syncApiKey: settings.syncApiKey.trim(),
      };
      await browser.storage.local.set({ opts: tempOpts });
      
      const health = await CustomSync.health();
      testStatus = "success";
      testMessage = "\u2713 Connected to " + (health.service || "sync service") + " v" + (health.version || "?");
      setTimeout(() => {
        testStatus = null;
        testMessage = "";
      }, 5000);
    } catch (error) {
      testStatus = "error";
      if (error.code === "offline") {
        testMessage = "\u2717 Cannot reach server. Check URL and network connection.";
      } else if (error.code === "auth") {
        testMessage = "\u2717 Authentication failed. Check your API key.";
      } else {
        testMessage = "\u2717 " + error.message;
      }
      setTimeout(() => {
        testStatus = null;
        testMessage = "";
      }, 5000);
    }
  }
  
  function resetToDefaults() {
    const confirmed = confirm("Reset all settings to defaults?");
    if (!confirmed) return;
    
    settings.syncBaseUrl = "http://localhost:8000";
    settings.syncApiKey = "";
    settings.autoSyncEnabled = false;
    settings.autoSyncInterval = 300;
    settings.confirmBeforeRestore = true;
    settings.defaultRestoreBehavior = "current-window";
    settings.deleteUnpinnedOnRestore = true;
  }
</script>

<div class="settings-view">
  <header class="settings-header">
    <button class="back-btn" onclick={onBack}>
      <i class="fas fa-arrow-left"></i>
      <span>Back</span>
    </button>
    <h1>Settings</h1>
  </header>
  
  <div class="settings-content">
    <!-- Sync Settings Section -->
    <section class="settings-section">
      <div class="section-header">
        <i class="fas fa-sync section-icon"></i>
        <h2>Sync Configuration</h2>
      </div>
      
      <div class="setting-group">
        <label for="sync-url" class="setting-label">
          Sync Server URL
          <span class="label-hint">The backend service URL for syncing your stashes</span>
        </label>
        <input
          id="sync-url"
          type="url"
          class="setting-input"
          bind:value={settings.syncBaseUrl}
          placeholder="http://localhost:8000"
        />
      </div>
      
      <div class="setting-group">
        <label for="api-key" class="setting-label">
          API Key
          <span class="label-hint">Your authentication key for the sync service</span>
        </label>
        <input
          id="api-key"
          type="password"
          class="setting-input"
          bind:value={settings.syncApiKey}
          placeholder="Enter your API key"
        />
      </div>
      
      <div class="setting-actions">
        <button 
          class="test-btn" 
          onclick={testConnection}
          disabled={testStatus === "testing"}
        >
          <i class={`fas ${testStatus === "testing" ? "fa-spinner fa-spin" : "fa-plug"}`}></i>
          <span>{testStatus === "testing" ? "Testing..." : "Test Connection"}</span>
        </button>
        
        {#if testMessage}
          <div class="test-result" class:success={testStatus === "success"} class:error={testStatus === "error"}>
            {testMessage}
          </div>
        {/if}
      </div>
      
      <div class="setting-group">
        <label class="setting-checkbox">
          <input
            type="checkbox"
            bind:checked={settings.autoSyncEnabled}
          />
          <span>Enable automatic sync</span>
          <span class="checkbox-hint">Automatically sync changes to the server</span>
        </label>
      </div>
      
      {#if settings.autoSyncEnabled}
        <div class="setting-group">
          <label for="sync-interval" class="setting-label">
            Sync Interval
            <span class="label-hint">Time between automatic syncs (seconds)</span>
          </label>
          <input
            id="sync-interval"
            type="number"
            class="setting-input small"
            bind:value={settings.autoSyncInterval}
            min="60"
            max="3600"
            step="60"
          />
          <span class="input-suffix">{Math.floor(settings.autoSyncInterval / 60)} minutes</span>
        </div>
      {/if}
    </section>
    
    <!-- Restore Behavior Section -->
    <section class="settings-section">
      <div class="section-header">
        <i class="fas fa-folder-open section-icon"></i>
        <h2>Restore Behavior</h2>
      </div>
      
      <div class="setting-group">
        <label class="setting-checkbox">
          <input
            type="checkbox"
            bind:checked={settings.confirmBeforeRestore}
          />
          <span>Confirm before restoring</span>
          <span class="checkbox-hint">Show confirmation dialog when restoring stashes</span>
        </label>
      </div>
      
      <div class="setting-group">
        <label for="restore-target" class="setting-label">
          Default restore location
        </label>
        <select
          id="restore-target"
          class="setting-select"
          bind:value={settings.defaultRestoreBehavior}
        >
          <option value="current-window">Current window</option>
          <option value="new-window">New window</option>
        </select>
      </div>
      
      <div class="setting-group">
        <label class="setting-checkbox">
          <input
            type="checkbox"
            bind:checked={settings.deleteUnpinnedOnRestore}
          />
          <span>Delete unpinned stashes after restore</span>
          <span class="checkbox-hint">Pinned stashes are always kept after restore</span>
        </label>
      </div>
    </section>
    
    <!-- About Section -->
    <section class="settings-section">
      <div class="section-header">
        <i class="fas fa-info-circle section-icon"></i>
        <h2>About</h2>
      </div>
      
      <div class="about-content">
        <div class="about-row">
          <span class="about-label">Extension Version</span>
          <span class="about-value">2025.6.10.04</span>
        </div>
        <div class="about-row">
          <span class="about-label">Total Stashes</span>
          <span class="about-value">{syncStore.lists.length}</span>
        </div>
        <div class="about-row">
          <span class="about-label">Total Tabs Saved</span>
          <span class="about-value">
            {syncStore.lists.reduce((sum, list) => sum + (list.tabs?.length || 0), 0)}
          </span>
        </div>
      </div>
    </section>
  </div>
  
  <footer class="settings-footer">
    <button class="reset-btn" onclick={resetToDefaults}>
      <i class="fas fa-undo"></i>
      <span>Reset to Defaults</span>
    </button>
    
    <button 
      class="save-btn" 
      onclick={saveSettings}
      disabled={saveStatus === "saving"}
    >
      <i class={`fas ${saveStatus === "saving" ? "fa-spinner fa-spin" : "fa-save"}`}></i>
      <span>
        {#if saveStatus === "saving"}
          Saving...
        {:else if saveStatus === "success"}
          Saved!
        {:else}
          Save Settings
        {/if}
      </span>
    </button>
  </footer>
</div>

<style>
  .settings-view {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: #141517;
  }
  
  .settings-header {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 20px 24px;
    border-bottom: 1px solid #2c2e33;
    background: #1a1b1e;
  }
  
  .back-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 14px;
    background: #25262b;
    border: 1px solid #2c2e33;
    border-radius: 8px;
    color: #c1c2c5;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .back-btn:hover {
    background: #2c2e33;
    color: #e4e4e7;
  }
  
  .settings-header h1 {
    font-size: 1.5rem;
    font-weight: 700;
    color: #e4e4e7;
    margin: 0;
  }
  
  .settings-content {
    flex: 1;
    overflow-y: auto;
    padding: 24px;
  }
  
  .settings-section {
    background: #1a1b1e;
    border: 1px solid #2c2e33;
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 20px;
  }
  
  .section-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 1px solid #2c2e33;
  }
  
  .section-icon {
    color: #ff922b;
    font-size: 1.25rem;
  }
  
  .section-header h2 {
    font-size: 1.125rem;
    font-weight: 600;
    color: #e4e4e7;
    margin: 0;
  }
  
  .setting-group {
    margin-bottom: 20px;
  }
  
  .setting-group:last-child {
    margin-bottom: 0;
  }
  
  .setting-label {
    display: block;
    font-size: 0.875rem;
    font-weight: 500;
    color: #e4e4e7;
    margin-bottom: 8px;
  }
  
  .label-hint {
    display: block;
    font-size: 0.8125rem;
    font-weight: 400;
    color: #909296;
    margin-top: 4px;
  }
  
  .setting-input,
  .setting-select {
    width: 100%;
    padding: 10px 14px;
    background: #25262b;
    border: 1px solid #2c2e33;
    border-radius: 8px;
    color: #e4e4e7;
    font-size: 0.875rem;
    transition: all 0.2s;
  }
  
  .setting-input:focus,
  .setting-select:focus {
    outline: none;
    background: #2c2e33;
    border-color: #ff922b;
    box-shadow: 0 0 0 3px rgba(255, 146, 43, 0.1);
  }
  
  .setting-input.small {
    width: 120px;
  }
  
  .input-suffix {
    margin-left: 12px;
    font-size: 0.875rem;
    color: #909296;
  }
  
  .setting-checkbox {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    cursor: pointer;
    padding: 12px;
    border-radius: 8px;
    transition: background 0.2s;
  }
  
  .setting-checkbox:hover {
    background: #25262b;
  }
  
  .setting-checkbox input[type="checkbox"] {
    margin-top: 2px;
    cursor: pointer;
  }
  
  .setting-checkbox > span:first-of-type {
    flex: 1;
    font-size: 0.875rem;
    font-weight: 500;
    color: #e4e4e7;
  }
  
  .checkbox-hint {
    display: block;
    font-size: 0.8125rem;
    font-weight: 400;
    color: #909296;
    margin-top: 4px;
  }
  
  .setting-actions {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: 16px;
    flex-wrap: wrap;
  }
  
  .test-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    background: rgba(77, 171, 247, 0.15);
    border: 1px solid rgba(77, 171, 247, 0.3);
    border-radius: 8px;
    color: #4dabf7;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .test-btn:hover:not(:disabled) {
    background: rgba(77, 171, 247, 0.25);
  }
  
  .test-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  .test-result {
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 0.875rem;
    font-weight: 500;
  }
  
  .test-result.success {
    background: rgba(64, 192, 87, 0.15);
    color: #40c057;
    border: 1px solid rgba(64, 192, 87, 0.3);
  }
  
  .test-result.error {
    background: rgba(250, 82, 82, 0.15);
    color: #fa5252;
    border: 1px solid rgba(250, 82, 82, 0.3);
  }
  
  .about-content {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  
  .about-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px;
    background: #25262b;
    border-radius: 8px;
  }
  
  .about-label {
    font-size: 0.875rem;
    color: #909296;
  }
  
  .about-value {
    font-size: 0.875rem;
    font-weight: 600;
    color: #e4e4e7;
  }
  
  .settings-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 24px;
    border-top: 1px solid #2c2e33;
    background: #1a1b1e;
  }
  
  .reset-btn,
  .save-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 18px;
    border-radius: 8px;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .reset-btn {
    background: transparent;
    border: 1px solid #2c2e33;
    color: #909296;
  }
  
  .reset-btn:hover {
    background: #25262b;
    color: #c1c2c5;
  }
  
  .save-btn {
    background: linear-gradient(135deg, #ff922b 0%, #ff6b35 100%);
    border: none;
    color: #ffffff;
  }
  
  .save-btn:hover:not(:disabled) {
    box-shadow: 0 4px 12px rgba(255, 146, 43, 0.4);
    transform: translateY(-1px);
  }
  
  .save-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
</style>
````

## File: src/common/intents.js
````javascript
import { RUNTIME_MESSAGES } from './constants';

export const sendStashCurrentTabIntent = (source = 'app') => {
  return chrome.runtime.sendMessage({
    type: RUNTIME_MESSAGES.STASH_CURRENT_TAB,
    payload: { source },
  });
};
````

## File: src/common/list.js
````javascript
import _ from 'lodash'
import { genObjectId } from './utils'
import { normalizeTab } from './tab'
import { PICKED_LIST_RPOPS } from './constants'

export const createNewTabList = ({ _id, tabs, title, tags, category, time, pinned, expand, color, updatedAt }) => ({
  _id: _id || genObjectId(),
  tabs: Array.isArray(tabs) ? tabs.map(normalizeTab) : [],
  title: title || '',
  tags: tags || [],
  category: category || '',
  time: time || Date.now(),
  titleEditing: false,
  pinned: pinned === true, // default is false
  expand: expand !== false, // default is true
  color: color || '',
  updatedAt: updatedAt || time || Date.now(),
})

export const validateList = list => list != null && Array.isArray(list.tabs)

// Preserving the needed properties before store lists.
export const normalizeList = list => {
  // If a list has no _id, assign a new one.
  if (!list._id) {
    list._id = genObjectId()
  }
  const normalizedList = _.pick(list, PICKED_LIST_RPOPS)
  normalizedList.tabs = normalizedList.tabs.map(normalizeTab)
  return normalizedList
}

export default { createNewTabList, normalizeList, validateList }
````

## File: src/common/storage.js
````javascript
import _ from 'lodash'
import {normalizeList} from '@/common/list'
import options from './options'

const get = key => chrome.storage.local.get(key)
  .then(result => (result && typeof result[key] !== 'undefined') ? result[key] : null)

const set = obj => chrome.storage.local.set(obj)

const getLists = () => get('lists').then(lists => lists || [])

const getOptions = () => get('opts')

const setLists = async lists => {
  if (!Array.isArray(lists)) throw new TypeError(lists)
  const loadedOpts = await getOptions()
  const opts = loadedOpts || options.getDefaultOptions()
  const handledLists = lists.filter(i => Array.isArray(i.tabs)).map(normalizeList)
  if (opts && opts.removeDuplicate) {
    handledLists.forEach(list => {
      list.tabs = _.unionBy(list.tabs, tab => tab.url)
    })
  }
  return set({lists: handledLists})
}

const setOptions = opts => set({
  opts: _.pick(opts, _.keys(options.getDefaultOptions())),
  optsUpdatedAt: Date.now(),
})

export default {
  getLists,
  setLists,
  getOptions,
  setOptions,
  get,
  set,
}
````

## File: webpack.dev.js
````javascript
/* eslint-disable */
const { merge } = require('webpack-merge')
const common = require('./webpack.common.js')

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
})
````

## File: .babelrc
````
{
  "presets": [
    [
      "@babel/preset-env",
      {
        "modules": false,
        "targets": "last 1 years"
      }
    ]
  ],
  "plugins": [
    "@babel/plugin-syntax-dynamic-import"
  ]
}
````

## File: .circleci/config.yml
````yaml
version: 2
jobs:
  install_dependencies:
    docker:
      - image: circleci/node:10.10-jessie
    working_directory: ~/ext
    steps:
      - checkout
      - restore_cache:
          key: deps-{{ checksum "yarn.lock" }}
      - run:
          command: yarn
      - save_cache:
          key: deps-{{ checksum "yarn.lock" }}
          paths: ~/ext/node_modules
      - save_cache:
          key: code-{{ .Environment.CIRCLE_SHA1 }}
          paths: ~/ext

  build:
    docker:
      - image: circleci/node:10.10-jessie
    working_directory: ~/ext
    steps:
      - restore_cache:
          key: code-{{ .Environment.CIRCLE_SHA1 }}
      - run: yarn build
      - save_cache:
          key: build-{{ .Environment.CIRCLE_SHA1 }}
          paths: ~/ext

  release_sentry:
    docker:
      - image: circleci/node:10.10-jessie
    working_directory: ~/ext
    steps:
      - restore_cache:
          key: build-{{ .Environment.CIRCLE_SHA1 }}
      - run:
          name: release sentry
          command: |
            yarn global add @sentry/cli
            export PATH="$PATH:$HOME/.config/yarn/global/node_modules/.bin"
            sentry-cli releases new ${CIRCLE_TAG}
            sentry-cli releases files ${CIRCLE_TAG} upload-sourcemaps dist
            sentry-cli releases finalize ${CIRCLE_TAG}

  publish_chrome:
    docker:
      - image: circleci/node:10.10-jessie
    working_directory: ~/ext
    steps:
      - restore_cache:
          key: build-{{ .Environment.CIRCLE_SHA1 }}
      - run:
          name: publish
          command: |
            yarn global add chrome-webstore-upload-cli
            export PATH="$PATH:$HOME/.config/yarn/global/node_modules/.bin"
            webstore upload --source dist.zip --extension-id $EXTENSION_ID --auto-publish

  publish_firefox:
    docker:
      - image: circleci/node:10.10-jessie
    working_directory: ~/ext
    steps:
      - restore_cache:
          key: build-{{ .Environment.CIRCLE_SHA1 }}
      - run:
          name: publish
          command: |
            yarn global add webext@1.9.1-with-submit.1
            export PATH="$PATH:$HOME/.config/yarn/global/node_modules/.bin"
            webext submit --api-key=${FF_API_KEY} --api-secret=${FF_API_SECRET} --id=${FF_ID} -s dist

  release:
    docker:
      - image: circleci/golang:1.9
    steps:
      - run:
          name: download
          command: |
            wget --content-disposition "https://clients2.google.com/service/update2/crx?response=redirect&prodversion=49.0&x=id%3D${EXTENSION_ID}%26installsource%3Dondemand%26uc"
      - run: go get github.com/tcnksm/ghr
      - run:
          name: release
          command: |
            ghr -t ${GITHUB_TOKEN} \
                -u ${CIRCLE_PROJECT_USERNAME} \
                -r ${CIRCLE_PROJECT_REPONAME} \
                -c ${CIRCLE_SHA1} \
                -delete \
                ${CIRCLE_TAG} ./

workflows:
  version: 2

  main:
    jobs:
      - install_dependencies:
          filters:
            tags:
              only: /^v.*/
      - build:
          requires:
            - install_dependencies
          filters:
            tags:
              only: /^v.*/
      - release_sentry:
          requires:
            - build
          filters:
            tags:
              only: /^v.*/
            branches:
              ignore: /.*/
      - check_chrome:
          type: approval
          requires:
            - build
          filters:
            tags:
              only: /^v.*/
            branches:
              ignore: /.*/
      - publish_chrome:
          requires:
            - check_chrome
          filters:
            tags:
              only: /^v.*/
            branches:
              ignore: /.*/
      - check_firefox:
          type: approval
          requires:
            - build
          filters:
            tags:
              only: /^v.*/
            branches:
              ignore: /.*/
      - publish_firefox:
          requires:
            - check_firefox
          filters:
            tags:
              only: /^v.*/
            branches:
              ignore: /.*/
      - release:
          requires:
            - publish_chrome
          filters:
            tags:
              only: /^v.*/
            branches:
              ignore: /.*/
````

## File: .eslintrc.yml
````yaml
root: true
env:
  es6: true
  browser: true
  webextensions: true
extends:
  - eslint:recommended
parserOptions:
  parser: '@babel/eslint-parser'
  sourceType: module
  ecmaVersion: 2020
  requireConfigFile: false
  babelOptions:
    plugins:
      - "@babel/plugin-syntax-dynamic-import"
rules:
  no-console: 0
globals:
  DEBUG: readonly
  PRODUCTION: readonly
  MOZ: readonly
  ga: readonly
  $state: readonly
  $effect: readonly
  $derived: readonly
  $props: readonly
  $bindable: readonly
  $inspect: readonly
````

## File: src/app/component/main/Snackbar.svelte
````svelte
<script>
  import { syncStore } from "../../store/syncStore.svelte.js";
  import { fade, fly } from "svelte/transition";

  let snackbar = $derived(syncStore.snackbar || { status: false, msg: "" });

  const close = () => {
    syncStore.updateSnackbar({ status: false, msg: "" });
  };

  $effect(() => {
    if (snackbar.status) {
      const timer = setTimeout(close, 3000);
      return () => clearTimeout(timer);
    }
  });
</script>

{#if snackbar.status}
  <div class="snackbar" transition:fly={{ y: 20, duration: 300 }} role="alert">
    <div class="snackbar-content">
      <i class="fas fa-check-circle snackbar-icon"></i>
      <span class="snackbar-message">{snackbar.msg}</span>
      <button
        class="snackbar-close"
        onclick={close}
        aria-label="Close notification"
      >
        <i class="fas fa-times"></i>
      </button>
    </div>
  </div>
{/if}

<style>
  .snackbar {
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 2000;
    max-width: 500px;
    width: calc(100% - 48px);
  }

  .snackbar-content {
    display: flex;
    align-items: center;
    gap: 12px;
    background: linear-gradient(135deg, #1a1b1e 0%, #25262b 100%);
    color: #e4e4e7;
    padding: 16px 20px;
    border-radius: 12px;
    box-shadow:
      0 8px 32px rgba(0, 0, 0, 0.4),
      0 0 0 1px rgba(255, 255, 255, 0.05);
    border: 1px solid #2c2e33;
  }

  .snackbar-icon {
    color: #40c057;
    font-size: 1.125rem;
  }

  .snackbar-message {
    flex: 1;
    font-size: 0.9rem;
    font-weight: 500;
  }

  .snackbar-close {
    background: transparent;
    border: none;
    color: #5c5f66;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 6px;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .snackbar-close:hover {
    background: #2c2e33;
    color: #909296;
  }
</style>
````

## File: src/background/commandHandler.js
````javascript
import tabs from '../common/tabs'

const commands = {
  'store-selected-tabs': tabs.storeSelectedTabs,
  'store-all-tabs': tabs.storeAllTabs,
  'store-all-in-all-windows': tabs.storeAllTabInAllWindows,
  'restore-lastest-list': tabs.restoreLastestList,
  'open-lists': tabs.openlists,
}

const commandHandler = command => {
  console.log('received command', command)
  const handler = commands[command]
  if (!handler) return
  handler()
  // Removed Google Analytics call
  // if (PRODUCTION) ga('send', 'event', 'Command used', command)
}

export default commandHandler
````

## File: src/common/exchange.js
````javascript
import _ from 'lodash'
import moment from 'moment'
import download from 'downloadjs'
import list from './list'
import storage from './storage'

const importFromText = (compatible, data) => new Promise((resolve, reject) => {
  const exchanger = new Worker('exchanger.js')
  exchanger.addEventListener('message', e => {
    if (!e.data || e.data.length == null) return
    exchanger.terminate()
    const lists = e.data.map(list.createNewTabList)
    resolve(lists)
  })
  exchanger.addEventListener('error', reject)
  exchanger.postMessage({compatible, data})
})

const exportToText = async compatible => {
  const lists = await storage.getLists()
  if (compatible) return lists.map(list => list.tabs.map(tab => tab.url + ' | ' + tab.title).join('\n')).join('\n\n')
  return JSON.stringify(lists.map(i => _.pick(i, ['tabs', 'title', 'time', 'tags', 'expand', 'pinned'])), null, 4)
}

const exportToFile = (text, {type, suffix}) => {
  const name = 'IceTab_backup_' + moment().format('L') + suffix
  const blob = new Blob(['\ufeff' + text], {type})
  download(blob, name, type)
}

const types = {
  JSON: { type: 'application/json; charset=utf-8', suffix: '.json' },
  TEXT: { type: 'plain/text; charset=utf-8', suffix: '.txt' },
}

export default {
  importFromText,
  exportToText,
  exportToFile,
  types,
}
````

## File: src/common/migrate.js
````javascript
import _ from 'lodash'
import { normalizeList } from './list'
import logger from './logger.svelte.js'
import { genObjectId, compareVersion } from './utils'
import listManager from './listManager'

const migrations = {
  '1.4.0': async () => {
    // every list need an ID
    const { lists } = await chrome.storage.local.get('lists')
    if (lists) {
      const { 0: listsWithoutId, 1: listsWithId } = _.groupBy(lists.map(normalizeList), list => +!!list._id)
      if (listsWithId) await chrome.storage.local.set({ lists: listsWithId })

      for (const list of listsWithoutId.reverse()) {
        list._id = genObjectId()
        await listManager.addList(list)
      }
    }
    // remove deprecated storage keys
    await chrome.storage.local.remove(['conflict'])
  }
}

const migrate = async () => {
  const { version: dataVersion } = await chrome.storage.local.get('version')
  const { version: currentVersion } = chrome.runtime.getManifest()
  if (dataVersion === currentVersion) return
  const sorted = Object.keys(migrations).sort(compareVersion)
  for (const v of sorted) {
    if (compareVersion(currentVersion, v) > 0) continue
    try {
      console.debug('[migrate] migrating:', v)
      await migrations[v]()
      await chrome.storage.local.set({ version: v })
      console.debug('[migrate] migrated to:', v)
    } catch (err) {
      logger.error('[migrate] migrate failed')
      logger.error(err)
      throw err
    }
  }
}

export default migrate
````

## File: src/common/service/custom-sync.js
````javascript
import storage from '../storage'
import { SYNCED_LIST_PROPS } from '../constants'
import _ from 'lodash'

export class SyncError extends Error {
  constructor(message, { code = 'unknown', status = null } = {}) {
    super(message)
    this.name = 'SyncError'
    this.code = code
    this.status = status
  }
}

const getSettings = async () => {
  const opts = await storage.getOptions()
  return {
    baseUrl: opts.syncBaseUrl || 'http://localhost:8000',
    apiKey: opts.syncApiKey || '',
  }
}

const fetchData = async (path, method = 'GET', body = null) => {
  const { baseUrl, apiKey } = await getSettings()
  const url = `${baseUrl}${path}`
  const headers = {
    'x-api-key': apiKey,
    'Content-Type': 'application/json',
  }
  const options = {
    method,
    headers,
  }
  if (body) {
    options.body = JSON.stringify(body)
  }

  let response
  try {
    response = await fetch(url, options)
  } catch (error) {
    throw new SyncError('Unable to reach sync service', { code: 'offline' })
  }

  if (response.status === 401 || response.status === 403) {
    throw new SyncError('Invalid or missing sync credentials', { code: 'auth', status: response.status })
  }

  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new SyncError(text || `Sync failed (${response.status})`, { code: 'server', status: response.status })
  }

  if (response.status === 204) return null
  return response.json()
}

const serializeListForSync = list => {
  const syncedData = _.pick(list, SYNCED_LIST_PROPS)
  return {
    remote_id: syncedData._id,
    title: syncedData.title || '',
    tabs: syncedData.tabs || [],
    category: syncedData.category || '',
    tags: syncedData.tags || [],
    time: syncedData.time || Date.now(),
    pinned: Boolean(syncedData.pinned),
    color: syncedData.color || '',
    updated_at: syncedData.updatedAt || syncedData.time || Date.now(),
  }
}

export const upload = async list => {
  const payload = serializeListForSync(list)
  const response = await fetchData('/sync/push', 'POST', payload)
  if (!response || response.status !== 'success') {
    throw new SyncError('Server rejected push', { code: 'server' })
  }
  return response
}

export const syncState = async lists => {
  const payload = {
    lists: (lists || []).map(serializeListForSync),
  }
  const response = await fetchData('/sync/state', 'POST', payload)
  if (!response || response.status !== 'success') {
    throw new SyncError('Server rejected sync', { code: 'server' })
  }
  return response
}

export const download = async () => {
  const data = await fetchData('/sync/pull', 'GET')
  if (Array.isArray(data)) {
    return { lists: data, updated_at: null }
  }
  return data
}

export const health = async () => {
  return fetchData('/health', 'GET')
}

export const AI = {
  categorize: async tabs => {
    return fetchData('/ai/categorize', 'POST', { tabs })
  },
}

export default {
  upload,
  syncState,
  download,
  health,
  AI,
  SyncError,
}
````

## File: webpack.prod.js
````javascript
/* eslint-disable */
const { merge } = require('webpack-merge') // Corrected import for webpack-merge
const common = require('./webpack.common.js')
const TerserPlugin = require('terser-webpack-plugin')

module.exports = merge(common, {
  mode: 'production',
  devtool: 'source-map',
  optimization: {
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_debugger: false,
            inline: false,
          },
          sourceMap: true, // sourceMap moved inside terserOptions
        },
        extractComments: false,
        parallel: true,
      }),
    ],
  },
})
````

## File: server/main.py
````python
import os
import datetime
from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, Security, Request
from fastapi.security.api_key import APIKeyHeader
from sqlalchemy.orm import Session
from pydantic import BaseModel
import json
from openai import OpenAI
from dotenv import load_dotenv
import logging

from database import init_db, get_db, User, TabList

load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="SquirrlTab Sync API", version="2.0.0")

# CORS Middleware
from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
API_KEY_NAME = "x-api-key"
api_key_header = APIKeyHeader(name=API_KEY_NAME, auto_error=False)

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=OPENAI_API_KEY) if OPENAI_API_KEY else None

# Pydantic Models
class TabItem(BaseModel):
    title: str
    url: str
    favIconUrl: Optional[str] = ""
    pinned: Optional[bool] = None

class listschema(BaseModel):
    remote_id: str
    title: str
    tabs: List[TabItem]
    category: Optional[str] = None
    tags: Optional[List[str]] = []
    time: Optional[int] = None
    pinned: Optional[bool] = False
    color: Optional[str] = ""
    updated_at: Optional[int] = None

class FullSyncPayload(BaseModel):
    lists: List[listschema] = []

# Helpers
def epoch_ms_to_dt(value: Optional[int]) -> datetime.datetime:
    if value is None:
        return datetime.datetime.utcnow()
    return datetime.datetime.utcfromtimestamp(value / 1000)

def dt_to_epoch_ms(value: Optional[datetime.datetime]) -> Optional[int]:
    if value is None:
        return None
    return int(value.timestamp() * 1000)

# FIXED: Auth Dependency using api_key instead of username
def get_user_by_api_key(api_key: str = Security(api_key_header), db: Session = Depends(get_db)):
    if not api_key:
        logger.warning("No API key provided, checking for default development user")
        user = db.query(User).filter(User.api_key == "dev-key-12345").first()
        if not user:
            user = User(api_key="dev-key-12345")
            db.add(user)
            db.commit()
            db.refresh(user)
            logger.info("Created default development user")
        return user
    
    user = db.query(User).filter(User.api_key == api_key).first()
    if not user:
        raise HTTPException(status_code=403, detail="Could not validate credentials")
    return user

@app.on_event("startup")
def startup_event():
    init_db()
    logger.info("Database initialized")

@app.get("/")
def root():
    return {"status": "running", "version": "2.0.0"}


@app.get("/health")
def health_check():
    return {
        "status": "success",
        "service": "SquirrlTab Sync",
        "version": "1.0.0"
    }
    
# FIXED: Pull Endpoint (Removed user.username)
@app.get("/sync/pull")
def pull_tabs(user: User = Depends(get_user_by_api_key), db: Session = Depends(get_db)):
    try:
        logger.info(f"Pull request from user ID: {user.id}")
        lists = db.query(TabList).filter(TabList.user_id == user.id).all()
        
        result = []
        for l in lists:
            result.append({
                "remote_id": l.remote_id,
                "title": l.title,
                "tabs": json.loads(l.tabs),
                "category": l.category,
                "tags": json.loads(l.tags) if l.tags else [],
                "time": l.time,
                "pinned": bool(l.pinned),
                "color": l.color,
                "updated_at": dt_to_epoch_ms(l.updated_at)
            })
        
        # Calculate last sync time
        dataset_updated = user.last_synced_at or (max((l.updated_at for l in lists if l.updated_at), default=None))
        
        return {
            "status": "success",
            "lists": result,
            "updated_at": dataset_updated.isoformat() if dataset_updated else None
        }
    except Exception as e:
        logger.error(f"Error pulling tabs: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

@app.post("/sync/push")
def push_single_list(data: listschema, user: User = Depends(get_user_by_api_key), db: Session = Depends(get_db)):
    # The extension sends a single list object here
    existing = db.query(TabList).filter(
        TabList.remote_id == data.remote_id, 
        TabList.user_id == user.id
    ).first()
    
    tabs_data = json.dumps([t.dict() for t in data.tabs])
    
    if existing:
        existing.title = data.title
        existing.tabs = tabs_data
        existing.category = data.category
        existing.tags = json.dumps(data.tags)
        existing.time = data.time
        existing.pinned = data.pinned
        existing.color = data.color
    else:
        new_list = TabList(
            user_id=user.id,
            remote_id=data.remote_id,
            title=data.title,
            tabs=tabs_data,
            category=data.category,
            tags=json.dumps(data.tags),
            time=data.time,
            pinned=data.pinned,
            color=data.color
        )
        db.add(new_list)
    
    db.commit()
    return {"status": "success"}

# FIXED: State/Replace Endpoint (Removed user.username)
@app.post("/sync/state")
def replace_state(payload: FullSyncPayload, user: User = Depends(get_user_by_api_key), db: Session = Depends(get_db)):
    try:
        logger.info(f"Full sync for user ID: {user.id} with {len(payload.lists)} lists")
        
        # Clear existing
        db.query(TabList).filter(TabList.user_id == user.id).delete()
        
        for entry in payload.lists:
            updated_dt = epoch_ms_to_dt(entry.updated_at or entry.time)
            new_row = TabList(
                user_id=user.id,
                remote_id=entry.remote_id,
                title=entry.title,
                tabs=json.dumps([t.dict() for t in entry.tabs]),
                category=entry.category,
                tags=json.dumps(entry.tags or []),
                time=entry.time,
                pinned=bool(entry.pinned),
                color=entry.color,
                updated_at=updated_dt,
            )
            db.add(new_row)

        user.last_synced_at = datetime.datetime.utcnow()
        db.commit()
        return {"status": "success", "updated_at": user.last_synced_at.isoformat()}
    except Exception as e:
        logger.error(f"Error during full sync: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info(f"{request.method} {request.url.path}")
    response = await call_next(request)
    return response
````

## File: src/app/App.svelte
````svelte
<script>
  import { syncStore } from "./store/syncStore.svelte.js";
  import Drawer from "./component/main/Drawer.svelte";
  import Toolbar from "./component/main/Toolbar.svelte";
  import DetailList from "./page/main/DetailList.svelte";
  import SettingsView from "./page/settings/SettingsView.svelte";
  import Snackbar from "./component/main/Snackbar.svelte";

  let drawerOpen = $state(false);
  let activeView = $state("all");

  function handleViewChange(view) {
    activeView = view;
    drawerOpen = false;
  }
</script>

<div class="app">
  <Toolbar
    onToggleDrawer={() => (drawerOpen = !drawerOpen)}
    onOpenSettings={() => {
      activeView = "options";
      drawerOpen = false;
    }}
  />

  <Drawer bind:open={drawerOpen} onSetView={handleViewChange} />

  <main class="main-content">
    {#if activeView === "options"}
      <SettingsView onBack={() => (activeView = "all")} />
    {:else}
      <DetailList {activeView} />
    {/if}
  </main>

  <Snackbar />
</div>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
      "Helvetica Neue", Arial, sans-serif;
    background: #141517;
    color: #e4e4e7;
    overflow: hidden;
  }

  :global(*) {
    box-sizing: border-box;
  }

  .app {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background: #141517;
  }

  .main-content {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
  }

  /* Custom Scrollbar */
  :global(::-webkit-scrollbar) {
    width: 8px;
    height: 8px;
  }

  :global(::-webkit-scrollbar-track) {
    background: transparent;
  }

  :global(::-webkit-scrollbar-thumb) {
    background: #3c3e44;
    border-radius: 4px;
  }

  :global(::-webkit-scrollbar-thumb:hover) {
    background: #4c4e54;
  }
</style>
````

## File: src/app/component/main/Drawer.svelte
````svelte
<script>
  import { syncStore } from "../../store/syncStore.svelte.js";
  import { fade, fly } from "svelte/transition";
  import { SYNC_PHASES } from "@/common/constants";
  import { sendStashCurrentTabIntent } from "@/common/intents";
  import { getRuntimeSource, isPopupContext } from "@/common/runtimeContext";

  let { open = $bindable(false), onSetView } = $props();

  const setView = (view) => {
    if (onSetView) onSetView(view);
    open = false;
  };

  let taggedLists = $derived(syncStore.taggedLists);
  let syncMeta = $derived(syncStore.syncStatus);
  let stashLoading = $state(false);
  const runtimeSource = getRuntimeSource();
  const popupContext = isPopupContext();

  const formatSyncedTime = (timestamp) => {
    if (!timestamp) return "";
    return new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  let statusLabel = $derived(() => {
    if (syncMeta.syncing) return "Syncing...";
    if (syncMeta.phase === SYNC_PHASES.OFFLINE) return "Offline mode";
    if (syncMeta.phase === SYNC_PHASES.AUTH_ERROR) return "Sync auth required";
    if (syncMeta.phase === SYNC_PHASES.SERVER_ERROR) return syncMeta.error?.message || "Sync failed";
    if (syncMeta.phase === SYNC_PHASES.LOCAL_ONLY) return "Local changes pending";
    if (syncMeta.phase === SYNC_PHASES.NEVER_SYNCED) return "Not synced yet";
    if (syncMeta.lastSyncedAt) return `Synced ${formatSyncedTime(syncMeta.lastSyncedAt)}`;
    return "Idle";
  });

  // Popup UI must never perform async tab, storage, or sync work; delegate via runtime messaging only.
  const handleQuickStash = () => {
    if (!popupContext || stashLoading) return;
    stashLoading = true;
    sendStashCurrentTabIntent(runtimeSource)
      .catch((error) => {
        console.error("[SquirrlTab] Failed to dispatch stash intent from popup:", error);
      })
      .finally(() => {
        stashLoading = false;
      });
  };
</script>

{#if open}
  <div
    class="overlay"
    role="button"
    tabindex="0"
    onclick={() => (open = false)}
    onkeydown={(e) => e.key === "Escape" && (open = false)}
    transition:fade={{ duration: 200 }}
  ></div>

  <aside class="drawer" transition:fly={{ x: -280, duration: 300, opacity: 1 }}>
    <!-- Drawer Header -->
    <header class="drawer-header">
      <div class="logo-section">
        <i class="fas fa-squirrel logo-icon"></i>
        <div class="logo-text">
          <span class="logo-title">SquirrlTab</span>
          <span class="logo-subtitle">Winter Storage</span>
        </div>
      </div>
    </header>

    {#if popupContext}
      <!-- Quick Actions -->
      <section class="quick-actions">
        <button class="action-btn primary" onclick={handleQuickStash} disabled={stashLoading}>
          <i class={`fas ${stashLoading ? "fa-spinner fa-spin" : "fa-plus"}`}></i>
          <span>{stashLoading ? "Stashing..." : "Stash This Tab"}</span>
        </button>
      </section>
    {/if}

    <!-- Navigation -->
    <nav class="nav-section">
      <ul class="nav-list">
        <li>
          <button class="nav-item" onclick={() => setView("all")}>
            <i class="fas fa-th-large"></i>
            <span>All Stashes</span>
          </button>
        </li>
        <li>
          <button class="nav-item" onclick={() => setView("pinned")}>
            <i class="fas fa-thumbtack"></i>
            <span>Pinned</span>
          </button>
        </li>
      </ul>
    </nav>

    <div class="divider"></div>

    <!-- Categories Section -->
    <section class="categories-section">
      <div class="section-header">
        <span class="section-label">Categories</span>
      </div>

      <ul class="nav-list">
        {#each Object.keys(taggedLists) as tag}
          <li>
            <button
              class="nav-item category"
              onclick={() => setView(`tag:${tag}`)}
            >
              <i class="fas fa-tag"></i>
              <span>{tag}</span>
              <span class="count">{taggedLists[tag].length}</span>
            </button>
          </li>
        {:else}
          <li class="empty-hint">
            <i class="fas fa-info-circle"></i>
            <span>No tags stashed yet</span>
          </li>
        {/each}
      </ul>
    </section>

    <div class="spacer"></div>

    <!-- Footer Section -->
    <footer class="drawer-footer">
      <button class="nav-item secondary" onclick={() => setView("options")}>
        <i class="fas fa-cog"></i>
        <span>Settings</span>
      </button>

    <div class="sync-status">
      <div
        class="status-indicator"
        class:online={syncMeta.phase === SYNC_PHASES.SYNCED && !syncMeta.localOnly}
        class:offline={syncMeta.phase === SYNC_PHASES.OFFLINE}
        class:error={syncMeta.phase === SYNC_PHASES.SERVER_ERROR || syncMeta.phase === SYNC_PHASES.AUTH_ERROR}
        class:syncing={syncMeta.syncing}
        class:local={syncMeta.localOnly || syncMeta.phase === SYNC_PHASES.LOCAL_ONLY}
      >
        <span class="status-dot"></span>
        <span class="status-text">{statusLabel}</span>
      </div>
    </div>
  </footer>
</aside>
{/if}

<style>
  /* Overlay */
  .overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(4px);
    z-index: 1000;
  }

  /* Drawer */
  .drawer {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    width: 280px;
    background: #1a1b1e;
    z-index: 1001;
    display: flex;
    flex-direction: column;
    box-shadow: 4px 0 24px rgba(0, 0, 0, 0.5);
    border-right: 1px solid #2c2e33;
  }

  /* Drawer Header */
  .drawer-header {
    padding: 20px;
    border-bottom: 1px solid #2c2e33;
  }

  .logo-section {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .logo-icon {
    color: #ff922b;
    font-size: 1.75rem;
    filter: drop-shadow(0 2px 4px rgba(255, 146, 43, 0.3));
  }

  .logo-text {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .logo-title {
    font-weight: 700;
    font-size: 1.125rem;
    color: #e4e4e7;
    letter-spacing: -0.02em;
  }

  .logo-subtitle {
    font-size: 0.75rem;
    color: #5c5f66;
    font-weight: 500;
  }

  /* Quick Actions */
  .quick-actions {
    padding: 16px;
  }

  .action-btn {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 12px 16px;
    background: linear-gradient(135deg, #ff922b 0%, #ff6b35 100%);
    border: none;
    border-radius: 10px;
    color: white;
    font-weight: 600;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 2px 8px rgba(255, 146, 43, 0.3);
  }

  .action-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(255, 146, 43, 0.4);
  }

  .action-btn:active {
    transform: translateY(0);
  }

  /* Navigation */
  .nav-section,
  .categories-section,
  .nav-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .nav-item {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 12px;
    background: transparent;
    border: none;
    border-radius: 8px;
    color: #c1c2c5;
    font-size: 0.9rem;
    text-align: left;
    cursor: pointer;
    transition: all 0.2s;
    position: relative;
  }

  .nav-item i {
    width: 18px;
    font-size: 0.9rem;
    color: #5c5f66;
    transition: all 0.2s;
  }

  .nav-item span {
    flex: 1;
  }

  .nav-item:hover {
    background: #25262b;
    color: #e4e4e7;
  }

  .nav-item:hover i {
    color: #909296;
  }

  .nav-item.category:hover i {
    color: #ff922b;
  }

  .nav-item.secondary {
    color: #909296;
  }

  .count {
    background: #2c2e33;
    color: #909296;
    padding: 2px 8px;
    border-radius: 10px;
    font-size: 0.75rem;
    font-weight: 600;
    min-width: 24px;
    text-align: center;
  }

  /* Section Headers */
  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 12px 8px;
  }

  .section-label {
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #5c5f66;
    font-weight: 600;
  }

  .categories-section .section-label {
    padding: 16px 12px 8px;
  }

  /* Empty Hint */
  .empty-hint {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px;
    font-size: 0.8rem;
    color: #5c5f66;
    font-style: italic;
  }

  .empty-hint i {
    font-size: 0.875rem;
  }

  /* Divider */
  .divider {
    height: 1px;
    background: #2c2e33;
    margin: 12px 16px;
  }

  /* Spacer */
  .spacer {
    flex: 1;
  }

  /* Footer */
  .drawer-footer {
    padding: 16px;
    border-top: 1px solid #2c2e33;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .sync-status {
    padding: 8px 12px;
  }

  .status-indicator {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.75rem;
    color: #909296;
  }

  .status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #5c5f66;
    transition: all 0.3s;
  }

  .status-indicator.online .status-dot {
    background: #40c057;
    box-shadow: 0 0 8px rgba(64, 192, 87, 0.4);
  }

  .status-indicator.offline .status-dot {
    background: #fa5252;
    box-shadow: 0 0 8px rgba(250, 82, 82, 0.4);
  }

  .status-indicator.syncing {
    color: #ff922b;
  }

  .status-indicator.error {
    color: #fa5252;
  }

  .status-indicator.local .status-dot {
    background: #ffa94d;
    box-shadow: 0 0 8px rgba(255, 169, 77, 0.4);
  }

  .status-text {
    font-weight: 500;
  }
</style>
````

## File: src/app/component/main/Toolbar.svelte
````svelte
<script>
  import SyncStatusBadge from "../sync/SyncStatusBadge.svelte";

  let { onToggleDrawer, onOpenSettings } = $props();
</script>

<nav class="toolbar">
  <div class="toolbar-left">
    <button class="menu-btn" onclick={onToggleDrawer} title="Open menu">
      <i class="fas fa-bars"></i>
    </button>

    <div class="brand">
      <i class="fas fa-squirrel brand-icon"></i>
      <span class="brand-name">SquirrlTab</span>
    </div>
  </div>

  <div class="toolbar-right">
    <div class="sync-wrapper">
      <SyncStatusBadge />
    </div>

    <button class="icon-btn" onclick={onOpenSettings} title="Settings">
      <i class="fas fa-cog"></i>
    </button>

    <button class="icon-btn" title="More options">
      <i class="fas fa-ellipsis-v"></i>
    </button>
  </div>
</nav>

<style>
  .toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 56px;
    background: #1a1b1e;
    border-bottom: 1px solid #2c2e33;
    padding: 0 16px;
    gap: 16px;
    flex-shrink: 0;
  }

  .toolbar-left,
  .toolbar-right {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .toolbar-left {
    flex: 1;
  }

  /* Menu Button */
  .menu-btn {
    background: transparent;
    border: none;
    color: #909296;
    cursor: pointer;
    padding: 8px 12px;
    border-radius: 8px;
    font-size: 1.125rem;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .menu-btn:hover {
    background: #25262b;
    color: #e4e4e7;
  }

  .menu-btn:active {
    transform: scale(0.95);
  }

  /* Brand */
  .brand {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .brand-icon {
    color: #ff922b;
    font-size: 1.25rem;
  }

  .brand-name {
    font-size: 1.125rem;
    font-weight: 700;
    color: #e4e4e7;
    letter-spacing: -0.02em;
  }

  /* Icon Buttons */
  .icon-btn {
    background: transparent;
    border: none;
    color: #909296;
    cursor: pointer;
    padding: 8px 10px;
    border-radius: 8px;
    font-size: 0.9rem;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .icon-btn:hover {
    background: #25262b;
    color: #e4e4e7;
  }

  .icon-btn:active {
    transform: scale(0.95);
  }

  /* Sync Indicator */
  .sync-wrapper {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  /* Responsive */
  @media (max-width: 768px) {
    .brand-name {
      display: none;
    }

  }
</style>
````

## File: src/app/page/main/DetailList.svelte
````svelte
<script>
  import { syncStore } from "../../store/syncStore.svelte.js";
  import { fade, fly, slide } from "svelte/transition";
  import browser from "webextension-polyfill";
  import TagInput from "../../component/tags/TagInput.svelte";
  import { sendStashCurrentTabIntent } from "@/common/intents";
  import { getRuntimeSource, isPopupContext } from "@/common/runtimeContext";

  let { activeView = "all" } = $props();

  let isReady = $derived(syncStore.initialized);
  let lists = $derived(syncStore.lists);
  let sortMode = $state("newest");
  const runtimeSource = getRuntimeSource();
  const popupContext = isPopupContext();

  // Load saved sort preference
  $effect(() => {
    browser.storage.local.get("sortPreference").then((data) => {
      if (data.sortPreference) {
        sortMode = data.sortPreference;
      }
    });
  });

  // Save sort preference when changed
  $effect(() => {
    if (sortMode === "newest") {
      browser.storage.local.remove("sortPreference");
      return;
    }
    browser.storage.local.set({ sortPreference: sortMode });
  });
  let filterQuery = $state("");
  let expandedLists = $state(new Set());
  let menuOpenFor = $state(null);
  let emptyStashLoading = $state(false);
  let aiLoading = $derived(syncStore.aiLoading);

  const sortComparators = {
    newest: (a, b) => (b.time || 0) - (a.time || 0),
    oldest: (a, b) => (a.time || 0) - (b.time || 0),
    aToZ: (a, b) => (a.title || "").localeCompare(b.title || ""),
    zToA: (a, b) => (b.title || "").localeCompare(a.title || ""),
  };

  const matchFilter = (list) => {
    if (!filterQuery.trim()) return true;
    const needle = filterQuery.trim().toLowerCase();
    const titleMatch = (list.title || "").toLowerCase().includes(needle);
    const tagMatch = (list.tags || []).some((tag) => tag.toLowerCase().includes(needle));
    return titleMatch || tagMatch;
  };

  let visibleLists = $derived(() => {
    if (!isReady) return [];

    let base = lists;
    if (activeView === "pinned") {
      base = syncStore.pinnedLists;
    } else if (activeView.startsWith("tag:")) {
      const tag = activeView.substring(4);
      base = syncStore.taggedLists[tag] || [];
    }
    const filtered = base.filter(matchFilter);
    const comparator = sortComparators[sortMode] || sortComparators.newest;
    return [...filtered].sort(comparator);
  });

  let totalBeforeFilter = $derived(() => {
    if (activeView === "pinned") return syncStore.pinnedLists.length;
    if (activeView.startsWith("tag:")) {
      const tag = activeView.substring(4);
      return (syncStore.taggedLists[tag] || []).length;
    }
    return lists.length;
  });

  let isFiltered = $derived(() => filterQuery.trim().length > 0);
  let filteredOutCount = $derived(() => totalBeforeFilter - visibleLists.length);

  // Extract all unique tags from all lists for autocomplete
  let allKnownTags = $derived(() => {
    const tagSet = new Set();
    lists.forEach((list) => {
      (list.tags || []).forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  });

  function toggleExpand(listId) {
    if (expandedLists.has(listId)) {
      expandedLists.delete(listId);
    } else {
      expandedLists.add(listId);
    }
    expandedLists = new Set(expandedLists);
  }

  const interactiveHeaderSelector = "button, input, select, textarea, a";

  function shouldIgnoreHeaderEvent(event) {
    if (!event || !event.target) return false;
    return Boolean(event.target.closest(interactiveHeaderSelector));
  }

  function handleHeaderClick(event, listId) {
    if (shouldIgnoreHeaderEvent(event)) return;
    toggleExpand(listId);
  }

  function handleHeaderKeydown(event, listId) {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    toggleExpand(listId);
  }

  function toggleMenu(listId) {
    menuOpenFor = menuOpenFor === listId ? null : listId;
  }

  function removeTab(listId, tabIndex) {
    const list = lists.find((l) => l._id === listId);
    if (!list) return;

    const updatedTabs = list.tabs.filter((_, i) => i !== tabIndex);
    if (updatedTabs.length === 0) {
      syncStore.removeList(listId);
    } else {
      syncStore.updateList(listId, { tabs: updatedTabs });
    }
  }

  async function handleRestore(list, inNewWindow = false) {
    if (!list) return;
    menuOpenFor = null;
    if (!list.pinned) {
      const confirmed = confirm(
        `\u26A0\uFE0F This stash is NOT pinned.\n\n` +
          `Restoring will:\n` +
          `\u2713 Reopen all ${list.tabs?.length || 0} tabs\n` +
          `\u2717 Delete this stash permanently\n\n` +
          `Tip: Pin the stash first if you want to keep it.\n\n` +
          `Continue with restore?`
      );
      if (!confirmed) return;
    } else {
      const confirmed = confirm(
        `\uD83D\uDCCC This stash is pinned.\n\n` +
          `Restoring will:\n` +
          `\u2713 Reopen all ${list.tabs?.length || 0} tabs\n` +
          `\u2713 Keep this stash for future use\n\n` +
          `Continue?`
      );
      if (!confirmed) return;
    }
    const success = await syncStore.restoreList(list._id, inNewWindow);
    if (success) {
      syncStore.updateSnackbar(
        list.pinned
          ? "Tabs restored (stash kept because it is pinned)"
          : "Tabs restored and stash cleared"
      );
    }
  }

  function handleDelete(list) {
    if (!list) return;
    menuOpenFor = null;
    const confirmed = confirm("Delete this stash permanently?");
    if (!confirmed) return;
    syncStore.removeList(list._id);
    syncStore.updateSnackbar("Stash deleted");
  }

  async function runAiCategorization(list) {
    if (!list) return;
    const confirmed = confirm(
      "AI categorization will replace the current category and tags for this stash. Continue?"
    );
    if (!confirmed) return;
    try {
      await syncStore.categorizeList(list._id);
      syncStore.updateSnackbar("AI suggestions applied");
    } catch (error) {
      syncStore.updateSnackbar("AI categorization failed");
    } finally {
      menuOpenFor = null;
    }
  }

  function addTag(list, newTag) {
    if (!list || !newTag) return;
    const tags = Array.from(new Set([...(list.tags || []), newTag]));
    syncStore.updateList(list._id, { tags });
  }

  function removeTag(list, tag) {
    if (!list) return;
    const tags = (list.tags || []).filter((t) => t !== tag);
    syncStore.updateList(list._id, { tags });
  }

  // Popup UI dispatches stash intent only; background performs all tab and storage work.
  function stashCurrentTabFromEmpty() {
    if (!popupContext || emptyStashLoading) return;
    emptyStashLoading = true;
    sendStashCurrentTabIntent(runtimeSource)
      .catch((error) => {
        console.error("[SquirrlTab] Failed to dispatch stash intent from popup:", error);
      })
      .finally(() => {
        emptyStashLoading = false;
      });
  }

  function getViewTitle() {
    if (activeView === "all") return "All Stashes";
    if (activeView === "pinned") return "Pinned Stashes";
    if (activeView.startsWith("tag:")) {
      return `#${activeView.substring(4)}`;
    }
    return "Stashes";
  }

  $effect(() => {
    const handleGlobalClick = () => {
      if (menuOpenFor !== null) menuOpenFor = null;
    };
    document.addEventListener("click", handleGlobalClick);
    return () => document.removeEventListener("click", handleGlobalClick);
  });
</script>

{#if !isReady}
  <div class="loading-container" transition:fade>
    <div class="loading-content">
      <div class="loading-spinner"></div>
      <p class="loading-text">Gathering your acorns...</p>
      <p class="loading-subtext">Preparing your winter store</p>
    </div>
  </div>
{:else if visibleLists.length === 0}
  <div class="empty-state" transition:fade>
    <div class="empty-content">
      <div class="empty-icon-wrapper">
        <i class="fas fa-box-open empty-icon"></i>
      </div>
      <h2 class="empty-title">No stashes found</h2>
      <p class="empty-description">
        {#if activeView === "all"}
          Start hoarding tabs for winter! Right-click any tab and select "Stash
          This Tab"
        {:else if activeView === "pinned"}
          Pin important stashes to keep them easily accessible
        {:else}
          No stashes with this tag yet. Add tags to organize your collection
        {/if}
      </p>
      {#if activeView === "all" && popupContext}
        <button class="action-button" onclick={stashCurrentTabFromEmpty} disabled={emptyStashLoading}>
          <i class={`fas ${emptyStashLoading ? "fa-spinner fa-spin" : "fa-plus"}`}></i>
          <span>{emptyStashLoading ? "Stashing..." : "Stash Current Tab"}</span>
        </button>
      {/if}
    </div>
  </div>
{:else}
  <div class="lists-container">
    <!-- View Header -->
    <div class="view-header">
      <div class="view-title">
        <h1>{getViewTitle()}</h1>
        <span class="stash-count">
          {visibleLists.length}
          {visibleLists.length === 1 ? "stash" : "stashes"}
          {#if isFiltered && filteredOutCount > 0}
            <span class="filter-indicator">
              ({filteredOutCount} hidden by filter)
            </span>
          {/if}
        </span>
      </div>

      <div class="view-actions">
        <label class="sort-control">
          <span class="control-label">Sort by</span>
          <div class="sort-select">
            <i class="fas fa-sort"></i>
            <select bind:value={sortMode} aria-label="Sort stashes">
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="aToZ">Title A → Z</option>
              <option value="zToA">Title Z → A</option>
            </select>
          </div>
        </label>
        <div class="filter-input">
          <i class="fas fa-filter"></i>
          <input
            type="text"
            placeholder="Filter by title or tag"
            bind:value={filterQuery}
            aria-label="Filter stashes"
          />
          {#if filterQuery}
            <button class="clear-filter" onclick={() => (filterQuery = "")} aria-label="Clear filter">
              <i class="fas fa-times"></i>
            </button>
          {/if}
        </div>
        {#if isFiltered}
          <button
            class="clear-all-btn"
            onclick={() => {
              filterQuery = "";
              sortMode = "newest";
            }}
            title="Reset sort and filter"
          >
            <i class="fas fa-redo"></i>
            <span>Reset</span>
          </button>
        {/if}
      </div>
    </div>

    <!-- Lists Grid -->
    <div class="lists-grid">
      {#each visibleLists as list (list._id)}
        <div
          class="stash-card"
          transition:fly={{ y: 20, duration: 300, delay: 0 }}
        >
          <!-- Card Header -->
          <div
            class="card-header"
            class:pinned={list.pinned}
            role="button"
            tabindex="0"
            aria-expanded={expandedLists.has(list._id)}
            aria-controls={`stash-panel-${list._id}`}
            onclick={(event) => handleHeaderClick(event, list._id)}
            onkeydown={(event) => handleHeaderKeydown(event, list._id)}
          >
            <button
              class="expand-toggle"
              type="button"
              onclick={() => toggleExpand(list._id)}
              aria-label={expandedLists.has(list._id) ? "Collapse" : "Expand"}
            >
              <i
                class="fas fa-chevron-{expandedLists.has(list._id)
                  ? 'down'
                  : 'right'}"
              ></i>
            </button>

            <div class="title-section">
              <input
                type="text"
                class="stash-title"
                value={list.title || "Untitled Stash"}
                placeholder="Untitled Stash"
                onblur={(e) =>
                  syncStore.updateList(list._id, { title: e.target.value })}
              />
              <div class="meta-info">
                <span class="tab-count">
                  <i class="fas fa-file"></i>
                  {list.tabs?.length || 0} tabs
                </span>
                {#if list.time}
                  <span class="stash-date">
                    <i class="fas fa-clock"></i>
                    {new Date(list.time).toLocaleDateString()}
                  </span>
                {/if}
              </div>
            </div>

            <div class="card-actions">
              <button
                class="card-btn pin"
                class:pinned={list.pinned}
                onclick={() => syncStore.pinList(list._id, !list.pinned)}
                title={
                  list.pinned
                    ? "Unpin (stash will be deleted when restored)"
                    : "Pin (stash will be kept after restore)"
                }
              >
                <i class="fas fa-thumbtack"></i>
              </button>

              <button
                class="card-btn"
                onclick={() => handleRestore(list, false)}
                title="Restores tabs and removes this stash unless it is pinned"
              >
                <i class="fas fa-folder-open"></i>
              </button>

              <div class="action-menu">
                <button
                  class="card-btn"
                  title="More options"
                  aria-haspopup="true"
                  aria-expanded={menuOpenFor === list._id}
                  onclick={(event) => {
                    event.stopPropagation();
                    toggleMenu(list._id);
                  }}
                >
                  <i class="fas fa-ellipsis-v"></i>
                </button>
                {#if menuOpenFor === list._id}
                  <div class="menu-panel">
                    <button onclick={() => handleRestore(list, true)}>
                      <i class="fas fa-clone"></i>
                      Restore in new window
                    </button>
                    <!-- AI Categorization - deferred to v2
                    <button
                      onclick={() => runAiCategorization(list)}
                      disabled={aiLoading === list._id}
                      title="AI replaces the category and tags for this stash"
                    >
                      <i class={`fas ${aiLoading === list._id ? "fa-spinner fa-spin" : "fa-magic"}`}></i>
                      {aiLoading === list._id ? "Categorizing..." : "AI Categorize"}
                    </button>
                    -->
                    <button class="danger" onclick={() => handleDelete(list)}>
                      <i class="fas fa-trash"></i>
                      Delete stash
                    </button>
                  </div>
                {/if}
              </div>
            </div>
            {#if !list.pinned}
              <p class="restore-hint">Restoring removes this stash unless it is pinned.</p>
            {/if}
          </div>

          <!-- Card Content (Tabs) -->
          {#if expandedLists.has(list._id)}
            <div
              id={`stash-panel-${list._id}`}
              class="card-content"
              transition:slide={{ duration: 300 }}
            >
              <div class="tabs-list">
                {#each list.tabs || [] as tab, index (tab.url + index)}
                  <div class="tab-row">
                    <div class="tab-favicon">
                      <img
                        src={tab.favIconUrl ||
                          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath fill='%235c5f66' d='M8 0a8 8 0 100 16A8 8 0 008 0z'/%3E%3C/svg%3E"}
                        alt=""
                        onerror={(e) => (e.target.style.display = "none")}
                      />
                    </div>

                    <a
                      href={tab.url}
                      class="tab-info"
                      target="_blank"
                      rel="noopener noreferrer"
                      title={tab.title}
                    >
                      <span class="tab-title">{tab.title || tab.url}</span>
                      <span class="tab-url">{new URL(tab.url).hostname}</span>
                    </a>

                    <button
                      class="remove-tab"
                      onclick={() => removeTab(list._id, index)}
                      aria-label="Remove tab"
                    >
                      <i class="fas fa-times"></i>
                    </button>
                  </div>
                {/each}
              </div>
            </div>
          {/if}

          <div class="card-footer">
            <div class="tags-container">
              {#if list.tags && list.tags.length > 0}
                {#each list.tags as tag}
                  <span class="tag">
                    {tag}
                    <button
                      class="remove-tag"
                      title="Remove tag"
                      onclick={() => removeTag(list, tag)}
                    >
                      <i class="fas fa-times"></i>
                    </button>
                  </span>
                {/each}
              {:else}
                <span class="tag muted">No tags yet</span>
              {/if}
            </div>
            
            <TagInput
              existingTags={list.tags || []}
              allKnownTags={allKnownTags}
              onAdd={(tag) => addTag(list, tag)}
              placeholder="Add a tag..."
            />
          </div>

          <!-- Quick Preview (when collapsed) -->
          {#if !expandedLists.has(list._id) && list.tabs && list.tabs.length > 0}
            <div class="quick-preview">
              {#each list.tabs.slice(0, 5) as tab}
                <div class="preview-favicon" title={tab.title}>
                  <img
                    src={tab.favIconUrl ||
                      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath fill='%235c5f66' d='M8 0a8 8 0 100 16A8 8 0 008 0z'/%3E%3C/svg%3E"}
                    alt=""
                  />
                </div>
              {/each}
              {#if list.tabs.length > 5}
                <span class="preview-more">+{list.tabs.length - 5}</span>
              {/if}
            </div>
          {/if}
        </div>
      {/each}
    </div>
  </div>
{/if}

<style>
  /* Loading State */
  .loading-container {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    background: #141517;
  }

  .loading-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
  }

  .loading-spinner {
    width: 48px;
    height: 48px;
    border: 4px solid #2c2e33;
    border-top-color: #ff922b;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .loading-text {
    color: #e4e4e7;
    font-size: 1.125rem;
    font-weight: 600;
    margin: 0;
  }

  .loading-subtext {
    color: #5c5f66;
    font-size: 0.875rem;
    margin: 0;
  }

  /* Empty State */
  .empty-state {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: calc(100vh - 56px);
    background: #141517;
    padding: 40px 20px;
  }

  .empty-content {
    text-align: center;
    max-width: 480px;
  }

  .empty-icon-wrapper {
    margin-bottom: 24px;
  }

  .empty-icon {
    font-size: 80px;
    color: #2c2e33;
  }

  .empty-title {
    font-size: 1.75rem;
    font-weight: 700;
    color: #e4e4e7;
    margin: 0 0 12px 0;
  }

  .empty-description {
    font-size: 0.95rem;
    color: #909296;
    line-height: 1.6;
    margin: 0 0 32px 0;
  }

  .action-button {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 14px 28px;
    background: linear-gradient(135deg, #ff922b 0%, #ff6b35 100%);
    border: none;
    border-radius: 12px;
    color: white;
    font-weight: 600;
    font-size: 0.95rem;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 4px 12px rgba(255, 146, 43, 0.3);
  }

  .action-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(255, 146, 43, 0.4);
  }

  /* Lists Container */
  .lists-container {
    background: #141517;
    min-height: calc(100vh - 56px);
    padding: 32px;
  }

  /* View Header */
  .view-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 32px;
  }

  .view-title h1 {
    font-size: 2rem;
    font-weight: 700;
    color: #e4e4e7;
    margin: 0 0 4px 0;
  }

  .stash-count {
    font-size: 0.875rem;
    color: #5c5f66;
    font-weight: 500;
  }

  .filter-indicator {
    color: #ffc078;
    font-weight: 500;
    font-size: 0.8rem;
    margin-left: 6px;
  }

  .view-actions {
    display: flex;
    gap: 12px;
    align-items: center;
    flex-wrap: wrap;
  }

  .sort-control {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .control-label {
    font-size: 0.75rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #5c5f66;
    font-weight: 600;
  }

  .sort-select {
    display: flex;
    align-items: center;
    gap: 8px;
    background: #1a1b1e;
    border: 1px solid #2c2e33;
    border-radius: 10px;
    padding: 8px 12px;
  }

  .sort-select select {
    background: transparent;
    border: none;
    color: #e4e4e7;
    font-size: 0.875rem;
    appearance: none;
  }

  .filter-input {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background: #1a1b1e;
    border: 1px solid #2c2e33;
    border-radius: 10px;
    min-width: 240px;
  }

  .filter-input input {
    flex: 1;
    background: transparent;
    border: none;
    color: #e4e4e7;
    font-size: 0.875rem;
    outline: none;
  }

  .clear-filter {
    background: transparent;
    border: none;
    color: #5c5f66;
    padding: 2px;
    border-radius: 4px;
    transition: color 0.2s;
  }

  .clear-filter:hover {
    color: #e4e4e7;
  }

  .clear-all-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    background: rgba(255, 146, 43, 0.12);
    border: 1px solid rgba(255, 146, 43, 0.3);
    border-radius: 8px;
    color: #ff922b;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .clear-all-btn:hover {
    background: rgba(255, 146, 43, 0.2);
    border-color: rgba(255, 146, 43, 0.5);
  }

  /* Lists Grid */
  .lists-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
    gap: 20px;
  }

  /* Stash Card */
  .stash-card {
    background: #1a1b1e;
    border: 1px solid #2c2e33;
    border-radius: 16px;
    overflow: visible;
    transition: all 0.3s;
  }

  .stash-card:hover {
    border-color: #3c3e44;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
    transform: translateY(-2px);
  }

  /* Card Header */
  .card-header {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 20px;
    background: linear-gradient(180deg, #1e1f23 0%, #1a1b1e 100%);
    border-bottom: 1px solid #2c2e33;
    position: relative;
  }

  .card-header.pinned {
    border-left: 3px solid #ff922b;
    padding-left: 17px;
  }

  .card-header.pinned::before {
    content: "\01F4CC";
    position: absolute;
    left: 8px;
    top: 12px;
    font-size: 1rem;
    opacity: 0.6;
  }

  .expand-toggle {
    flex-shrink: 0;
    background: transparent;
    border: none;
    color: #5c5f66;
    cursor: pointer;
    padding: 4px;
    border-radius: 6px;
    transition: all 0.2s;
    margin-top: 2px;
  }

  .expand-toggle:hover {
    background: #25262b;
    color: #909296;
  }

  .title-section {
    flex: 1;
    min-width: 0;
  }

  .stash-title {
    width: 100%;
    background: transparent;
    border: none;
    color: #e4e4e7;
    font-size: 1.125rem;
    font-weight: 600;
    padding: 4px 8px;
    margin: -4px -8px 4px;
    border-radius: 6px;
    outline: none;
    transition: all 0.2s;
  }

  .stash-title:hover {
    background: rgba(255, 255, 255, 0.02);
  }

  .stash-title:focus {
    background: #25262b;
    box-shadow: 0 0 0 2px rgba(255, 146, 43, 0.2);
  }

  .meta-info {
    display: flex;
    align-items: center;
    gap: 16px;
    font-size: 0.8125rem;
    color: #5c5f66;
  }

  .meta-info span {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .meta-info i {
    font-size: 0.75rem;
  }

  .card-actions {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .card-btn {
    background: transparent;
    border: none;
    color: #5c5f66;
    cursor: pointer;
    padding: 8px 10px;
    border-radius: 8px;
    transition: all 0.2s;
    font-size: 0.875rem;
  }

  .card-btn:hover {
    background: #25262b;
    color: #909296;
  }

  .card-btn.pin.pinned {
    color: #ff922b;
    background: rgba(255, 146, 43, 0.1);
  }

  .action-menu {
    position: relative;
  }

  .menu-panel {
    position: absolute;
    top: 42px;
    right: 0;
    background: #1e1f23;
    border: 1px solid #2c2e33;
    border-radius: 10px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
    min-width: 190px;
    padding: 8px;
    z-index: 10;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .menu-panel button {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 10px;
    border-radius: 8px;
    background: transparent;
    color: #c1c2c5;
    font-size: 0.85rem;
    transition: background 0.2s;
    text-align: left;
  }

  .menu-panel button:hover {
    background: #25262b;
  }

  .menu-panel button.danger {
    color: #fa5252;
  }

  .restore-hint {
    margin: 8px 20px 0;
    font-size: 0.75rem;
    color: #909296;
  }

  /* Card Content */
  .card-content {
    background: #141517;
  }

  .tabs-list {
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .tab-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 12px;
    border-radius: 8px;
    transition: all 0.2s;
    position: relative;
  }

  .tab-row:hover {
    background: #1a1b1e;
  }

  .tab-favicon {
    flex-shrink: 0;
    width: 20px;
    height: 20px;
    border-radius: 4px;
    overflow: hidden;
    background: #25262b;
  }

  .tab-favicon img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .tab-info {
    flex: 1;
    min-width: 0;
    text-decoration: none;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .tab-title {
    color: #c1c2c5;
    font-size: 0.875rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .tab-url {
    color: #5c5f66;
    font-size: 0.75rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .tab-info:hover .tab-title {
    color: #e4e4e7;
  }

  .remove-tab {
    flex-shrink: 0;
    background: transparent;
    border: none;
    color: #3c3e44;
    cursor: pointer;
    padding: 6px 8px;
    border-radius: 6px;
    opacity: 0;
    transition: all 0.2s;
  }

  .tab-row:hover .remove-tab {
    opacity: 1;
  }

  .remove-tab:hover {
    background: rgba(250, 82, 82, 0.1);
    color: #fa5252;
  }

  /* Card Footer */
  .card-footer {
    padding: 16px 20px;
    border-top: 1px solid #2c2e33;
    background: #141517;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .tags-container {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .tag {
    background: #25262b;
    color: #909296;
    padding: 6px 12px;
    border-radius: 8px;
    font-size: 0.8125rem;
    font-weight: 500;
    border: 1px solid #2c2e33;
    transition: all 0.2s;
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .tag:hover {
    background: #2c2e33;
    color: #c1c2c5;
    border-color: #3c3e44;
  }

  .tag.muted {
    opacity: 0.7;
  }

  .remove-tag {
    background: transparent;
    border: none;
    color: #5c5f66;
    padding: 0;
    display: flex;
    align-items: center;
  }

  .remove-tag:hover {
    color: #fa5252;
  }

  /* Quick Preview */
  .quick-preview {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 16px 20px;
    background: #141517;
    border-top: 1px solid #2c2e33;
  }

  .preview-favicon {
    width: 24px;
    height: 24px;
    border-radius: 6px;
    overflow: hidden;
    background: #25262b;
    border: 1px solid #2c2e33;
  }

  .preview-favicon img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .preview-more {
    font-size: 0.75rem;
    color: #5c5f66;
    font-weight: 600;
    margin-left: 4px;
  }

  /* Responsive */
  @media (max-width: 1200px) {
    .lists-grid {
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    }
  }

  @media (max-width: 768px) {
    .lists-container {
      padding: 20px 16px;
    }

    .lists-grid {
      grid-template-columns: 1fr;
    }

    .view-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 16px;
    }
  }
</style>
````

## File: src/background/installedEventHandler.js
````javascript
import __ from '../common/i18n'

const installedEventHandler = detail => {
  if (DEBUG) return
  if (detail.reason === chrome.runtime.OnInstalledReason.UPDATE) {
    const updatedNotificationId = 'updated'
    chrome.notifications.onClicked.addListener(id => {
      if (id === updatedNotificationId) {
        chrome.tabs.create({ url: 'https://github.com/elijahcommits/icetab/blob/master/CHANGELOG.md' })
      }
    })
    chrome.notifications.create(updatedNotificationId, {
      type: 'basic',
      iconUrl: 'assets/icons/icon128.png',
      title: __('ui_updated_to_ver') + ' v' + chrome.runtime.getManifest().version,
      message: __('ui_click_view_changelog'),
    })
    setTimeout(() => {
      chrome.notifications.clear(updatedNotificationId)
    }, 5000)
  }
}

export default installedEventHandler
````

## File: src/common/constants.js
````javascript
export const COLORS = [
  '', 'red', 'pink', 'purple',
  'indigo', 'blue', 'cyan', 'teal',
  'green', 'yellow', 'orange', 'brown',
]

export const ILLEGAL_URLS = ['about:', 'chrome:', 'file:', 'wss:', 'ws:']

export const PICKED_TAB_PROPS = ['url', 'title', 'favIconUrl', 'pinned']
export const PICKED_LIST_RPOPS = ['_id', 'tabs', 'title', 'tags', 'category', 'time', 'pinned', 'expand', 'color', 'updatedAt']
export const SYNCED_LIST_PROPS = ['_id', 'tabs', 'title', 'tags', 'category', 'time', 'pinned', 'color', 'updatedAt']

export const TOKEN_KEY = 'token'
export const AUTH_HEADER = 'auth'

export const END_FRONT = 'front'
export const END_BACKGROUND = 'background'

export const SYNC_SERVICE_URL = DEBUG ? 'http://127.0.0.1:8000' : 'https://boss.cnwangjie.com'
export const SYNC_MAX_INTERVAL = 864e5
export const SYNC_MIN_INTERVAL = 3e5

export const SYNC_PHASES = {
  IDLE: 'idle',
  SYNCING: 'syncing',
  SYNCED: 'synced',
  AUTH_ERROR: 'auth-error',
  OFFLINE: 'offline',
  SERVER_ERROR: 'server-error',
  NEVER_SYNCED: 'never-synced',
  LOCAL_ONLY: 'local-only',
}

export const ADD_LIST = 'addList'
export const UPDATE_LIST_BY_ID = 'updateListById'
export const REMOVE_LIST_BY_ID = 'removeListById'
export const CHANGE_LIST_ORDER = 'changeListOrderRelatively'

export const SENTRY_DSN = 'https://3a924dd322e24dbca1c28364de767ffc@sentry.io/1307154'

export const RUNTIME_MESSAGES = {
  STASH_CURRENT_TAB: 'STASH_CURRENT_TAB',
  STASH_COMPLETED: 'STASH_COMPLETED',
  STASH_FAILED: 'STASH_FAILED',
}
````

## File: src/common/listManager.js
````javascript
import {
  SYNCED_LIST_PROPS,
  END_FRONT,
  END_BACKGROUND,
  ADD_LIST,
  UPDATE_LIST_BY_ID,
  REMOVE_LIST_BY_ID,
  CHANGE_LIST_ORDER,
} from './constants'
import {isBackground, sendMessage, Mutex} from './utils'

const cache = { lists: null, ops: null }
const RWLock = new Mutex()
const getStorage = async () => {
  const unlockRW = await RWLock.lock()
  if (cache.lists && cache.ops) return cache
  const {lists, ops} = await chrome.storage.local.get(['lists', 'ops'])
  cache.lists = lists || []
  cache.ops = ops || []
  await unlockRW()
  return cache
}
const compressOps = ops => {
  console.debug('[listManager] compress ops: (before)', ops)
  const removed = []
  const updated = {}
  const finalOps = []
  for (let i = ops.length - 1; i > -1; i -= 1) {
    const op = ops[i]
    // ignore all actions for the list if that list will be removed finally
    if (op.args && op.args[0] && removed.includes(op.args[0]._id)
      || typeof op.args[0] === 'string' && removed.includes(op.args[0])) continue

    if (op.method === 'removeListById') {
      removed.push(op.args[0])
      finalOps.unshift(op)
    } else if (op.method === 'updateListById') {
      // keep the final result of every property if a list will be updated
      const [listId, newList, time] = op.args
      if (updated[listId]) {
        for (const key in newList) {
          if (key in updated[listId]) continue
          updated[listId][key] = newList[key]
        }
        continue
      } else {
        updated[listId] = Object.assign({}, newList)
        finalOps.unshift({method: 'updateListById', args: [listId, updated[listId], time]})
      }
    } else if (op.method === 'changeListOrderRelatively') {
      // combine the value if a list is reordered continuously
      if (i > 0 && ops[i - 1].method === 'changeListOrderRelatively' && op.args[0] === ops[i - 1].args[0]) {
        ops[i - 1].args[1] += ops[i].args[1]
      } else finalOps.unshift(op)
    } else {
      // do nothing if add a list
      finalOps.unshift(op)
    }
  }
  console.debug('[listManager] compress ops: (after)', finalOps)
  return finalOps
}

const manager = {}
// lists modifier (return true if need to add ops)
manager.modifiers = {
  [ADD_LIST](lists, [list]) {
    if (~lists.findIndex(i => i._id === list._id)) return
    lists.unshift(list)
    return [list]
  },
  [UPDATE_LIST_BY_ID](lists, [listId, newList, time = Date.now()]) {
    const normal = Object.keys(newList).some(k => SYNCED_LIST_PROPS.includes(k))
    for (let i = 0; i < lists.length; i += 1) {
      if (lists[i]._id !== listId) continue
      const list = lists[i]
      for (const [k, v] of Object.entries(newList)) {
        list[k] = v
      }
      if (normal) list.updatedAt = time
      return normal ? [listId, newList, time] : null
    }
  },
  [REMOVE_LIST_BY_ID](lists, [listId]) {
    const index = lists.findIndex(list => list._id === listId)
    lists.splice(index, 1)
    return [listId]
  },
  [CHANGE_LIST_ORDER](lists, [listId, diff]) {
    const index = lists.findIndex(list => list._id === listId)
    const [list] = lists.splice(index, 1)
    lists.splice(index + diff, 0, list)
    return [listId, diff]
  },
}

// use myself throttle function to replace Lodash.throttle to make sure
// this function cannot be executed concurrently
const saveStorage = async (lists, ops) => {
  const unlock = await RWLock.lock()
  const data = {
    lists,
    ops: compressOps(ops)
  }
  await chrome.storage.local.set(data)
  cache.lists = cache.ops = null
  await sendMessage({refresh: true})
  await unlock()
}
// avoid getting storage at the same time
const _modifyQueue = []
const _startModifyWork = (lists, ops) => new Promise(resolve => {
  while (_modifyQueue.length) {
    const [method, args] = _modifyQueue.shift()
    const opArgs = manager.modifiers[method](lists, args)
    if (opArgs) ops.push({method, args: opArgs, time: Date.now()})
  }
  setTimeout(() => {
    if (_modifyQueue.length) _startModifyWork(lists, ops).then(resolve)
    else resolve()
  }, 100)
})

let _working = false
const applyChangesToStorage = async (method, args) => {
  _modifyQueue.push([method, args])
  // not need to start work if modify work is processing
  if (_working) return
  _working = true
  const {lists, ops} = await getStorage()
  await _startModifyWork(lists, ops)
  // from here won't modify data if do not call start function
  _working = false
  await saveStorage(lists, ops)
}
const addEventListener = (receiveFrom, callback) => chrome.runtime.onMessage.addListener(({listModifed, from}) => {
  if (receiveFrom !== from || !listModifed) return
  const {method, args} = listModifed
  return callback(method, args)
})
const genMethods = isBackground => {
  Object.keys(manager.modifiers).forEach(method => {
    manager[method] = isBackground ? async (...args) => { // for background
      console.debug('[list manager] modify list:', method, ...args)
      await sendMessage({listModifed: {method, args}, from: END_BACKGROUND})
      // no need to await changes applied for close tabs immediately
      applyChangesToStorage(method, args)
    } : async (...args) => { // for front end
      console.debug('[list manager] call to modify list:', name, ...args)
      await sendMessage({listModifed: {method, args}, from: END_FRONT})
    }
  })
}
manager.init = async () => {
  if (manager.inited) return
  manager.inited = true
  const _isBackground = await isBackground()
  if (_isBackground) await addEventListener(END_FRONT, applyChangesToStorage)
  genMethods(_isBackground)
}
manager.mapMutations = () => {
  const mutations = {}
  Object.entries(manager.modifiers).forEach(([method, fn]) => {
    mutations[method] = (state, payload) => fn(state.lists, payload)
  })
  mutations.receiveData = (state, {method, args}) => {
    manager.modifiers[method](state.lists, args)
  }
  return mutations
}
manager.createVuexPlugin = () => store => {
  addEventListener(END_BACKGROUND, (method, args) => {
    store.commit('receiveData', {method, args})
  })
  chrome.runtime.onMessage.addListener(({refreshed}) => {
    if (refreshed && refreshed.success) store.dispatch('getLists')
  })
  store.subscribe(({type, payload}) => {
    if (type in manager.modifiers) {
      manager[type](...payload)
    }
  })
}
manager.RWLock = RWLock
manager.isWorking = () => _working
export default manager
````

## File: src/common/options.js
````javascript
import _ from 'lodash'
import __ from '@/common/i18n'

const cate = {
  BEHAVIOUR: 'behaviour',
  APPEARANCE: 'appearance',
  PERFOREMANCE: 'performance',
}

export const getOptionsList = () => [
  {
    cate: cate.BEHAVIOUR,
    name: 'browserAction',
    type: String,
    default: 'show-list',
    items: [
      {
        value: 'popup',
        label: __('opt_label_popup'),
      },
      {
        value: 'store-selected',
        label: __('opt_label_store_selected'),
      },
      {
        value: 'store-all',
        label: __('opt_label_store_all'),
      },
      {
        value: 'show-list',
        label: __('opt_label_show_list'),
      },
      {
        value: 'none',
        label: __('opt_label_none'),
      },
    ],
  },
  {
    cate: cate.BEHAVIOUR,
    name: 'itemClickAction',
    type: String,
    default: 'open-and-remove',
    items: [
      {
        value: 'open-and-remove',
        label: __('opt_label_open_and_remove'),
      },
      {
        value: 'open',
        label: __('opt_label_open'),
      },
      {
        value: 'none',
        label: __('opt_label_none'),
      },
    ],
  },
  {
    cate: cate.BEHAVIOUR,
    name: 'popupItemClickAction',
    type: String,
    default: 'restore',
    items: [
      {
        value: 'restore',
        label: __('opt_label_restore'),
      },
      {
        value: 'restore-new-window',
        label: __('opt_label_restore_new_window'),
      },
      {
        value: 'none',
        label: __('opt_label_none'),
      },
    ],
  },
  {
    cate: cate.APPEARANCE,
    name: 'removeItemBtnPos',
    type: String,
    default: 'left',
    items: [
      {
        value: 'left',
        label: __('opt_label_left'),
      },
      {
        value: 'right',
        label: __('opt_label_right'),
      },
    ],
    deprecated: '1.4',
  },
  {
    cate: cate.APPEARANCE,
    name: 'defaultNightMode',
    type: Boolean,
    default: false,
  },
  {
    cate: cate.APPEARANCE,
    name: 'itemDisplay',
    type: String,
    default: 'title-and-url',
    items: [
      {
        value: 'title-and-url',
        label: __('opt_label_title_and_url'),
      },
      {
        value: 'title',
        label: __('opt_label_title'),
      },
      {
        value: 'url',
        label: __('opt_label_url'),
      },
    ],
  },
  {
    cate: cate.APPEARANCE,
    name: 'hideFavicon',
    type: Boolean,
    default: false,
  },
  {
    cate: cate.APPEARANCE,
    name: 'fixedToolbar',
    type: Boolean,
    default: false,
    deprecated: '1.4',
  },
  {
    cate: cate.BEHAVIOUR,
    name: 'addHistory',
    type: Boolean,
    default: true,
  },
  {
    cate: cate.BEHAVIOUR,
    name: 'ignorePinned',
    type: Boolean,
    default: false,
  },
  {
    cate: cate.BEHAVIOUR,
    name: 'pinNewList',
    type: Boolean,
    default: false,
  },
  {
    cate: cate.BEHAVIOUR,
    name: 'pageContext',
    type: Boolean,
    default: true,
  },
  {
    cate: cate.BEHAVIOUR,
    name: 'allContext',
    type: Boolean,
    default: false,
    deps: ({ pageContext }) => pageContext,
    new: '1.3.6',
  },
  {
    cate: cate.BEHAVIOUR,
    name: 'openTabListWhenNewTab',
    desc: true,
    deps: ({ disableDynamicMenu }) => !disableDynamicMenu,
    type: Boolean,
    default: false,
  },
  {
    cate: cate.BEHAVIOUR,
    name: 'alertRemoveList',
    type: Boolean,
    default: false,
  },
  {
    cate: cate.BEHAVIOUR,
    name: 'excludeIllegalURL',
    type: Boolean,
    default: true,
    new: '1.3.6',
  },
  {
    cate: cate.BEHAVIOUR,
    name: 'removeDuplicate',
    type: Boolean,
    default: false,
    new: '1.3.6',
  },
  // START - Comment out Boss sync options
  /*
  {
    cate: cate.BEHAVIOUR,
    name: 'useBoss',
    type: Boolean,
    default: false,
    new: '1.3.0',
    desc: true,
  },
  */
  // END - Comment out Boss sync options
  {
    cate: cate.BEHAVIOUR,
    name: 'syncBaseUrl',
    type: String,
    default: 'http://localhost:8000',
    new: '1.4.1',
  },
  {
    cate: cate.BEHAVIOUR,
    name: 'syncApiKey',
    type: String,
    default: '',
    new: '1.4.1',
  },
  {
    cate: cate.BEHAVIOUR,
    name: 'autoSyncEnabled',
    type: Boolean,
    default: false,
    new: '1.4.1',
  },
  {
    cate: cate.BEHAVIOUR,
    name: 'autoSyncInterval',
    type: Number,
    default: 300,
    new: '1.4.1',
  },
  {
    cate: cate.APPEARANCE,
    name: 'enableSearch',
    type: Boolean,
    default: true,
    new: '1.3.7',
    deprecated: '1.4',
  },
  {
    cate: cate.BEHAVIOUR,
    name: 'openEnd',
    type: Boolean,
    default: true,
    new: '1.3.9',
  },
  {
    cate: cate.BEHAVIOUR,
    name: 'openTabListNoTab',
    type: Boolean,
    default: true,
    new: '1.4.0',
  },
  {
    cate: cate.APPEARANCE,
    name: 'listsPerPage',
    type: String,
    default: 10,
    items: [
      {
        value: 5,
        label: 5,
      },
      {
        value: 10,
        label: 10,
      },
      {
        value: 15,
        label: 15,
      },
    ],
    new: '1.4.0',
  },
  {
    cate: cate.APPEARANCE,
    name: 'titleFontSize',
    type: String,
    default: '12px',
    items: [
      {
        value: '12px',
        label: '12px',
      },
      {
        value: '18px',
        label: '18px',
      },
      {
        value: '24px',
        label: '24px',
      },
    ],
    new: '1.4.0',
  },
  {
    cate: cate.PERFOREMANCE,
    name: 'disableDynamicMenu',
    type: Boolean,
    default: false,
    new: '1.4.0',
  },
  {
    cate: cate.PERFOREMANCE,
    name: 'disableExpansion',
    type: Boolean,
    default: false,
    new: '1.4.0',
  },
  {
    cate: cate.PERFOREMANCE,
    name: 'disableTransition',
    type: Boolean,
    default: false,
    new: '1.4.0',
  },
  {
    cate: cate.PERFOREMANCE,
    name: 'disableSearch',
    type: Boolean,
    default: false,
    new: '1.4.0',
  },
].filter(i => !i.deprecated)

const _defaultOptions = _.mapValues(_.keyBy(getOptionsList(), 'name'), i => i.default)
const getDefaultOptions = () => _defaultOptions

export default { getDefaultOptions, getOptionsList }
````

## File: src/background/browserAction.js
````javascript
import tabs from '../common/tabs'

export const updateBrowserAction = async (action) => {
  if (action && action !== 'popup') {
    await chrome.action.setPopup({ popup: '' })
  } else {
    await chrome.action.setPopup({ popup: 'index.html?context=popup' })
  }
}

export const getBrowserActionHandler = (action) => {
  const handlers = {
    'store-selected': tabs.storeSelectedTabs,
    'store-all': tabs.storeAllTabs,
    'show-list': tabs.openlists,
  }
  return handlers[action] || null
}

export const getCoverBrowserAction = () => { }
````

## File: src/background/contextMenus.js
````javascript
import __ from '../common/i18n'
import options from '../common/options'
import tabs from '../common/tabs'

const MENU_ID_SAVE_TAB = 'send-to-tabsquirrel'

const chromeMenus = () => chrome?.contextMenus

const promisify = fn => new Promise(resolve => {
  try {
    fn(() => {
      // Intentionally swallow lastError to avoid crashing init flow.
      if (chrome.runtime?.lastError) {
        console.debug('[contextMenus] API warning:', chrome.runtime.lastError.message)
      }
      resolve()
    })
  } catch (error) {
    console.error('[contextMenus] API call failed:', error)
    resolve()
  }
})

const removeAllMenus = () => {
  const menus = chromeMenus()
  if (!menus) return Promise.resolve()
  return promisify(callback => menus.removeAll(callback))
}

const createMenuItem = details => {
  const menus = chromeMenus()
  if (!menus) return Promise.resolve()
  return promisify(callback => menus.create(details, callback))
}

const updateMenuEnabled = (id, enabled) => {
  const menus = chromeMenus()
  if (!menus) return Promise.resolve()
  return promisify(callback => menus.update(id, { enabled }, callback))
}

const resolveTab = async (tabFromEvent, info) => {
  if (tabFromEvent && tabFromEvent.id) return tabFromEvent
  if (!info?.tabId) return null
  try {
    return await chrome.tabs.get(info.tabId)
  } catch (error) {
    console.warn('[contextMenus] Unable to resolve tab from event:', error)
    return null
  }
}

export const handleContextMenuClicked = async (info, tab) => {
  if (info.menuItemId !== MENU_ID_SAVE_TAB) return
  const targetTab = await resolveTab(tab, info)
  if (!targetTab) return
  try {
    await tabs.storeCurrentTab(targetTab, 'context-menu')
  } catch (error) {
    console.error('[contextMenus] Failed to save tab from context menu:', error)
  }
}

export const dynamicDisableMenu = async () => {
  const menus = chromeMenus()
  if (!menus) return
  try {
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true })
    const enabled = Boolean(activeTab?.url && !activeTab.url.startsWith('chrome://') && !activeTab.url.startsWith('about:'))
    await updateMenuEnabled(MENU_ID_SAVE_TAB, enabled)
  } catch (error) {
    console.warn('[contextMenus] Unable to evaluate dynamic state:', error)
  }
}

export const setupContextMenus = async (opts = null) => {
  const menus = chromeMenus()
  if (!menus) {
    console.warn('[contextMenus] API unavailable; skipping setup')
    return
  }

  const defaultOptions = options.getDefaultOptions()
  const effectiveOpts = Object.assign({}, defaultOptions, opts || {})

  await removeAllMenus()

  if (!effectiveOpts.pageContext) return

  const contexts = effectiveOpts.allContext ? ['all'] : ['page']
  const title = __('menu_SAVE_TAB_TO_SPINE') || 'Save tab to IceTab'

  await createMenuItem({
    id: MENU_ID_SAVE_TAB,
    title,
    contexts,
  })

  await dynamicDisableMenu()
}

export default {
  setupContextMenus,
  dynamicDisableMenu,
  handleContextMenuClicked,
}
````

## File: src/_locales/de/messages.json
````json
{
   "cmd_open_lists": {
     "message":"IceTab"
   },
   "cmd_restore_lastest_list": {
     "message":"Letzte Tabs wiederherstellen"
   },
   "cmd_store_all_in_all_windows": {
     "message":"Speichere alle Tabs in allen Fenstern"
   },
   "cmd_store_all_tabs": {
     "message":"Speichere alle Tabs"
   },
   "cmd_store_selected_tabs": {
     "message":"Speichere die ausgewählten Tabs"
   },
   "ext_desc": {
     "message":"Ein besseres OneTab"
   },
   "ext_name": {
     "message":"IceTab"
   },
   "menu_EXTRA": {
     "message":"Extra"
   },
   "menu_SHOW_TAB_LIST": {
     "message":"Zeige die Tab-Liste"
   },
   "menu_STORE": {
     "message":"Speichern"
   },
   "menu_STORE_ALL_TABS_IN_ALL_WINDOWS": {
     "message":"Speichere alle Tabs in allen Fenstern"
   },
   "menu_STORE_ALL_TABS_IN_CURRENT_WINDOW": {
     "message":"Speichere alle Tabs im aktuellen Fenster"
   },
   "menu_STORE_LEFT_TABS": {
     "message":"Speichere die linken Tabs"
   },
   "menu_STORE_RIGHT_TABS": {
     "message":"Speichere die rechten Tabs"
   },
   "menu_STORE_SELECTED_TABS": {
     "message":"Speichere ausgewählte Tabs"
   },
  "menu_STORE_TO_TITLED_LIST": {
    "message":"Speichere in benannte Liste"
  },
  "menu_SAVE_TAB_TO_SPINE": {
    "message":"Tab in IceTab speichern"
  },
  "menu_STORE_TWOSIDE_TABS": {
    "message":"Speichere nicht ausgewählte Tabs"
   },
   "opt_desc_openTabListWhenNewTab": {
     "message":"Öffne die Registerkartenliste immer beim Klicken auf das Symbol, wenn die aktuelle Registerkarte eine neue Registerkarte ist. (Funktioniert nicht, wenn das Verhalten auf \"einfache Popup-Liste\" eingestellt ist."
   },
   "opt_label_left": {
     "message":"Links"
   },
   "opt_label_none": {
     "message":"Keine"
   },
   "opt_label_open": {
     "message":"Öffnen"
   },
   "opt_label_open_and_remove": {
     "message":"Öffnen und Entfernen"
   },
   "opt_label_popup": {
     "message":"Einfache Popup Liste"
   },
   "opt_label_restore": {
     "message":"Wiederherstellen"
   },
   "opt_label_restore_new_window": {
     "message":"Wiederherstellen in neuem Fenster"
   },
   "opt_label_right": {
     "message":"Rechts"
   },
   "opt_label_show_list": {
     "message":"Zeige Liste"
   },
   "opt_label_store_all": {
     "message":"Speichere alle Tabs im aktuellen Fenster"
   },
   "opt_label_store_selected": {
     "message":"Speichere ausgewählte Tabs"
   },
   "opt_label_title": {
     "message":"Titel"
   },
   "opt_label_title_and_url": {
     "message":"Titel und URL"
   },
   "opt_label_url": {
     "message":"URL"
   },
   "opt_name_addHistory": {
     "message":"Gespeicherten Tab zum Verlauf hinzufügen"
   },
   "opt_name_alertRemoveList": {
     "message":"Bestätigen, um die Liste zu entfernen"
   },
   "opt_name_allContext": {
     "message":"Kontextmenü für alle Elemente aktivieren"
   },
   "opt_name_browserAction": {
     "message":"Verhalten beim Anklicken des Symbols"
   },
   "opt_name_defaultNightMode": {
     "message":"Nachtmodus standardmäßig verwenden"
   },
   "opt_name_disableDynamicMenu": {
     "message":"Aktualisierung dynamischer Menüs deaktivieren"
   },
   "opt_name_disableExpansion": {
     "message":"Aufklappen in der Listenseite deaktivieren"
   },
   "opt_name_disableSearch": {
     "message":"Suchfunktion deaktivieren"
   },
   "opt_name_disableTransition": {
     "message":"Alle CSS-Übergangsanimationen deaktivieren"
   },
   "opt_name_enableSearch": {
     "message":"Suche auf der detaillierten Listenseite aktivieren"
   },
   "opt_name_excludeIllegalURL": {
     "message":"Ausschließen illegaler URLs wie about:* oder chrome://*"
   },
   "opt_name_fixedToolbar": {
     "message":"Feste Symbolleiste"
   },
   "opt_name_hideFavicon": {
     "message":"Favicon von Elementen in der Liste ausblenden"
   },
   "opt_name_ignorePinned": {
     "message":"Angepinnte Tabs nicht speichern"
   },
   "opt_name_itemClickAction": {
     "message":"Verhalten beim Anklicken von Elementen in einer Liste"
   },
   "opt_name_itemDisplay": {
     "message":"Inhalt der Elemente in einer Liste"
   },
   "opt_name_listsPerPage": {
     "message":"Anzahl der Listen pro Seite"
   },
   "opt_name_openEnd": {
     "message":"Wenn die Wiederherstellungsliste am Ende der Registerkarten geöffnet ist"
   },
   "opt_name_openTabListNoTab": {
     "message":"Die Tab-Liste öffen, beim Speichern aller Registerkarten"
   },
   "opt_name_openTabListWhenNewTab": {
     "message":"Die Tab-Liste bei neuem Tab öffen"
   },
   "opt_name_pageContext": {
     "message":"Kontextmenü für die Seite aktivieren"
   },
   "opt_name_pinNewList": {
     "message":"Neue Liste automatisch anheften"
   },
   "opt_name_popupItemClickAction": {
     "message":"Verhalten beim Anklicken von Elementen in der einfachen Liste"
   },
   "opt_name_removeDuplicate": {
     "message":"Duplikat in einer Liste entfernen"
   },
   "opt_name_removeItemBtnPos": {
     "message":"Die Position der Schaltfläche zum Entfernen von Elementen"
   },
   "opt_name_titleFontSize": {
     "message":"Schriftgröße des Listentitels"
   },
   "ui_nightmode": {
     "message":"Nacht-Modus"
   },
   "ui_tab": {
     "message":"Tabs"
   },
   "ui_created": {
     "message":"angelegt"
   },
   "ui_retitle_list": {
     "message":"Liste umbenennen"
   },
   "ui_restore_all": {
     "message":"Liste wiederherstellen"
   },
   "ui_restore_all_in_new_window": {
     "message":"Alle in neuem Fenster wiederherstellen"
   },
   "ui_remove_list": {
     "message":"Liste entfernen"
   },
   "ui_pin": {
     "message":"Pin"
   },
   "ui_unpin": {
     "message":"Abpinnen"
   },
   "ui_list": {
     "message":"Liste"
   },
   "ui_pinned": {
     "message":"Angepinnt"
   },
   "ui_duplicate": {
     "message":"Duplizieren"
   },
   "ui_copy_link": {
     "message":"Link kopieren"
   },
   "ui_copy_title": {
     "message":"Titel kopieren"
   },
   "ui_remove": {
     "message":"Entfernen"
   },
   "ui_open": {
     "message":"Öffnen"
   },
   "ui_create_issue": {
     "message":"Ein Problem erstellen"
   },
   "ui_options": {
     "message":"Optionen"
   },
   "ui_options_appearance": {
     "message":"Aussehen"
   },
   "ui_options_behaviour": {
     "message":"Verhalten"
   },
   "ui_options_performance": {
     "message":"Leistung"
   },
   "ui_options_sync": {
     "message":"Syncronisierung"
   },
   "ui_about": {
     "message":"Über"
   },
   "ui_keyboard_shortcuts": {
     "message":"Tastenkombinationen"
   },
   "ui_export_import": {
     "message":"Export / Import"
   },
   "ui_github": {
     "message":"Github"
   },
   "ui_tab_list": {
     "message":"Tab-Listen"
   },
   "ui_export": {
     "message":"Exportieren"
   },
   "ui_import": {
     "message":"Import"
   },
   "ui_export_comp": {
     "message":"Export (OneTab kompatibel)"
   },
   "ui_export_json": {
     "message":"Export im JSON Format"
   },
   "ui_save_as_file": {
     "message":"Als Datei speichern"
   },
   "ui_copy": {
     "message":"Kopieren"
   },
   "ui_copied": {
     "message":"Kopiert!"
   },
   "ui_import_from_file": {
     "message":"Import von Datei"
   },
   "ui_import_comp": {
     "message":"Import (OneTab kompatibel)"
   },
   "ui_import_json": {
     "message":"Import von JSON Datei"
   },
   "ui_main_processing": {
     "message":"Verarbeitung....."
   },
   "ui_main_error_occurred": {
     "message":"Einige Fehler sind aufgetreten"
   },
   "ui_main_succeeded": {
     "message":"erfolgreich!"
   },
   "ui_opt_changes_saved": {
     "message":"Änderungen gespeichert!"
   },
   "ui_title_down_btn": {
     "message":"Liste nach unten verschieben"
   },
   "ui_title_pin_btn": {
     "message":"Liste anpinnen"
   },
   "ui_title_up_btn": {
     "message":"Liste nach oben verschieben"
   },
   "ui_save_to_gdrive": {
     "message":"Liste auf Google-Drive speichern"
   },
   "ui_save_immediately": {
     "message":"Sofort speichern"
   },
   "ui_no_list": {
     "message":"Keine Liste hier"
   },
   "ui_no_list_tip": {
     "message":"1. Wählen Sie die Registerkarten aus, die Sie speichern möchten\u003C/br>2. Klicken Sie mit der rechten Maustaste auf das Erweiterungssymbol\u003C/br>3. Klicken Sie auf \"ausgewählte Registerkarten speichern\"\u003Cp class=\"body-2\">Bereits in anderen Geräten verwendet?  Die Autorisierung mit dem Synchronisierungsdienst kann die Listen automatisch wiederherstellen.\u003C/p>"
   },
   "ui_untitled": {
     "message":"Unbenannt"
   },
   "ui_updated_to_ver": {
     "message":"IceTab wurde aktualisiert zu"
   },
   "ui_click_view_changelog": {
     "message":"Klicken Sie hier, um das Änderungsprotokoll anzuzeigen"
   },
   "ui_move_to": {
     "message":"Verschieben nach"
   },
   "ui_a_new_list": {
     "message":"(eine neue Liste)"
   }
}
````

## File: src/app/router/index.js
````javascript
// src/app/router/index.js
import Vue from 'vue'
import Router from 'vue-router'
const Popup = () => import(/* webpackChunkName: "popup" */ '@/app/page/Popup')
const Main = () => import(/* webpackChunkName: "main" */ '@/app/page/Main')
// const SyncInfo = () => import(/* webpackChunkName: "main" */ '@/app/page/main/SyncInfo')
const Options = () => import(/* webpackChunkName: "main" */ '@/app/page/main/Options')
const About = () => import(/* webpackChunkName: "main" */ '@/app/page/main/About')
const ImportExport = () => import(/* webpackChunkName: "main" */ '@/app/page/main/ImportExport')
const Search = () => import(/* webpackChunkName: "main" */ '@/app/page/main/Search')
const DetailList = () => import(/* webpackChunkName: "main" */ '@/app/page/main/DetailList')

Vue.use(Router)

// Remove this unused variable:
// const isPopup = new URLSearchParams(window.location.search).get('context') === 'popup'

const router = new Router({
  routes: [
    {
      path: '/',
      // When in a popup, go directly to the detailed list view.
      redirect: () => {
        const isPopup = new URLSearchParams(window.location.search).get('context') === 'popup'
        return isPopup ? '/app/list' : '/app'
      }
    },
    {
      path: '/popup',
      component: Popup,
      name: 'popup',
    },
    {
      path: '/app',
      component: Main,
      children: [
        // {
        //   path: 'options/sync',
        //   component: SyncInfo,
        //   name: 'syncInfo',
        // },
        {
          path: 'options',
          component: Options,
          name: 'options',
        },
        {
          path: 'about',
          component: About,
          name: 'about',
        },
        {
          path: 'import-export',
          component: ImportExport,
          name: 'import-export',
        },
        {
          path: 'search',
          component: Search,
          name: 'search',
        },
        {
          path: 'list',
          component: DetailList,
          name: 'detailList',
        },
        {
          path: 'list/pinned',
          component: DetailList,
          name: 'pinnedList',
        },
        {
          path: 'list/tag/:tag',
          component: DetailList,
          name: 'taggedList'
        },
        {
          path: '*',
          redirect: { name: 'detailList' }
        },
      ],
    },
  ]
})

export default router
````

## File: src/app/store/lists.js
````javascript
import Vue from 'vue'
import _ from 'lodash'
import __ from '@/common/i18n'
import { normalizeTab } from '@/common/tab'
import { formatTime } from '@/common/utils'
import storage from '@/common/storage'
import { validateList } from '@/common/list'
import listManager from '@/common/listManager'
import tabManager from '@/common/tabs'
import {
  UPDATE_LIST_BY_ID,
  REMOVE_LIST_BY_ID,
  CHANGE_LIST_ORDER,
} from '@/common/constants'

export default {
  state: {
    lists: [],
    loaded: false,
  },
  getters: {
    indexedLists(state) {
      return state.lists.map((list, index) => Object.assign({}, list, { index }))
    },
    inPageLists(state) {
      return (page, lists) => lists.slice(
        (page - 1) * state.opts.listsPerPage,
        page * state.opts.listsPerPage,
      )
    },
    listColors(state) {
      const colors = new Set()
      state.lists.forEach(list => {
        colors.add(list.color || '')
      })
      return Array.from(colors)
    },
    taggedList(state, getters) {
      const tags = {}
      getters.indexedLists.forEach(list => {
        if (list.tags) {
          list.tags.forEach(tag => {
            tags[tag] = tags[tag] || []
            tags[tag].push(list)
          })
        }
      })
      const sorted = {}
      Object.keys(tags).sort().forEach(k => { sorted[k] = tags[k] })
      return sorted
    },
    pinnedList(state, getters) {
      return getters.indexedLists.filter(list => list.pinned)
    },
    titledList(state, getters) {
      return getters.indexedLists.filter(list => list.title)
    },
    getPageLength(state) {
      return size => Math.ceil(size / state.opts.listsPerPage)
    },
  },
  mutations: {
    ...listManager.mapMutations(),
    setLists(state, lists) {
      state.lists = lists.filter(validateList)
    },
    setTitle(state, [listIndex, title]) {
      state.lists[listIndex].title = title
    },
    openChangeTitle(state, listIndex) {
      Vue.set(state.lists[listIndex], 'titleEditing', true)
    },
    closeChangeTitle(state, listIndex) {
      Vue.set(state.lists[listIndex], 'titleEditing', false)
    },
    setPinned(state, [listIndex, pinned]) {
      Vue.set(state.lists[listIndex], 'pinned', pinned)
    },
    showAll(state, listIndex) {
      Vue.set(state.lists[listIndex], 'showAll', true)
    },
    swapListItem(state, [a, b]) {
      const tmp = state.lists[a]
      Vue.set(state.lists, a, state.lists[b])
      Vue.set(state.lists, b, tmp)
    },
    setExpand(state, [listIndex, expand]) {
      Vue.set(state.lists[listIndex], 'expand', expand)
    },
    setColor(state, [listIndex, color]) {
      Vue.set(state.lists[listIndex], 'color', color)
    },
    loaded(state) {
      state.loaded = true
    },
    tabSelected(state, [listIndex, tabIndex, selected]) {
      Vue.set(state.lists[listIndex].tabs[tabIndex], 'selected', selected)
    },
    removeTabDirectly(state, [listIndex, tabIndex]) {
      state.lists[listIndex].tabs.splice(tabIndex, 1)
    },
    setTabs(state, [listIndex, tabs]) {
      state.lists[listIndex].tabs = tabs
    },
    addTab(state, [listIndex, tab]) {
      state.lists[listIndex].tabs.push(normalizeTab(tab))
    },
    setTags(state, [listIndex, tags]) {
      Vue.set(state.lists[listIndex], 'tags', tags)
    },
    setCategory(state, [listIndex, category]) {
      Vue.set(state.lists[listIndex], 'category', category)
    },
  },
  actions: {
    preloadLists({ dispatch, commit, state }) {
      if (state.loaded) return
      commit('loaded')
      return dispatch('getLists')
    },
    async getLists({ commit }) {
      const lists = await storage.getLists()
      if (lists) commit('setLists', lists)
    },
    itemClicked({ dispatch, state }, [listIndex, tabIndex]) {
      const action = state.opts.itemClickAction
      if (action === 'open-and-remove') {
        setTimeout(() => {
          dispatch('removeTab', [listIndex, tabIndex])
        }, 0)
      }
    },
    removeList({ commit, state }, listIndex) {
      const list = state.lists[listIndex]
      if ((list.tabs.length !== 0) && state.opts.alertRemoveList && !confirm(`${__('ui_remove_list')}:
        [${list.tabs.length}] ${list.title || __('ui_untitled')}
        ${__('ui_created')} ${formatTime(list.time)}`)) return
      commit(REMOVE_LIST_BY_ID, [list._id])
    },
    removeTab({ commit, state, dispatch }, [listIndex, tabIndex]) {
      const list = state.lists[listIndex]
      const tabs = list.tabs.slice()
      tabs.splice(tabIndex, 1)
      if (tabs.length === 0) dispatch('removeList', listIndex)
      else commit(UPDATE_LIST_BY_ID, [list._id, { tabs }])
    },
    restoreList({ state, dispatch }, [listIndex, inNewWindow = false]) {
      const list = state.lists[listIndex]
      if (inNewWindow) tabManager.restoreListInNewWindow(list)
      else tabManager.restoreList(list)
      if (list.pinned) return
      dispatch('removeList', listIndex)
    },
    saveTitle({ commit, state }, listIndex) {
      const list = state.lists[listIndex]
      if (!list.titleEditing) return
      commit('closeChangeTitle', listIndex)
      commit(UPDATE_LIST_BY_ID, [list._id, _.pick(list, 'title')])
    },
    pinList({ commit, state }, [listIndex, pinned = true]) {
      const list = state.lists[listIndex]
      commit('setPinned', [listIndex, pinned])
      commit(UPDATE_LIST_BY_ID, [list._id, { pinned }])
    },
    swapListItem({ commit, state }, [a, b]) {
      const list = state.lists[a]
      commit(CHANGE_LIST_ORDER, [list._id, b - a])
    },
    moveListUp({ dispatch }, listIndex) {
      if (listIndex === 0) return
      dispatch('swapListItem', [listIndex, listIndex - 1])
    },
    moveListDown({ dispatch, state }, listIndex) {
      if (listIndex === state.lists.length - 1) return
      dispatch('swapListItem', [listIndex, listIndex + 1])
    },
    expandList({ commit, state }, [expand, listIndex]) {
      const list = state.lists[listIndex]
      if (list.expand === expand) return
      commit('setExpand', [listIndex, expand])
      commit(UPDATE_LIST_BY_ID, [list._id, { expand }])
    },
    changeColor({ commit, state }, [listIndex, color]) {
      const list = state.lists[listIndex]
      commit('setColor', [listIndex, color])
      commit(UPDATE_LIST_BY_ID, [list._id, { color }])
    },
    tabMoved({ commit, state }, changedLists) {
      // judge last list firstly in order to avoid list index changed
      _.uniq(changedLists).sort((a, b) => b - a).forEach(listIndex => {
        const list = state.lists[listIndex]
        if (list.tabs.length === 0) commit(REMOVE_LIST_BY_ID, [list._id])
        else commit(UPDATE_LIST_BY_ID, [list._id, _.pick(list, 'tabs')])
      })
    },
    setTags({ commit, state }, [listIndex, tags]) {
      const list = state.lists[listIndex]
      commit('setTags', [listIndex, tags])
      commit(UPDATE_LIST_BY_ID, [list._id, { tags }])
    },
    setCategory({ commit, state }, [listIndex, category]) {
      const list = state.lists[listIndex]
      commit('setCategory', [listIndex, category])
      commit(UPDATE_LIST_BY_ID, [list._id, { category }])
    },
  },

}
````

## File: src/app/store/syncStore.svelte.js
````javascript
import browser from 'webextension-polyfill'
import CustomSync, { SyncError } from '@/common/service/custom-sync'
import storage from '@/common/storage'
import { createNewTabList } from '@/common/list'
import { SYNC_PHASES, RUNTIME_MESSAGES } from '@/common/constants'
import { logSyncEvent } from '@/common/sync-logger'
import tabsHelper from '@/common/tabs'
import manager from './bridge'
import _ from 'lodash'

const RETRY_DELAY = 10000

const getListTimestamp = list => list?.updatedAt || list?.time || 0
const buildSignature = lists => (lists || []).map(list => `${list._id}:${getListTimestamp(list)}:${list.tabs?.length || 0}`).join('|')
const computeVersion = lists => (lists || []).reduce((acc, list) => Math.max(acc, getListTimestamp(list)), 0)
const parseRemoteVersion = value => {
  if (!value) return 0
  if (typeof value === 'number') return value
  const parsed = Date.parse(value)
  return Number.isNaN(parsed) ? 0 : parsed
}

const mapRemoteList = remote =>
  createNewTabList({
    _id: remote.remote_id,
    title: remote.title,
    tabs: remote.tabs || [],
    tags: remote.tags || [],
    category: remote.category || '',
    time: remote.time || Date.now(),
    pinned: remote.pinned,
    color: remote.color || '',
    updatedAt: remote.updated_at || remote.time || Date.now(),
  })

let pendingPayload = null
let retryTimer = null
let autoSyncTimer = null

const isAutoSyncEnabled = opts => opts?.autoSyncEnabled !== false
const getAutoSyncIntervalMs = opts => {
  const intervalSeconds = Number(opts?.autoSyncInterval)
  if (!Number.isFinite(intervalSeconds) || intervalSeconds <= 0) return null
  return intervalSeconds * 1000
}

const clearAutoSyncTimer = () => {
  if (!autoSyncTimer) return
  clearInterval(autoSyncTimer)
  autoSyncTimer = null
}

const setupAutoSyncTimer = () => {
  clearAutoSyncTimer()
  if (!isAutoSyncEnabled(state.opts)) return
  const intervalMs = getAutoSyncIntervalMs(state.opts)
  if (!intervalMs) return
  autoSyncTimer = setInterval(() => {
    if (!state.initialized) return
    scheduleSync('auto-interval')
  }, intervalMs)
}

let state = $state({
  lists: [],
  opts: {},
  aiLoading: null,
  syncing: false,
  snackbar: { status: false, msg: '' },
  initialized: false,
  lastSyncSuccess: null,
  syncPhase: SYNC_PHASES.NEVER_SYNCED,
  syncError: null,
  localOnly: false,
  lastSyncedAt: null,
  lastSyncedSignature: '',
  remoteVersion: 0,
  pendingRetry: null,
})

const normalizeSyncError = error => {
  if (error instanceof SyncError) {
    const phaseMap = {
      offline: SYNC_PHASES.OFFLINE,
      auth: SYNC_PHASES.AUTH_ERROR,
      server: SYNC_PHASES.SERVER_ERROR,
    }
    return {
      code: error.code || 'unknown',
      message: error.message,
      status: error.status,
      phase: phaseMap[error.code] || SYNC_PHASES.SERVER_ERROR,
    }
  }
  return {
    code: 'unknown',
    message: error?.message || 'Unexpected sync failure',
    status: null,
    phase: SYNC_PHASES.SERVER_ERROR,
  }
}

const scheduleRetry = () => {
  if (!state.pendingRetry || retryTimer) return
  logSyncEvent('retry_scheduled', {
    delayMs: RETRY_DELAY,
    reason: state.pendingRetry?.reason || 'unknown',
  })
  retryTimer = setTimeout(() => {
    retryTimer = null
    if (!state.pendingRetry) return
    pendingPayload = state.pendingRetry
    pushStateToServer(state.pendingRetry)
  }, RETRY_DELAY)
}

const pushStateToServer = async payload => {
  if (!payload) return
  state.syncing = true
  state.syncPhase = SYNC_PHASES.SYNCING
  try {
    const response = await CustomSync.syncState(payload.lists)
    const remoteVersion = parseRemoteVersion(response?.updated_at) || computeVersion(payload.lists)
    state.lastSyncedSignature = payload.signature
    state.remoteVersion = remoteVersion
    state.lastSyncedAt = Date.now()
    state.lastSyncSuccess = true
    state.syncPhase = SYNC_PHASES.SYNCED
    state.syncError = null
    state.localOnly = false
    state.pendingRetry = null
    pendingPayload = null
    logSyncEvent('push_success', {
      listCount: payload.lists?.length || 0,
      signature: payload.signature,
      reason: payload.reason,
      remoteVersion,
    })
    if (retryTimer) {
      clearTimeout(retryTimer)
      retryTimer = null
    }
  } catch (error) {
    const normalized = normalizeSyncError(error)
    state.lastSyncSuccess = false
    state.syncPhase = normalized.phase
    state.syncError = normalized
    state.localOnly = true
    state.pendingRetry = payload
    scheduleRetry()
    logSyncEvent('push_failed', {
      code: normalized.code,
      phase: normalized.phase,
      message: normalized.message,
      listCount: payload?.lists?.length || 0,
      reason: payload?.reason,
    })
    console.error('[SquirrlTab] Sync failed:', error)
  } finally {
    state.syncing = false
  }
}

const debouncedPush = _.debounce(() => {
  if (!pendingPayload) return
  pushStateToServer(pendingPayload)
}, 1200)

const scheduleSync = (reason = 'change', { immediate = false, listsOverride = null, signatureOverride = null, force = false } = {}) => {
  if (!state.initialized) return
  if (!force && !isAutoSyncEnabled(state.opts)) return
  const lists = listsOverride || $state.snapshot(state.lists)
  const signature = signatureOverride || buildSignature(lists)
  if (!force && signature === state.lastSyncedSignature) return
  pendingPayload = { lists, signature, reason }
  // FIX (Bug 2): Only mark as LOCAL_ONLY if we are not already in an
  // in-flight or error state.  The badge will flip to SYNCING as soon as
  // pushStateToServer actually runs, so we only need a brief LOCAL_ONLY
  // window when transitioning from a stable state.
  if ([SYNC_PHASES.SYNCED, SYNC_PHASES.IDLE, SYNC_PHASES.NEVER_SYNCED].includes(state.syncPhase)) {
    state.localOnly = true
    state.syncPhase = SYNC_PHASES.LOCAL_ONLY
  }
  if (immediate) {
    debouncedPush.cancel()
    pushStateToServer(pendingPayload)
  } else {
    debouncedPush()
  }
}

const hydrateFromRemote = async () => {
  if (!isAutoSyncEnabled(state.opts)) return
  state.syncing = true
  state.syncPhase = SYNC_PHASES.SYNCING
  logSyncEvent('hydrate_started')
  try {
    const response = await CustomSync.download()
    const remoteLists = Array.isArray(response?.lists) ? response.lists : []
    const normalizedRemote = remoteLists.map(mapRemoteList)
    const remoteVersion = parseRemoteVersion(response?.updated_at) || computeVersion(normalizedRemote)
    state.remoteVersion = remoteVersion

    // FIX (Bug 1): Re-read local storage RIGHT NOW instead of relying on
    // the snapshot that was taken before the network round-trip.  A stash
    // operation (or any other write) may have completed while we were
    // waiting for the server to respond.  Using a stale snapshot here would
    // cause us to clobber freshly-stashed tabs with the (older) remote set.
    const freshLocalData = await browser.storage.local.get('lists')
    const localSnapshot = Array.isArray(freshLocalData.lists) ? freshLocalData.lists : []
    const localVersion = computeVersion(localSnapshot)

    if (remoteVersion > localVersion) {
      const signature = buildSignature(normalizedRemote)
      state.lastSyncedSignature = signature
      state.remoteVersion = remoteVersion
      state.lastSyncSuccess = true
      state.localOnly = false
      state.syncError = null
      await storage.setLists(normalizedRemote)
      state.lastSyncedAt = Date.now()
      state.syncPhase = SYNC_PHASES.SYNCED
      logSyncEvent('hydrate_success', {
        action: 'downloaded',
        remoteLists: normalizedRemote.length,
        localLists: localSnapshot.length,
        remoteVersion,
        localVersion,
      })
    } else if (localVersion > remoteVersion && localSnapshot.length) {
      state.localOnly = true
      state.syncPhase = SYNC_PHASES.LOCAL_ONLY
      logSyncEvent('hydrate_success', {
        action: 'upload_scheduled',
        remoteLists: normalizedRemote.length,
        localLists: localSnapshot.length,
        remoteVersion,
        localVersion,
      })
      scheduleSync('remote-behind', { immediate: true, listsOverride: localSnapshot, signatureOverride: buildSignature(localSnapshot), force: true })
    } else {
      state.localOnly = false
      state.syncPhase = SYNC_PHASES.SYNCED
      logSyncEvent('hydrate_success', {
        action: 'unchanged',
        remoteLists: normalizedRemote.length,
        localLists: localSnapshot.length,
        remoteVersion,
        localVersion,
      })
    }
  } catch (error) {
    const normalized = normalizeSyncError(error)
    state.syncPhase = normalized.phase
    state.syncError = normalized
    state.lastSyncSuccess = false
    state.localOnly = true
    
    // FORCE LOCAL DATA TO PERSIST
    // This prevents the UI from clearing or hiding the lists 
    // just because the server at localhost:8000 is down.
    if (state.lists.length === 0) {
       const data = await browser.storage.local.get('lists');
       state.lists = Array.isArray(data.lists) ? data.lists : [];
    }

    logSyncEvent('hydrate_failed', {
      code: normalized.code,
      phase: normalized.phase,
      message: normalized.message,
    })
    console.error('[SquirrlTab] Failed to hydrate remote state:', error)
  } finally {
    state.syncing = false
    // Ensure initialized is true so the UI knows it's okay to render
    state.initialized = true 
  }
}

const initStore = async (retries = 3) => {
  let shouldFinalize = true
  try {
    const data = await browser.storage.local.get(['lists', 'opts'])
    state.lists = Array.isArray(data.lists) ? data.lists : []
    state.opts = data.opts || {}
    state.lastSyncedSignature = buildSignature(state.lists)
    state.remoteVersion = computeVersion(state.lists)
    state.lastSyncSuccess = null
    state.localOnly = false
    state.syncError = null
    state.syncPhase = isAutoSyncEnabled(state.opts) ? SYNC_PHASES.IDLE : SYNC_PHASES.NEVER_SYNCED
  } catch (error) {
    console.error('[SquirrlTab] Failed to initialize store:', error)
    if (retries > 0) {
      shouldFinalize = false
      setTimeout(() => initStore(retries - 1), 500)
      return
    }
    state.lists = []
    state.opts = {}
    state.lastSyncSuccess = false
    state.localOnly = true
    state.syncPhase = SYNC_PHASES.LOCAL_ONLY
  } finally {
    if (shouldFinalize) {
      state.initialized = true
      setupAutoSyncTimer()
      if (isAutoSyncEnabled(state.opts)) {
        hydrateFromRemote()
      }
    }
  }
}

initStore()

browser.storage.onChanged.addListener((changes, area) => {
  if (area !== 'local') return
  if (changes.lists) {
    const newLists = changes.lists.newValue
    state.lists = Array.isArray(newLists) ? newLists : []
    console.log('[SquirrlTab] Lists updated from storage:', state.lists.length)
  }
  if (changes.opts) {
    state.opts = changes.opts.newValue || {}
    console.log('[SquirrlTab] Options updated from storage')
    setupAutoSyncTimer()
  }
})

$effect.root(() => {
  $effect(() => {
    if (!state.initialized) return
    const snapshot = $state.snapshot(state.lists)
    const signature = buildSignature(snapshot)
    scheduleSync('change', { listsOverride: snapshot, signatureOverride: signature })
  })
})
  

export const syncStore = {
  get lists() {
    return state.lists
  },
  get opts() {
    return state.opts
  },
  get aiLoading() {
    return state.aiLoading
  },
  get syncing() {
    return state.syncing
  },
  get snackbar() {
    return state.snackbar
  },
  get initialized() {
    return state.initialized
  },
  get lastSyncSuccess() {
    return state.lastSyncSuccess
  },
  get syncStatus() {
    return {
      phase: state.syncPhase,
      syncing: state.syncing,
      error: state.syncError,
      lastSyncedAt: state.lastSyncedAt,
      localOnly: state.localOnly,
      pendingRetry: Boolean(state.pendingRetry),
      lastSyncSuccess: state.lastSyncSuccess,
    }
  },
  updateSnackbar(payload) {
    if (typeof payload === 'string') {
      state.snackbar = { status: true, msg: payload }
    } else {
      state.snackbar = payload
    }
  },
  get pinnedLists() {
    return state.lists.filter(list => list.pinned)
  },
  get taggedLists() {
    const tagged = {}
    state.lists.forEach(list => {
      (list.tags || []).forEach(tag => {
        if (!tagged[tag]) tagged[tag] = []
        tagged[tag].push(list)
      })
    })
    return tagged
  },
  async categorizeList(listId) {
    const list = state.lists.find(l => l._id === listId)
    if (!list) return

    state.aiLoading = list._id
    try {
      const result = await CustomSync.AI.categorize(list.tabs)
      if (result.category) {
        manager.updateListById(list._id, { category: result.category })
      }
      if (result.tags) {
        manager.updateListById(list._id, { tags: result.tags })
      }
      return result
    } catch (error) {
      console.error('[SquirrlTab] Categorization failed:', error)
      throw error
    } finally {
      state.aiLoading = null
    }
  },
  async restoreList(listId, inNewWindow = false) {
    const list = state.lists.find(l => l._id === listId)
    if (!list) {
      console.warn('[SquirrlTab] Cannot restore list: not found', listId)
      return false
    }
    try {
      if (inNewWindow) await tabsHelper.restoreListInNewWindow(list)
      else await tabsHelper.restoreTabs(list.tabs)
      if (!list.pinned) {
        await manager.removeListById(listId)
      }
      return true
    } catch (error) {
      console.error('[SquirrlTab] Failed to restore list:', error)
      throw error
    }
  },
  updateList(listId, updates) {
    manager.updateListById(listId, updates)
  },
  removeList(listId) {
    manager.removeListById(listId)
  },
  pinList(listId, pinned) {
    manager.updateListById(listId, { pinned })
  },
  changeColor(listId, color) {
    manager.updateListById(listId, { color })
  },
  manualRetry() {
    const hadPending = Boolean(state.pendingRetry)
    logSyncEvent('manual_retry', { hadPending })
    if (state.pendingRetry) {
      if (retryTimer) {
        clearTimeout(retryTimer)
        retryTimer = null
      }
      const payload = state.pendingRetry
      state.pendingRetry = null
      pushStateToServer(payload)
      return
    }
    const snapshot = $state.snapshot(state.lists)
    scheduleSync('manual-retry', {
      immediate: true,
      listsOverride: snapshot,
      signatureOverride: buildSignature(snapshot),
      force: true,
    })
  },
  async cleanAll() {
    const ids = state.lists.map(l => l._id)
    for (const id of ids) {
      manager.removeListById(id)
    }
  },
}

browser.runtime.onMessage.addListener(message => {
  if (!message || !message.type) return
  if (message.type === RUNTIME_MESSAGES.STASH_COMPLETED) {
    syncStore.updateSnackbar('Current tab stashed')
  }
  if (message.type === RUNTIME_MESSAGES.STASH_FAILED) {
    const reason = message.payload?.reason
    const msg = reason === 'BLOCKED_URL'
      ? 'Cannot stash the IceTab app itself'
      : 'Unable to stash current tab'
    syncStore.updateSnackbar(msg)
  }
})
````

## File: src/background/messageHandler.js
````javascript
import tabs from '../common/tabs'
import storage from '../common/storage'
// import boss from '../common/service/boss' // Keep import commented if you previously uncommented it for boss.js
import { sendMessage } from '../common/utils'
import listManager from '../common/listManager'
import { setupContextMenus } from './contextMenus'
import { updateBrowserAction } from './browserAction'
import { ILLEGAL_URLS, RUNTIME_MESSAGES } from '../common/constants'
const getExtensionUrlPrefix = () => chrome.runtime.getURL('')

const isBlockedStashTarget = url => {
  if (!url) return true
  const extensionUrl = getExtensionUrlPrefix()
  if (url.startsWith(extensionUrl)) return true
  return ILLEGAL_URLS.some(prefix => url.startsWith(prefix))
}

const emitStashEvent = (type, payload) => {
  return chrome.runtime.sendMessage({
    type,
    payload,
  }).catch(() => {
    // It's fine if no UI is listening.
  })
}

const handleStashCurrentTabIntent = async (source = 'app') => {
  try {
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (!activeTab || !activeTab.id) {
      throw new Error('NO_ACTIVE_TAB')
    }
    if (isBlockedStashTarget(activeTab.url)) {
      throw new Error('BLOCKED_URL')
    }
    await tabs.storeCurrentTab()
    await emitStashEvent(RUNTIME_MESSAGES.STASH_COMPLETED, {
      source,
      tabId: activeTab.id,
      title: activeTab.title,
      url: activeTab.url,
    })
  } catch (error) {
    await emitStashEvent(RUNTIME_MESSAGES.STASH_FAILED, {
      source,
      reason: error.message || 'UNKNOWN',
    })
    console.error('[SquirrlTab] Failed to stash current tab intent:', error)
  }
}

const messageHandler = async msg => {
  if (!msg) return

  if (msg.type === "REQUEST_SAVE_TAB") {
    await tabs.storeCurrentTab()

    chrome.runtime.sendMessage({
      type: "LISTS_UPDATED",
    })

    return
  }


  if (msg.type === RUNTIME_MESSAGES.STASH_COMPLETED || msg.type === RUNTIME_MESSAGES.STASH_FAILED) {
    return
  }
  if (msg.type === RUNTIME_MESSAGES.STASH_CURRENT_TAB) {
    const source = msg.payload?.source || 'app'
    handleStashCurrentTabIntent(source)
    return
  }
  console.debug('received', msg)
  if (msg.optionsChanged) {
    const changes = msg.optionsChanged
    console.debug('options changed', changes)

    const latestOpts = await storage.getOptions()
    Object.assign(latestOpts, changes)
    await storage.setOptions(latestOpts)

    if (changes.browserAction) updateBrowserAction(changes.browserAction)
    if (['pageContext', 'allContext', 'disableDynamicMenu'].some(k => k in changes)) {
      await setupContextMenus(latestOpts)
    }
    await sendMessage({ optionsChangeHandledStatus: 'success' })
  }
  if (msg.restoreList) {
    const { restoreList } = msg
    const listIndex = restoreList.index
    const lists = await storage.getLists()
    const list = lists[listIndex]
    if (restoreList.newWindow) {
      tabs.restoreListInNewWindow(list)
    } else {
      tabs.restoreList(list)
    }
    if (!list.pinned) {
      listManager.removeListById(list._id)
    }
  }
  if (msg.storeInto) {
    tabs.storeSelectedTabs(msg.storeInto.index)
  }
  /*
  if (msg.login) {
    boss.login(msg.login.token)
  }
  if (msg.refresh) {
    boss.refresh()
  }
  */
    if (msg.import) {
    const { lists } = msg.import
    lists.forEach(list => listManager.addList(list))

    chrome.runtime.sendMessage({
      type: "LISTS_UPDATED",
    })
    return
  }
}
export default messageHandler
````

## File: CHANGELOG.md
````markdown
### v1.4.7 8/24/2019

 - fix: display error when import anything
 - fix: increase import filesize limit from 32KB to 1MB
 - fix: won't scroll to search result item
 - fix: remove item before open link

### v1.4.6 8/8/2019

 - fix: crash when click item of search result
 - fix: data changes cannot be stored
 - fix: multi-operation button cannot be clicked

### v1.4.5 5/9/2019

 - fix: browser action broken in v1.4.4
 - feat: open selected tabs in tab list
 - change: right click apply for all selected tabs in the list currently

### v1.4.4 5/2/2019

 - fix: parse title from compatible format by mistake when it include `|`
 - fix: a possible case to cause data missing

### v1.4.3 2/13/2019

 - fix: transparent drawer
 - fix: always displayed list button
 - fix: confirm remove list not work when restore
 - fix: import list order wrong

### v1.4.2 2/2/2019

 - fix: store into a titled list broken
 - fix: wrong charset when export to file
 - fix: can remove item of list when click

### v1.4.1 1/31/2019

 - fix: drag and drop not work
 - fix: missing i18n fields

### v1.4.0 1/29/2019

 - feat: detail list pagination
 - feat: hide too much items in detail list
 - refactor: search feature can be used in every page
 - refactor: use drawer
 - refactor: change authorize way of sync service
 - depracate: some options have be depracated
 - feat: allow set tags of list and filter tags
 - feat: add a new option 'titleFontSize' to allow user change the font size of list title
 - feat: add 4 new options to allow user disable some feature to improve appearance

### v1.3.12 1/17/2019

 - fix: search item clicked wont expanse list
 - fix: context menus handler is not a function
 - fix: date collision with title

### v1.3.11 10/13/2018

 - change: refine i18n strings
 - fix: change of openTabListWhenNewTab take effect immediately
 - feat: add an option to allow disable open list tab when store all tabs
 - pref: clear login status only if token expired

### v1.3.10 10/3/2018

 - feat: allow store tabs into a specific list by clicking the items in context menu or a button in the simple list
 - feat: right clicking an item in the list will show a menu allows moving the tab to another list

### v1.3.9 9/29/2018

 - feat: add an option to allow open tabs at the ending
 - change: sort items of search

### v1.3.8 9/21/2018

 - fix: popup simple list is too short
 - fix: store all tabs in all window command not work
 - change: untitled list will show the title of tabs in popup simple list
 - change: do not display the change logs in about page
 - change: apply the nightmode to the popup simple list

### v1.3.7 9/19/2018

 - feat: search function in the detail list page & add an option to allow to enable or disable it

### v1.3.6 9/17/2018

 - fix: cover browser action in firefox
 - fix: auth button invalid
 - fix: store multi window failed in firefox
 - fix: vuetify expansion-panel bug
 - fix: open list page bug
 - feat: add an option to allow display context button on all elements
 - feat: add an option to exclude illegal URL
 - feat: add an option to remove duplicate

### v1.3.5 9/10/2018

 - fix: simple list
 - fix: style of options page

### v1.3.4 9/9/2018

 - fix: item click cannot be removed problem
 - fix: store all tabs from all windows
 - fix: create time and title overlap on small screen

### v1.3.3 9/7/2018

 - pref: reduce size
 - fix: make sure remote options is same as local
 - feat: allow other extension send message to better onetab

### v1.3.2 9/5/2018

 - pref: use vuex store options and login status
 - feat: add an option to alert before removing list
 - fix: make conflict if local is not empty after login (avoid directly downloading if local is not empty)

### v1.3.1 9/2/2018

 - feat: add an option to allow using night mode by default
 - feat: add an option to allow choosing items displayed
 - feat: add an option to allow hiding favicon
 - feat: add an option to allow useing fixed toolbar
 - change: hiding dialog after imported
 - change: put imported lists before current lists

### v1.3.0 8/31/2018

 - feat: better onetab sync server (it is provided by a self-hosted server, with unlimited storage space, allow authorize with google / github account now) !IMPORTANT
 - feat: save list to google drive (we will allow user access the saved file and import manually currently) !IMPORTANT
 - change: some icons changed
 - change: add a gitter link (you can get communicate with the developer instantly)
 - feat: allow set list color just need to click the tabs label
 - change: new logo

### v1.2.1 8/13/2018

 - fix: context menus click handler won't be called

### v1.2.0 8/12/2018

 - fix: some problem left over last version
 - feat: allow store two sides
 - feat: auto disable
 - change: group options
 - feat: add an option to allow cover browser action when current page is new tab page

### v1.1.3 8/6/2018

 - fix: remove list item will not open the tab
 - fix: restore list from popup
 - perf: set storage at next tick

### v1.1.2 8/5/2018

 - feat: nightmode
 - feat: add an option to change the position of remove item button
 - change: created time i18n support

### v1.1.1 8/1/2018

 - feat: add an option to turn on the button of context menu in the page
 - fix: do not await sync complete when access storage

### v1.1.0 7/29/2018

 - feat: add an operation to store all tabs in all windows (in context menus and keyboard shortcut)
 - change: add about page with update button and changelogs
 - change: change items of list in detail list page to a tag and it allows the operation of the a tag in the browser (such as copy link address, open in new window, use ctrl+click to open in background) !IMPORTANT
 - fix: make title on buttons available

### v1.0.6 7/27/2018

 - change: change a part of ui
 - change: add a link to keyboard shortcuts

### v1.0.5 7/20/2018

 - feat: add an option to pin new list
 - fix: avoid title input line height increase
 - fix: allow use enter to set title of a list

### v1.0.4 7/14/2018

 - feat: add an option to ignore pinned tab & allow change the order of lists
 - feat: keep tab list expand status

### v1.0.3 6/30/2018

 - fix: temporary use webextension-polyfill to replace chrome-promise
 - fix: store selected tabs in all window (currently store current window only)
 - fix: remove item in tab list will not trigger item clicked handler
 - fix: avoid tab list page being stored
 - fix: fix restore in new window

### v1.0.2 5/24/2018

 - change: supplment i18n message

### v1.0.1 5/20/2018

 - fix: open onetab page when there are no tab in current window

### v1.0.0 5/19/2018

 - feat: Set title of list
 - feat: Popup page with simple list
 - feat: Pin tab list
 - feat: Keyboard shortcuts
 - feat: Options
 - feat: Drag and drop re-ordering
 - feat: Data & options sync
 - feat: Import & export
````

## File: src/_locales/zh_CN/messages.json
````json
{
  "ext_name": {
    "message": "IceTab"
  },
  "ext_desc": {
    "message": "一个更好的 OneTab 扩展"
  },
  "menu_STORE_SELECTED_TABS": {
    "message": "保存选中的标签页"
  },
  "menu_STORE_ALL_TABS_IN_CURRENT_WINDOW": {
    "message": "保存当前窗口的所有标签页"
  },
  "menu_SHOW_TAB_LIST": {
    "message": "显示标签页列表"
  },
  "menu_STORE_ALL_TABS_IN_ALL_WINDOWS": {
    "message": "保存所有窗口的所有标签页"
  },
  "menu_EXTRA": {
    "message": "额外功能"
  },
  "menu_STORE_LEFT_TABS": {
    "message": "保存左侧标签页"
  },
  "menu_STORE_RIGHT_TABS": {
    "message": "保存右侧标签页"
  },
  "menu_STORE_TWOSIDE_TABS": {
    "message": "保存未选中标签页"
  },
  "menu_STORE": {
    "message": "储存"
  },
  "menu_STORE_TO_TITLED_LIST": {
    "message": "储存至"
  },
  "menu_SAVE_TAB_TO_SPINE": {
    "message": "保存标签页到 IceTab"
  },
  "cmd_store_selected_tabs": {
    "message": "保存已选中标签页"
  },
  "cmd_store_all_tabs": {
    "message": "保存所有标签页"
  },
  "cmd_restore_lastest_list": {
    "message": "恢复最后的列表"
  },
  "cmd_open_lists": {
    "message": "打开标签页列表"
  },
  "cmd_store_all_in_all_windows": {
    "message": "保存所有窗口的所有标签页"
  },
  "opt_name_browserAction": {
    "message": "图标被点击的行为"
  },
  "opt_name_itemClickAction": {
    "message": "列表中的某一项被点击的行为"
  },
  "opt_name_itemDisplay": {
    "message": "列表中的项显示的内容"
  },
  "opt_name_hideFavicon": {
    "message": "列表中不显示图标"
  },
  "opt_name_removeItemBtnPos": {
    "message": "移除标签页的按钮位置"
  },
  "opt_name_popupItemClickAction": {
    "message": "弹出列表中的项被点击的行为"
  },
  "opt_name_defaultNightMode": {
    "message": "默认使用夜间模式"
  },
  "opt_name_fixedToolbar": {
    "message": "固定顶部工具栏"
  },
  "opt_name_addHistory": {
    "message": "保存的标签页添加到历史记录"
  },
  "opt_name_ignorePinned": {
    "message": "不保存已固定的标签页"
  },
  "opt_name_pinNewList": {
    "message": "自动固定新的列表"
  },
  "opt_name_pageContext": {
    "message": "出现在页面的右键菜单中"
  },
  "opt_name_allContext": {
    "message": "出现在所有元素的右键菜单中"
  },
  "opt_name_openTabListWhenNewTab": {
    "message": "当新标签页时打开标签列表"
  },
  "opt_desc_openTabListWhenNewTab": {
    "message": "当前页面为新标签页的时候点击图标时显示标签页列表 (不会覆盖弹出简易列表的行为)"
  },
  "opt_name_alertRemoveList": {
    "message": "删除列表时确认"
  },
  "opt_name_excludeIllegalURL": {
    "message": "排除非标准 URL，例如 about:* 和 chrome://*"
  },
  "opt_name_removeDuplicate": {
    "message": "列表中避免重复"
  },
  "opt_name_enableSearch": {
    "message": "详细列表中启用搜索功能"
  },
  "opt_name_openEnd": {
    "message": "恢复列表时标签页在末尾打开"
  },
  "opt_name_openTabListNoTab": {
    "message": "当储存所有标签时打开标签列表"
  },
  "opt_name_listsPerPage": {
    "message": "每页的列表数量"
  },
  "opt_name_titleFontSize": {
    "message": "列表标题的字体大小"
  },
  "opt_name_disableDynamicMenu": {
    "message": "禁用动态更新菜单"
  },
  "opt_name_disableExpansion": {
    "message": "禁用可展开的列表"
  },
  "opt_name_disableTransition": {
    "message": "禁用所有 CSS 过渡动画"
  },
  "opt_name_disableSearch": {
    "message": "禁用搜索功能"
  },
  "opt_label_popup": {
    "message": "弹出简单列表"
  },
  "opt_label_store_selected": {
    "message": "保存选中的标签页"
  },
  "opt_label_store_all": {
    "message": "保存当前窗口的所有标签页"
  },
  "opt_label_show_list": {
    "message": "显示完整标签页列表"
  },
  "opt_label_none": {
    "message": "无动作"
  },
  "opt_label_open_and_remove": {
    "message": "打开并移除"
  },
  "opt_label_open": {
    "message": "打开"
  },
  "opt_label_restore": {
    "message": "恢复"
  },
  "opt_label_restore_new_window": {
    "message": "恢复至新的窗口"
  },
  "opt_label_left": {
    "message": "标签页左侧"
  },
  "opt_label_right": {
    "message": "标签页右侧"
  },
  "opt_label_title_and_url": {
    "message": "标题和地址"
  },
  "opt_label_title": {
    "message": "标题"
  },
  "opt_label_url": {
    "message": "地址"
  },
  "ui_nightmode": {
    "message": "夜间模式"
  },
  "ui_tab": {
    "message": "个标签页"
  },
  "ui_created": {
    "message": "创建于"
  },
  "ui_retitle_list": {
    "message": "列表更名"
  },
  "ui_restore_all": {
    "message": "列表还原"
  },
  "ui_restore_all_in_new_window": {
    "message": "列表还原至新窗口"
  },
  "ui_remove_list": {
    "message": "删除列表"
  },
  "ui_pin": {
    "message": "固定"
  },
  "ui_unpin": {
    "message": "取消固定"
  },
  "ui_list": {
    "message": "列表"
  },
  "ui_pinned": {
    "message": "已固定"
  },
  "ui_duplicate": {
    "message": "复制"
  },
  "ui_copy_link": {
    "message": "复制链接"
  },
  "ui_copy_title": {
    "message": "复制标题"
  },
  "ui_remove": {
    "message": "删除"
  },
  "ui_open": {
    "message": "打开"
  },
  "ui_create_issue": {
    "message": "反馈问题"
  },
  "ui_options": {
    "message": "选项"
  },
  "ui_options_behaviour": {
    "message": "行为"
  },
  "ui_options_appearance": {
    "message": "外观"
  },
  "ui_options_performance": {
    "message": "性能"
  },
  "ui_options_sync": {
    "message": "同步"
  },
  "ui_about": {
    "message": "关于"
  },
  "ui_keyboard_shortcuts": {
    "message": "键盘快捷键"
  },
  "ui_export_import": {
    "message": "导出 / 导入"
  },
  "ui_github": {
    "message": "代码仓库"
  },
  "ui_tab_list": {
    "message": "标签页列表"
  },
  "ui_export": {
    "message": "导出"
  },
  "ui_import": {
    "message": "导入"
  },
  "ui_export_comp": {
    "message": "导出 (兼容 OneTab)"
  },
  "ui_export_json": {
    "message": "导出至 JSON"
  },
  "ui_save_as_file": {
    "message": "保存为文件"
  },
  "ui_copy": {
    "message": "复制"
  },
  "ui_copied": {
    "message": "复制成功!"
  },
  "ui_import_from_file": {
    "message": "导入文件"
  },
  "ui_import_comp": {
    "message": "导入 (兼容 OneTab)"
  },
  "ui_import_json": {
    "message": "从 JSON 中导入"
  },
  "ui_main_processing": {
    "message": "处理中..."
  },
  "ui_main_error_occurred": {
    "message": "发生了一些错误"
  },
  "ui_main_succeeded": {
    "message": "成功！"
  },
  "ui_opt_changes_saved": {
    "message": "修改已保存！"
  },
  "ui_title_pin_btn": {
    "message": "固定列表"
  },
  "ui_title_up_btn": {
    "message": "上移列表"
  },
  "ui_title_down_btn": {
    "message": "下移列表"
  },
  "ui_save_to_gdrive": {
    "message": "将列表保存至 Google Drive"
  },
  "ui_save_immediately": {
    "message": "立即保存"
  },
  "ui_no_list": {
    "message": "没有标签页"
  },
  "ui_no_list_tip": {
    "message": "1. 选中你想保存的标签页</br>2. 右键点击扩展图标</br>3. 点击 \"保存选中的标签页\"<p class=\"body-2\">在其他设备使用过？ 授权同步服务可以自动恢复列表。</p>"
  },
  "ui_untitled": {
    "message": "未命名"
  },
  "ui_updated_to_ver": {
    "message": "IceTab 已更新至"
  },
  "ui_click_view_changelog": {
    "message": "点击查看详细更新日志"
  },
  "ui_move_to": {
    "message": "移动至"
  },
  "ui_a_new_list": {
    "message": "(一个新列表)"
  }
}
````

## File: src/app/index.js
````javascript
import { mount } from 'svelte';
import "@/assets/css/fontawesome-all.min.css";
import "@/assets/css/index.css";
import App from './App.svelte';

// Clear out the old 'new App' logic
const target = document.getElementById('app') || document.body;

mount(App, {
  target: target,
  props: { /* any props you need */ }
});

// Note: If you need to remove the app later,
// you use import { unmount } from 'svelte';
````

## File: src/common/utils.js
````javascript
import _ from 'lodash'
import __ from './i18n'
import { formatDistanceToNow, format, isSameYear } from 'date-fns'
import { enUS, zhCN } from 'date-fns/locale'
import { COLORS } from './constants'

// Map your @@ui_locale to date-fns locale objects
const dateFnsLocales = {
  en: enUS,
  zh_CN: zhCN,
  de: zhCN, // Assuming 'de' maps to zhCN locale or needs a separate de locale from date-fns
}

const getDateFnsLocale = uiLocale => dateFnsLocales[uiLocale.split('-')[0]] || enUS

export const formatTime = time => {
  const date = new Date(time)
  const now = new Date()
  const locale = getDateFnsLocale(__('@@ui_locale'))

  // If time difference is less than 1 hour (3600E3 milliseconds)
  if (now.getTime() - time < 3600E3) {
    return formatDistanceToNow(date, { addSuffix: true, locale })
  }

  const withYear = !isSameYear(date, now)
  const formatString = `iii, MMMM do ${withYear ? 'yyyy' : ''}, HH:mm:ss`
  return format(date, formatString, { locale })
}
export const one = fn => {
  let executing = false
  return async function onceAtSameTimeFunction(...args) {
    if (executing) return
    executing = true
    let re
    try {
      re = await fn.apply(this, args) // eslint-disable-line no-invalid-this
    } finally {
      executing = false
    }
    return re
  }
}
export const checkPermission = async permission => {
  if (await chrome.permissions.contains({ permissions: [permission] })) return true
  return chrome.permissions.request({ permissions: [permission] })
}
export const readFile = file => new Promise((resolve, reject) => {
  const reader = new FileReader()
  reader.onloadend = event => resolve(event.target.result)
  reader.onerror = reject
  reader.readAsText(file)
})
export const genObjectId = () => {
  const timestamp = (new Date().getTime() / 1000 | 0).toString(16)
  return timestamp + 'xxxxxxxxxxxxxxxx'.replace(/[x]/g, () => (Math.random() * 16 | 0).toString(16)).toLowerCase()
}
export const isBackground = () => typeof self.importScripts === 'function'

export const formatSize = bytes => {
  const sufixes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return !bytes && '0 Bytes' || (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + sufixes[i]
}
export const sleep = ms => new Promise(r => setTimeout(r, ms))

export const getColorByHash = _.memoize(str => {
  const hash = typeof str === 'string' ? str.split('').reduce((r, i) => i.charCodeAt(0) + r, 0) : 0
  return COLORS[hash % COLORS.length]
})

export const timeout = (promise, ms) => Promise.race([
  promise, new Promise((resolve, reject) => setTimeout(() => {
    reject(new Error('promise timeout'))
  }, ms))
])

export const compareVersion = (a, b) => {
  if (a === b) return 0
  const [ap, bp] = [a, b].map(i => i || '0').map(i => i.split('.').map(j => +j))
  const len = Math.min(ap.length, bp.length)
  for (let i = 0; i < len; i += 1) {
    if (ap[i] !== bp[i]) return ap[i] - bp[i]
  }
  return ap.length - bp.length
}

export const sendMessage = async msg => {
  try {
    await chrome.runtime.sendMessage(msg)
  } catch (err) {
    if (err.message === 'Could not establish connection. Receiving end does not exist.') {
      return console.warn('error ignored', err.message)
    }
    throw err
  }
}

export const throttle = (fn, ms) => {
  let executing
  let next
  let nextArgs
  let timeout
  let lastTime
  return async function throttled(...args) {
    const now = Date.now()
    if (now - lastTime < ms) {
      next = true
      nextArgs = args
      if (timeout) clearTimeout(timeout)
      timeout = setTimeout(() => {
        throttled(...args)
      })
      return
    }

    if (executing) {
      next = true
      nextArgs = args
      return
    }

    executing = true
    lastTime = now

    let re
    try {
      re = await fn.apply(this, args) // eslint-disable-line no-invalid-this
    } finally {
      executing = false
      if (next) {
        if (Date.now() - now > ms) {
          next = false
          if (timeout) clearTimeout(timeout)
          throttled(...nextArgs)
        }
      }
    }
    return re
  }
}

export class Mutex {
  constructor() {
    this._locking = Promise.resolve()
    this._locks = 0
  }

  isLocked() {
    return this._locks > 0
  }

  lock() {
    this._locks += 1
    let unlockNext
    const willLock = new Promise(resolve => {
      unlockNext = () => {
        this._locks -= 1
        resolve()
      }
    })
    const willUnlock = this._locking.then(() => unlockNext)
    this._locking = this._locking.then(() => willLock)
    return willUnlock
  }
}

export const getDomain = (url) => {
  try {
    const hostname = new URL(url).hostname;
    return hostname.replace(/^www\./, '');
  } catch (e) {
    return url;
  }
};
````

## File: src/_locales/en/messages.json
````json
{
  "ext_name": {
    "message": "IceTab"
  },
  "ext_desc": {
    "message": "A better OneTab"
  },
  "menu_STORE_SELECTED_TABS": {
    "message": "Store selected tabs"
  },
  "menu_STORE_ALL_TABS_IN_CURRENT_WINDOW": {
    "message": "Store all tabs in current window"
  },
  "menu_SHOW_TAB_LIST": {
    "message": "Show tab lists"
  },
  "menu_STORE_ALL_TABS_IN_ALL_WINDOWS": {
    "message": "Store all tabs in all windows"
  },
  "menu_EXTRA": {
    "message": "Extra"
  },
  "menu_STORE_LEFT_TABS": {
    "message": "Store left tabs"
  },
  "menu_STORE_RIGHT_TABS": {
    "message": "Store right tabs"
  },
  "menu_STORE_TWOSIDE_TABS": {
    "message": "Store unselected tabs"
  },
  "menu_STORE": {
    "message": "store"
  },
  "menu_STORE_TO_TITLED_LIST": {
    "message": "store into a titled list"
  },
  "menu_SAVE_TAB_TO_SPINE": {
    "message": "Save tab to IceTab"
  },
  "cmd_store_selected_tabs": {
    "message": "Store selected tabs"
  },
  "cmd_store_all_tabs": {
    "message": "Store all tabs"
  },
  "cmd_restore_lastest_list": {
    "message": "Restore lastest tabs"
  },
  "cmd_open_lists": {
    "message": "Open tab lists"
  },
  "cmd_store_all_in_all_windows": {
    "message": "Store all tabs in all windows"
  },
  "opt_name_browserAction": {
    "message": "Behavior when icon is clicked"
  },
  "opt_name_itemClickAction": {
    "message": "Behavior when item in a list is clicked"
  },
  "opt_name_itemDisplay": {
    "message": "Contents of the items in a list"
  },
  "opt_name_hideFavicon": {
    "message": "Hide favicon of items in the list"
  },
  "opt_name_removeItemBtnPos": {
    "message": "The position of remove item button"
  },
  "opt_name_popupItemClickAction": {
    "message": "Behavior when item in simple list is clicked"
  },
  "opt_name_defaultNightMode": {
    "message": "Use night mode by default"
  },
  "opt_name_fixedToolbar": {
    "message": "Fixed toolbar"
  },
  "opt_name_addHistory": {
    "message": "Add stored tab to history"
  },
  "opt_name_ignorePinned": {
    "message": "Prevent store pinned tabs"
  },
  "opt_name_pinNewList": {
    "message": "Auto pin new list"
  },
  "opt_name_pageContext": {
    "message": "Enable context menu for page"
  },
  "opt_name_allContext": {
    "message": "Enable context menu for all elements"
  },
  "opt_name_openTabListWhenNewTab": {
    "message": "Open tab list when new tab"
  },
  "opt_desc_openTabListWhenNewTab": {
    "message": "Always open tab list when clicking on the icon if current tab is a new tab. (Doesn't work if behavior is set to \"popup tiny list\""
  },
  "opt_name_alertRemoveList": {
    "message": "Confirm to remove list"
  },
  "opt_name_excludeIllegalURL": {
    "message": "Exclude illegal URL like about:* or chrome://*"
  },
  "opt_name_removeDuplicate": {
    "message": "Remove duplicate item in a list"
  },
  "opt_name_enableSearch": {
    "message": "Enable search in the detail list page"
  },
  "opt_name_openEnd": {
    "message": "When restore list open at the ending of tabs"
  },
  "opt_name_openTabListNoTab": {
    "message": "Open the tab list when store all tabs"
  },
  "opt_name_listsPerPage": {
    "message": "Number of lists per page"
  },
  "opt_name_titleFontSize": {
    "message": "Font size of list title"
  },
  "opt_name_disableDynamicMenu": {
    "message": "Disable dynamic menus update"
  },
  "opt_name_disableExpansion": {
    "message": "Disable expansion in list page"
  },
  "opt_name_disableTransition": {
    "message": "Disable all CSS transition animation"
  },
  "opt_name_disableSearch": {
    "message": "Disable search feature"
  },
  "opt_name_syncBaseUrl": {
    "message": "Sync Server Base URL"
  },
  "opt_name_syncApiKey": {
    "message": "Sync Server API Key"
  },
  "opt_label_popup": {
    "message": "Popup tiny list"
  },
  "opt_label_store_selected": {
    "message": "Store selected tabs"
  },
  "opt_label_store_all": {
    "message": "Store all tabs in current window"
  },
  "opt_label_show_list": {
    "message": "Show list"
  },
  "opt_label_none": {
    "message": "None"
  },
  "opt_label_open_and_remove": {
    "message": "Open and remove"
  },
  "opt_label_open": {
    "message": "Open"
  },
  "opt_label_restore": {
    "message": "Restore"
  },
  "opt_label_restore_new_window": {
    "message": "Restore in new window"
  },
  "opt_label_left": {
    "message": "Left"
  },
  "opt_label_right": {
    "message": "Right"
  },
  "opt_label_title_and_url": {
    "message": "Title and URL"
  },
  "opt_label_title": {
    "message": "Title"
  },
  "opt_label_url": {
    "message": "URL"
  },
  "ui_nightmode": {
    "message": "Night mode"
  },
  "ui_tab": {
    "message": "tabs"
  },
  "ui_created": {
    "message": "Created"
  },
  "ui_retitle_list": {
    "message": "Retitle list"
  },
  "ui_restore_all": {
    "message": "Restore list"
  },
  "ui_restore_all_in_new_window": {
    "message": "Restore all in new window"
  },
  "ui_remove_list": {
    "message": "Remove list"
  },
  "ui_pin": {
    "message": "Pin"
  },
  "ui_unpin": {
    "message": "Unpin"
  },
  "ui_list": {
    "message": "list"
  },
  "ui_pinned": {
    "message": "pinned"
  },
  "ui_duplicate": {
    "message": "Duplicate"
  },
  "ui_copy_link": {
    "message": "Copy link"
  },
  "ui_copy_title": {
    "message": "Copy title"
  },
  "ui_remove": {
    "message": "Remove"
  },
  "ui_open": {
    "message": "Open"
  },
  "ui_create_issue": {
    "message": "Create an issue"
  },
  "ui_options": {
    "message": "Options"
  },
  "ui_options_behaviour": {
    "message": "Behaviour"
  },
  "ui_options_appearance": {
    "message": "Appearance"
  },
  "ui_options_performance": {
    "message": "Performance"
  },
  "ui_options_sync": {
    "message": "Sync"
  },
  "ui_about": {
    "message": "About"
  },
  "ui_keyboard_shortcuts": {
    "message": "Keyboard shortcuts"
  },
  "ui_export_import": {
    "message": "Export / Import"
  },
  "ui_github": {
    "message": "GitHub"
  },
  "ui_tab_list": {
    "message": "Tab Lists"
  },
  "ui_export": {
    "message": "Export"
  },
  "ui_import": {
    "message": "Import"
  },
  "ui_export_comp": {
    "message": "Export (compatible with OneTab)"
  },
  "ui_export_json": {
    "message": "Export to JSON"
  },
  "ui_save_as_file": {
    "message": "Save as file"
  },
  "ui_copy": {
    "message": "Copy"
  },
  "ui_copied": {
    "message": "Copied!"
  },
  "ui_import_from_file": {
    "message": "Import from file"
  },
  "ui_import_comp": {
    "message": "Import (compatible with OneTab)"
  },
  "ui_import_json": {
    "message": "Import from JSON"
  },
  "ui_main_processing": {
    "message": "Processing..."
  },
  "ui_main_error_occurred": {
    "message": "Some errors occurred"
  },
  "ui_main_succeeded": {
    "message": "succeeded!"
  },
  "ui_opt_changes_saved": {
    "message": "Changes saved!"
  },
  "ui_title_pin_btn": {
    "message": "Pin list"
  },
  "ui_title_up_btn": {
    "message": "Move list up"
  },
  "ui_title_down_btn": {
    "message": "Move list down"
  },
  "ui_save_to_gdrive": {
    "message": "Save list to google drive"
  },
  "ui_save_immediately": {
    "message": "Save immediately"
  },
  "ui_no_list": {
    "message": "No list here"
  },
  "ui_no_list_tip": {
    "message": "1. Select the tabs you want to store</br>2. Right click the extension icon</br>3. Click \"store selected tabs\"<p class=\"body-2\">Already used in other device? Authorizing with sync service could restore lists automatically.</p>"
  },
  "ui_untitled": {
    "message": "untitled"
  },
  "ui_updated_to_ver": {
    "message": "IceTab has updated to"
  },
  "ui_click_view_changelog": {
    "message": "click to view detail changelog"
  },
  "ui_move_to": {
    "message": "Move to"
  },
  "ui_a_new_list": {
    "message": "(a new list)"
  }
}
````

## File: src/app/index.html
````html
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <link rel="stylesheet" href="../assets/css/fontawesome-all.min.css">
  <title>IceTab</title>
  <style>
    body {
      /* Removes the browser's default margin, which can cause scrollbars */
      margin: 0;
    }

    #app {
      /* Sets a fixed width for the app, preventing the layout from collapsing */
      min-width: 700px;
    }

    .v-application--wrap {
      /* Overrides Vuetify's default min-height to prevent vertical overflow in the popup */
      min-height: auto !important;
    }

    .is-popup .v-main__wrap,
    .is-popup .v-content__wrap {
      /* Adds space on the right side. Adjust this value as needed. */
      padding-right: 32px;
    }
  </style>
</head>

<body>
  <div id="app"></div>
</body>

</html>
````

## File: src/app/store/index.js
````javascript
import _ from 'lodash'
import Vue from 'vue'
import Vuex from 'vuex'
import storage from '@/common/storage'
import options from '@/common/options' // eslint-disable-line no-unused-vars
// import boss from '@/common/service/boss' // Comment out this import
import listManager from '@/common/listManager'
import {sleep} from '@/common/utils'

import lists from './lists'

Vue.use(Vuex)

export default new Vuex.Store({
  strict: DEBUG,
  state: {
    opts: options.getDefaultOptions(),
    hasToken: false,
    drawer: true,
    nightmode: false,
    snackbar: { status: false, msg: '' },
    scrollY: 0,
    ...lists.state,
  },
  getters: {
    ...lists.getters,
  },
  mutations: {
    setOption(state, payload) {
      if (!payload) return
      for (const [k, v] of Object.entries(payload)) {
        Vue.set(state.opts, k, v)
      }
      if ('defaultNightMode' in payload) {
        state.nightmode = payload.defaultNightMode
      }
    },
    setToken(state, payload) {
      state.hasToken = payload
    },
    setDrawer(state, drawer) {
      state.drawer = drawer
    },
    setNightmode(state, payload) {
      state.nightmode = payload
    },
    setSnackbar(state, message) {
      state.snackbar.msg = message
      state.snackbar.status = true
    },
    closeSnackbar(state) {
      state.snackbar.status = false
    },
    setScrollY(state, v) {
      state.scrollY = v
    },
    ...lists.mutations,
  },
  actions: {
    async initializeState({ commit, dispatch }) {
      await listManager.init()
      const loadedOptions = await storage.getOptions()
      if (loadedOptions) {
        commit('setOption', loadedOptions)
      }
      // Check for the 'context=popup' query parameter
      const isPopup = new URLSearchParams(window.location.search).get('context') === 'popup'
      if (isPopup) {
        commit('setDrawer', false)
      } else {
        const drawer = await storage.get('drawer')
        commit('setDrawer', _.defaultTo(drawer, true))
      }
      commit('setToken', false)
      await dispatch('preloadLists')
    },
    async setAndSaveOption({ commit, state }, { key, value }) {
      const newOpts = { ...state.opts, [key]: value }
      commit('setOption', newOpts)
      await storage.setOptions(newOpts)
    },
    async switchDrawer({ commit, state }, newState) {
      // If newState is a boolean, use it. Otherwise, toggle the current state.
      const finalState = typeof newState === 'boolean' ? newState : !state.drawer;
      commit('setDrawer', finalState);
      await storage.set({ drawer: finalState });
    },
    async switchNightmode({ dispatch, state }) {
      const newNightmodeState = !state.nightmode
      await dispatch('setAndSaveOption', { key: 'defaultNightMode', value: newNightmodeState })
    },
    async showSnackbar({commit}, message) {
      commit('setSnackbar', message)
      await sleep(2000)
      commit('closeSnackbar')
    },
    ...lists.actions,
  },
  plugins: [
    listManager.createVuexPlugin(),
  ],
})
````

## File: src/common/service/boss.js
````javascript
// import {
//   TOKEN_KEY,
//   AUTH_HEADER,
//   SYNC_SERVICE_URL,
//   SYNC_MAX_INTERVAL,
//   SYNC_MIN_INTERVAL,
// } from '../constants'
// import _ from 'lodash'
// import storage from '../storage'
// import listManager from '../listManager'
// import {isBackground, timeout, sendMessage} from '../utils'
// // import io from 'socket.io-client'
// import logger from '../logger'

// const hasToken = async () => TOKEN_KEY in await chrome.storage.local.get(TOKEN_KEY)

// const getToken = async () => {
//   const {token: localToken} = await chrome.storage.local.get(TOKEN_KEY)
//   if (localToken) return localToken
//   const {token: remoteToken} = await chrome.storage.sync.get(TOKEN_KEY)
//   if (remoteToken) return remoteToken
// }

// const setToken = async token => {
//   await chrome.storage.local.set({[TOKEN_KEY]: token, tokenIssued: Date.now()})
//   await chrome.storage.sync.set({[TOKEN_KEY]: token})
// }

// const removeToken = async () => {
//   await chrome.storage.local.remove(TOKEN_KEY)
//   await chrome.storage.sync.remove(TOKEN_KEY)
// }

// const fetchData = async (uri = '', method = 'GET', data = {}) => {
//   const headers = new Headers()
//   const token = await getToken()
//   if (token) headers.append(AUTH_HEADER, token)
//   const option = {
//     headers,
//     method,
//     mode: 'cors',
//   }

//   if (['POST', 'PUT', 'PATCH'].includes(method)) {
//     headers.append('Content-Type', 'application/json')
//     option.body = JSON.stringify(data)
//   } else {
//     uri += '?' + Object.keys(data).map(key => {
//       if (typeof data[key] === 'object') data[key] = JSON.stringify(data[key])
//       return key + '=' + encodeURIComponent(data[key])
//     }).filter(i => i).join('&')
//   }

//   const res = await fetch(SYNC_SERVICE_URL + uri, option)
//   if (res.headers.has(AUTH_HEADER)) {
//     const newToken = res.headers.get(AUTH_HEADER)
//     console.debug('[boss]: got new token', newToken)
//     await setToken(newToken)
//   }
//   if (res.ok) return res.json()
//   if (res.status === 401) await removeToken()
//   const err = await res.json()
//   throw new Error(err.message)
// }

// const getInfo = () => fetchData('/api/info').then(info => {
//   info.optsUpdatedAt = Date.parse(info.optsUpdatedAt) || 0
//   info.listsUpdatedAt = Date.parse(info.listsUpdatedAt) || 0
//   return info
// })

// // Use self instead of window for global state in service worker
// const setWSToken = token => {
//   if (!self._socket) return
//   self._socket.io.opts.query = {
//     [AUTH_HEADER]: token,
//   }
// }

// const _socketEmitTimeout = (socket, event, arg) => timeout(new Promise((resolve, reject) => {
//   const cb = result => result && result.err ? reject(result.err) : resolve(result)
//   if (arg) socket.emit(event, arg, cb)
//   else socket.emit(event, cb)
// }), 5000)

// const uploadOpsViaWS = async () => {
//   const socket = self._socket
//   if (!socket || !socket.connected) throw new Error('socket not connected')
//   const {ops} = await chrome.storage.local.get('ops')
//   if (ops) {
//     const changes = ops.sort((a, b) => a.time - b.time)
//     while (changes && changes.length) {
//       const change = changes.shift()
//       await _socketEmitTimeout(socket, 'list.update', change)
//     }
//   }
//   await chrome.storage.local.remove('ops')
// }

// const downloadRemoteLists = async () => {
//   const socket = self._socket
//   if (!socket || !socket.connected) throw new Error('socket not connected')
//   const remoteTime = await _socketEmitTimeout(socket, 'list.time')
//   const {listsUpdatedAt: localTime} = await chrome.storage.local.get('listsUpdatedAt')
//   if (remoteTime === localTime) return
//   const remoteLists = await _socketEmitTimeout(socket, 'list.all')
//   const localLists = _.keyBy(await storage.getLists(), list => list._id)
//   const finallyLists = []
//   const fetching = {}
//   remoteLists.forEach(list => {
//     if (!(list._id in localLists) || localLists.updatedAt < list.updatedAt) {
//       fetching[list._id] = _socketEmitTimeout(socket, 'list.get', list._id)
//       finallyLists.push(list._id)
//     } else {
//       finallyLists.push(localLists[list._id])
//     }
//   })
//   console.log(finallyLists)
//   await Promise.all(Object.values(fetching))
//   for (let i = 0; i < finallyLists.length; i += 1) {
//     if (typeof finallyLists[i] === 'string') {
//       finallyLists[i] = await fetching[finallyLists[i]] // eslint-disable-line
//     }
//   }
//   console.log(finallyLists)
//   await storage.setLists(finallyLists)
//   await chrome.storage.local.set({listsUpdatedAt: remoteTime})
// }

// const syncLists = async () => {
//   const unlock = await listManager.RWLock.lock()
//   try {
//     await uploadOpsViaWS()
//     await downloadRemoteLists()
//   } finally {
//     await unlock()
//   }
// }

// const getRemoteOptionsUpdatedTimeViaWS = () => _socketEmitTimeout(self._socket, 'opts.time')

// const getRemoteOptions = () => _socketEmitTimeout(self._socket, 'opts.all')

// const setRemoteOptions = (opts, time) => _socketEmitTimeout(self._socket, 'opts.set', { opts, time })

// const syncOptions = async () => {
//   const remoteTime = await getRemoteOptionsUpdatedTimeViaWS()
//   const {optsUpdatedAt: localTime} = await chrome.storage.local.get('optsUpdatedAt')
//   if (remoteTime > localTime) {
//     const opts = await getRemoteOptions()
//     await chrome.storage.local.set({opts, optsUpdatedAt: remoteTime})
//   } else if (remoteTime < localTime) {
//     const opts = await storage.getOptions()
//     await setRemoteOptions(opts, localTime)
//   }
// }

// /**
//  * latest sync logic
//  * date: 2019-01-21
//  *
//  * options:
//  * - record the time when options are changed
//  * - get remote options updated time
//  * - if local time is later than remote upload local options to remote and set remote time, else if local time is before than remote download the remote options and set local time
//  *
//  * lists:
//  * - record each time of list be updated (UPDATE_LIST_BY_ID)
//  * - upload local operations to remote (include the time and save in server storage)
//  * - compare the latest updated time of each list
//  * - if local time is before than remote download that remote list
//  *
//  */
// let _refreshing = false
// const refresh = async () => {
//   if (_refreshing || !(await hasToken())) return

//   _refreshing = true
//   await sendMessage({refreshing: true})
//   try {
//     await timeout(Promise.all([syncOptions(), syncLists()]), 20000)
//     await sendMessage({refreshed: {success: true}})
//   } catch (err) {
//     logger.error(err)
//     await sendMessage({refreshed: {success: false}})
//   } finally {
//     _refreshing = false
//   }
// }

// const login = async token => {
//   if (await hasToken()) return
//   await setToken(token)
//   const {uid} = await getInfo()
//   await sendMessage({logged: {uid}})
//   const loginNotificationId = 'login'
//   chrome.notifications.create(loginNotificationId, {
//     type: 'basic',
//     iconUrl: 'assets/icons/icon128.png',
//     title: 'you have login to boss successfully',
//     message: '',
//   })
//   setTimeout(() => {
//     chrome.notifications.clear(loginNotificationId)
//   }, 5000)
//   await refresh()
// }

// // _syncTimer is declared here
// let _syncTimer

// const initTimer = async () => {
//   // Use self instead of window for global state in service worker
//   if (_syncTimer || !(await isBackground())) return

//   const _nextTimer = time => {
//     _syncTimer = setTimeout(async () => {
//       if (await hasToken()) {
//         getInfo() // for update token
//         if (self._socket && self._socket.connected) {
//           refresh()
//           return _nextTimer(time)
//         }
//       }
//       _nextTimer(Math.min(time * 2, SYNC_MAX_INTERVAL))
//     }, time)
//   }

//   // Removed _refreshTimer as it was unused after event listeners were commented out
//   // const _refreshTimer = time => {
//   //   clearTimeout(_syncTimer)
//   //   _nextTimer(time)
//   // }

//   // Event listeners for offline/online are not directly available in Service Workers like this.
//   // Service Workers have fetch events, but not direct window.addEventListener('offline').
//   // This part might need a different approach if network status is critical.
//   // For now, commenting out to avoid errors.
//   // window.addEventListener('offline', () => _refreshTimer(SYNC_MAX_INTERVAL))
//   // window.addEventListener('online', () => _refreshTimer(SYNC_MIN_INTERVAL))

//   chrome.runtime.onMessage.addListener(({login, refreshed}) => {
//     if (login || refreshed && refreshed.success) self._nextSyncInterval = SYNC_MIN_INTERVAL
//   })
//   _nextTimer(SYNC_MIN_INTERVAL)
// }

// // _socket is declared here
// let _socket

// const init = async () => {
//   // Use self instead of window for global state in service worker
//   if (_socket || !await isBackground()) return
//   _socket = io(SYNC_SERVICE_URL, {path: '/ws', autoConnect: false}) // Assign to _socket
//   setWSToken(await getToken())
//   await listManager.init()
//   _socket.on('list.update', ({method, args}) => {
//     listManager[method](...args)
//   })
//   _socket.on('opts.set', async ({changes, time}) => {
//     const {opts} = await chrome.storage.local.get('opts')
//     for (const [k, v] of Object.entries(changes)) {
//       opts[k] = v
//     }
//     await chrome.storage.local.set({opts, optsUpdatedAt: time})
//   })
//   _socket.on('connect', () => refresh())
//   _socket.open()
//   initTimer()
// }

// export default {
//   getInfo,
//   removeToken,
//   hasToken,
//   login,
//   init,
//   refresh,
// }
````

## File: src/common/tabs.js
````javascript
import storage from './storage'
import {createNewTabList} from './list'
import listManager from './listManager'
import {ILLEGAL_URLS} from './constants'


const getAllInWindow = windowId => chrome.tabs.query({windowId})

const APP_TAB_ID_KEY = 'appTabIds' // Define a key for storing app tab IDs in storage

const openlists = async () => {
  const currentWindow = await chrome.windows.getCurrent()
  const windowId = currentWindow.id
  const listsUrl = chrome.runtime.getURL('index.html#/app/')

  // Retrieve stored appTabIds from local storage
  const storedData = await chrome.storage.local.get(APP_TAB_ID_KEY)
  const appTabIds = storedData[APP_TAB_ID_KEY] || {}

  if (windowId in appTabIds) {
    const tabs = await getAllInWindow(windowId)
    const tab = tabs.find(t => t.id === appTabIds[windowId])
    if (tab && tab.url.startsWith(listsUrl)) {
      // If the tab exists and is the correct URL, activate it
      return chrome.tabs.update(tab.id, { active: true })
    }
    // If tab doesn't exist or URL is wrong, remove it from tracking
    delete appTabIds[windowId]
    await chrome.storage.local.set({ [APP_TAB_ID_KEY]: appTabIds })
  }

  // Create a new tab and store its ID
  const createdTab = await chrome.tabs.create({ url: listsUrl })
  appTabIds[windowId] = createdTab.id
  await chrome.storage.local.set({ [APP_TAB_ID_KEY]: appTabIds })
}

const openAboutPage = () => {
  window.open(chrome.runtime.getURL('index.html#/app/about'))
}

const getSelectedTabs = () => chrome.tabs.query({highlighted: true, currentWindow: true})

const getAllTabsInCurrentWindow = async () => {
  const currentWindow = await chrome.windows.getCurrent()
  return getAllInWindow(currentWindow.id)
}

const groupTabsInCurrentWindow = async () => {
  const tabs = await getAllTabsInCurrentWindow()
  const result = { left: [], right: [], inter: [], all: tabs }
  let currentIsRight = false
  for (const tab of tabs) {
    if (tab.highlighted) {
      currentIsRight = true
      result.inter.push(tab)
    } else if (currentIsRight) result.right.push(tab)
    else result.left.push(tab)
  }
  result.twoSide = result.left.concat(result.right)
  return result
}

const isLegalURL = url => ILLEGAL_URLS.every(prefix => !url.startsWith(prefix))
const storeTabs = async (tabs, listIndex) => {
  const appUrl = chrome.runtime.getURL('')
  tabs = tabs.filter(i => !i.url.startsWith(appUrl))

  const opts = await storage.getOptions()
  if (opts.ignorePinned) tabs = tabs.filter(i => !i.pinned)
  if (opts.excludeIllegalURL) tabs = tabs.filter(i => isLegalURL(i.url))
  if (tabs.length === 0) return

  // 🔹 always start from persisted state
  const lists = await storage.getLists()

  if (listIndex == null) {
    const newList = createNewTabList({ tabs })
    if (opts.pinNewList) newList.pinned = true
    lists.unshift(newList)
  } else {
    const list = lists[listIndex]
    tabs.forEach(tab => list.tabs.push(tab))
  }

  // 🔴 THIS is the critical line
  await storage.setLists(lists)

  return chrome.tabs.remove(tabs.map(i => i.id))
}
const storeCurrentTab = async listIndex => {
  const tabs = await chrome.tabs.query({active: true, currentWindow: true})
  if (!tabs || tabs.length === 0) throw new Error('No active tab to stash')
  return storeTabs(tabs, listIndex)
}

const storeLeftTabs = async listIndex => storeTabs((await groupTabsInCurrentWindow()).left, listIndex)
const storeRightTabs = async listIndex => storeTabs((await groupTabsInCurrentWindow()).right, listIndex)
const storeTwoSideTabs = async listIndex => storeTabs((await groupTabsInCurrentWindow()).twoSide, listIndex)

const storeSelectedTabs = async listIndex => {
  const tabs = await getSelectedTabs()
  const allTabs = await getAllTabsInCurrentWindow()
  if (tabs.length === allTabs.length) await openlists()
  return storeTabs(tabs, listIndex)
}

const storeAllTabs = async listIndex => {
  const tabs = await getAllTabsInCurrentWindow()
  const opts = await storage.getOptions()
  if (opts.openTabListNoTab) await openlists()
  return storeTabs(tabs, listIndex)
}

const storeAllTabInAllWindows = async () => {
  const windows = await chrome.windows.getAll()
  const opts = await storage.getOptions()
  if (opts.openTabListNoTab) await openlists()
  const tasks = []
  for (const window of windows) {
    const task = getAllInWindow(window.id).then(storeTabs)
    tasks.push(task)
  }
  return Promise.all(tasks)
}

const restoreTabs = async (tabs, windowId) => {
  const opts = await storage.getOptions()
  let indexOffset = 0
  if (opts.openEnd) {
    const tabs = await getAllTabsInCurrentWindow()
    const {index} = tabs.pop()
    indexOffset = index + 1
  }
  for (let i = 0; i < tabs.length; i += 1) {
    const tab = tabs[i]
    const createdTab = await chrome.tabs.create({
      url: tab.url,
      pinned: tab.pinned,
      index: i + indexOffset,
      windowId,
    })
    if (tab.muted) chrome.tabs.update(createdTab.id, {muted: true})
  }
}

const restoreList = (list, windowId) => restoreTabs(list.tabs, windowId)

const restoreListInNewWindow = async list => {
  const createdWindow = await chrome.windows.create({url: list.tabs.map(i => i.url)})
  list.tabs.forEach((tab, index) => {
    if (tab.muted) chrome.tabs.update(createdWindow.tabs[index].id, {muted: true})
  })
}

const restoreLastestList = async () => {
  const lists = await storage.getLists()
  if (lists.length === 0) return true
  const [lastest] = lists
  await restoreList(lastest)
  if (lastest.pinned) return true
  return listManager.removeListById(lastest._id)
}

export default {
  getSelectedTabs,
  groupTabsInCurrentWindow,
  storeLeftTabs,
  storeRightTabs,
  storeSelectedTabs,
  storeTwoSideTabs,
  storeAllTabs,
  storeAllTabInAllWindows,
  storeCurrentTab,
  restoreTabs,
  restoreList,
  restoreListInNewWindow,
  restoreLastestList,
  openlists,
  openAboutPage,
}
````

## File: src/background/init.js
````javascript
/* eslint-disable */
import _ from 'lodash'
import tabs from '../common/tabs'
import options from '../common/options'
import storage from '../common/storage'
import migrate from '../common/migrate'
import boss from '../common/service/boss' // Keep import as it's commented out in boss.js
import { normalizeList } from '../common/list'
import commandHandler from './commandHandler'
import messageHandler from './messageHandler'
import listManager from '../common/listManager'
import { setupContextMenus, dynamicDisableMenu, handleContextMenuClicked } from './contextMenus'
import installedEventHandler from './installedEventHandler'
import { updateBrowserAction, getBrowserActionHandler, getCoverBrowserAction } from './browserAction'


// Global variables for the service worker context
let opts_global = {};
let nightmode_global = false;
let boss_token_global = null;
let updateVersion_global = null;
let drawer_global = false;

const initOptions = async () => {
  const opts = await storage.getOptions() || {}
  const defaultOptions = options.getDefaultOptions()

  if (_.keys(defaultOptions).some(key => !_.has(opts, key))) {
    _.defaults(opts, defaultOptions)
    await storage.setOptions(opts)
  }

  nightmode_global = opts.defaultNightMode
  opts_global = opts;
  const storedDrawer = await storage.get('drawer');
  drawer_global = _.defaultTo(storedDrawer, true);
  return opts
}

const storageChangedHandler = async changes => {
  console.debug('[storage changed]', changes)
  if (changes.boss_token) {
    boss_token_global = changes.boss_token.newValue
  }
  if (changes.opts) {
    opts_global = changes.opts.newValue || options.getDefaultOptions();
    nightmode_global = opts_global.defaultNightMode;
  }
  if (changes.drawer) {
    drawer_global = changes.newValue;
  }

  if (changes.lists) {
    if (opts_global.disableDynamicMenu) return
    await setupContextMenus(opts_global)
  }
}

const tabsChangedHandler = async activeInfo => {
  if (opts_global.disableDynamicMenu) return
  const currentCoverBrowserAction = getCoverBrowserAction();
  if (currentCoverBrowserAction) {
    await currentCoverBrowserAction(activeInfo);
  }
  dynamicDisableMenu()
}

const fixDirtyData = async () => {
  const unlock = await listManager.RWLock.lock()
  const { lists } = await chrome.storage.local.get('lists')
  if (lists) {
    const cleanLists = lists.filter(_.isPlainObject).map(normalizeList)
    await chrome.storage.local.set({ lists: cleanLists })
  }
  await unlock()
}

const init = async () => {
  try {
    // await logger.init() // The logger has been temporarily disabled for debugging
    await listManager.init()
    const opts = await initOptions()
    await setupContextMenus(opts)
    if (chrome?.contextMenus?.onClicked && !chrome.contextMenus.onClicked.hasListener(handleContextMenuClicked)) {
      chrome.contextMenus.onClicked.addListener(handleContextMenuClicked)
    }

    chrome.runtime.onInstalled.addListener(async () => {
      const opts = await initOptions();
      await setupContextMenus(opts);
    });
  const isServiceWorker =
    typeof chrome !== "undefined" &&
    chrome.runtime &&
    chrome.runtime.id &&
    !chrome.extension?.getViews?.({ type: "popup" })?.length;


  // Around line 99
  if (typeof chrome.commands !== 'undefined' && chrome.commands.getAll) {
      chrome.commands.getAll((commands) => {
          // ... existing internal logic if there was any ...
      });
  } else {
      console.log("Commands API not available, skipping initialization of shortcuts.");
  }
    chrome.runtime.onMessageExternal.addListener(commandHandler)
    chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
      if (msg.type === 'getGlobalState') {
        if (msg.key === 'drawer') {
          sendResponse({ [msg.key]: drawer_global });
        } else if (msg.key === 'nightmode') {
          sendResponse({ [msg.key]: nightmode_global });
        }
        return true;
      }

      if (msg.type === 'setGlobalState') {
        (async () => {
          if (msg.key === 'drawer') {
            drawer_global = msg.value;
            await storage.set({ drawer: msg.value });
          } else if (msg.key === 'nightmode') {
            nightmode_global = msg.value;
            const currentOpts = await storage.getOptions();
            currentOpts.defaultNightMode = msg.value;
            await storage.setOptions(currentOpts);
          }
          sendResponse({ success: true });
        })();
        return true;
      }

      messageHandler(msg);
    });
    chrome.runtime.onUpdateAvailable.addListener(detail => { updateVersion_global = detail.version })
    chrome.action.onClicked.addListener(async () => {
      const handler = getBrowserActionHandler(opts_global.browserAction)
      if (handler) {
        await handler()
      }
    });
    chrome.tabs.onActivated.addListener(_.debounce(tabsChangedHandler, 200));
    chrome.storage.onChanged.addListener(storageChangedHandler);



    await migrate()
    await fixDirtyData()

  } catch (error) {
    console.error("A critical error occurred during background script initialization:", error);
  }
}

export default init
````

## File: README.md
````markdown
# IceTab: Better OneTab **RELOADED**

**(Based on the archived [Better OneTab](https://github.com/cnwangjie/better-onetab) by cnwangjie)**

This project is a continuation and maintenance effort for the excellent [Better OneTab extension](https://github.com/cnwangjie/better-onetab) which has been archived by its original author, cnwangjie. My goal is to keep the project updated and address bugs, as I use the extension... extensively myself.

---

<p align="center">
  <img src="IceTab_banner.png">
</p>

<p align="center">
<a href="https://github.com/elijahcommits/icetab/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=elijahcommits/icetab" />
</a>
<p align="center">^graphic made using <a href="https://contrib.rocks">contrib.rocks</a></p>
</p>

<!-- <p align="center">
<a href="https://circleci.com/gh/cnwangjie/better-onetab"><img src="https://img.shields.io/circleci/project/github/cnwangjie/better-onetab/master.svg?style=flat-square" alt="CircleCI"></a>
<a href="https://chrome.google.com/webstore/detail/better-onetab/eookhngofldnbnidjlbkeecljkfpmfpg"><img src="https://img.shields.io/chrome-web-store/v/eookhngofldnbnidjlbkeecljkfpmfpg.svg?style=flat-square" alt="Chrome Web Store"></a>
<a href="https://addons.mozilla.org/firefox/addon/better-onetab/"><img src="https://img.shields.io/amo/v/better-onetab.svg?style=flat-square" alt="Mozilla Add-ons"></a>
<img src="https://img.shields.io/github/license/cnwangjie/better-onetab.svg?style=flat-square" alt="GitHub">
<img src="https://img.shields.io/github/last-commit/cnwangjie/better-onetab.svg?style=flat-square" alt="GitHub last commit">
<a href="https://gitter.im/better-onetab/Lobby?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge"><img src="https://img.shields.io/gitter/room/better-onetab/Lobby.svg?style=flat-square" alt="Join the chat at https://gitter.im/better-onetab/Lobby"></a>
</p> -->

### A better OneTab extension

More beautiful and more feature.

### Features

[Send us a feature request.](https://github.com/elijahcommits/icetab/issues/new)

 - [x] Basic features of OneTab
 - [x] Dark Mode / Night Mode!
 - [x] Popup page with simple list
 - [x] Pin tab list
 - [x] Keyboard shortcuts
 - [x] Options
 - [x] Drag and drop re-ordering
 - [x] Data & Options sync
 - [x] Import & Export
 - [x] Add stored tabs to history
 - [x] I18N support (only English & Chinese currently)

More details in [changelog](CHANGELOG.md)

### Next step

You can learn more about the next steps of IceTab at [project page](https://github.com/elijahcommits/IceTab/projects/1) and leave your comment in [issues page](https://github.com/elijahcommits/better-onetab/issues).

### Installation

Build your own from following steps：

### Development / Build From Source

0. Clone this repo
0. Install dependencies (use `yarn install` command while in the root directory)
0. Auto reload (for developers - use `yarn dev` command while in the root directory)
0. Build (use `NODE_OPTIONS=--openssl-legacy-provider yarn build` command while in the root directory)
0. Click LOAD UNPACKED button and select ./dist path


### Regular Install (for those who aren't raging nerds like myself)

0. Download the dist.crx file from the ./crx folder.
0. Drag the .crx file directly into your Extensions page (Settings > Extensions > Manage Extensions).
0. Please let me know if these instructions don't work for you.

### Special thanks

Thanks for [@cnwangjie](https://github.com/cnwangjie/) for developing the original version of this app, and for giving me permission to continue his legacy. -Elijah

### License

MIT LICENSE

---
````

## File: webpack.common.js
````javascript
/* eslint-disable */
const webpack = require('webpack')
const { merge } = require('webpack-merge')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const sveltePreprocess = require('svelte-preprocess')
const path = require('path')

const isDevelopment = process.env.NODE_ENV === 'development';
const mode = process.env.NODE_ENV || 'development'
const PRODUCTION = mode !== 'development';

const clientConfig = {
  development: {
    __CLIENT_ID__: '530831729511-eq8apt6dhjimbmdli90jp2ple0lfmn3l.apps.googleusercontent.com',
    __DEV_CSP_SCRIPT__: '',
    __DEV_CSP_CONNECT__: '',
    __EXT_NAME__: 'IceTab (dev)',
    __CONTENT_SCRIPTS_MATCHES__: process.env.MOZ ? '*://*/*' : 'http://127.0.0.1:8000/*',
  },
  production: {
    __CLIENT_ID__: '530831729511-dclgvblhv7var13mvpjochb5f295a6vc.apps.googleusercontent.com',
    __DEV_CSP_SCRIPT__: '',
    __DEV_CSP_CONNECT__: '',
    __EXT_NAME__: '__MSG_ext_name__',
    __CONTENT_SCRIPTS_MATCHES__: 'https://boss.cnwangjie.com/*',
  }
}

const resolve = (...paths) => path.join(__dirname, ...paths)
const moz = process.env.MOZ

module.exports = {
  entry: {
    app: './src/app/index.js',
    background: './src/background/index.js',
    content: './src/content.js',
    gdrive_sandbox: './src/gdrive_sandbox.js',
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/',
    clean: true,
  },
  mode: mode,

  plugins: [
    new CleanWebpackPlugin(),

    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(mode),
      'PRODUCTION': JSON.stringify(PRODUCTION),
      'DEBUG': JSON.stringify(isDevelopment),
      ...clientConfig[mode],
    }),

    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'src/manifest.json',
          to: 'manifest.json',
          // The broken transform function has been removed to ensure a clean copy.
        },
        { from: 'src/assets', to: 'assets' },
        { from: 'src/_locales', to: '_locales' },
        { from: 'src/gdrive_sandbox.html', to: 'gdrive_sandbox.html' },
      ],
    }),

    new HtmlWebpackPlugin({
      filename: 'popup.html',
      template: 'src/app/index.html',
      chunks: ['app'],
      inject: true,
      minify: PRODUCTION ? {
        removeComments: true,
        collapseWhitespace: true,
        removeAttributeQuotes: true
      } : false,
    }),

    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'src/app/index.html',
      chunks: ['app'],
      excludeChunks: ['background', 'content', 'gdrive_sandbox'],
      inject: true,
      minify: PRODUCTION ? {
        removeComments: true,
        collapseWhitespace: true,
        removeAttributeQuotes: true
      } : false,
    }),
  ],
  performance: {
    hints: false,
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: (chunk) => {
            return chunk.name === 'app';
          }
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
    extensions: ['.mjs', '.js', '.svelte', '.json'],
    conditionNames: ['svelte', 'browser', 'import', 'default'],
    mainFields: ['svelte', 'browser', 'module', 'main'],
    fullySpecified: false
  },
  module: {
    rules: [
      {
        test: /\.svelte$/,
        use: {
          loader: 'svelte-loader',
          options: {
            compilerOptions: {
              dev: isDevelopment,
              runes: true,
            },
            emitCss: true,
            hotReload: false
          }
        }
      },
      {
        test: /\.svelte\.js$/,
        use: {
          loader: 'svelte-loader',
          options: {
            compilerOptions: {
              dev: isDevelopment,
              runes: true,
            },
            emitCss: false,
            hotReload: false
          }
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  },
  stats: {
    errorDetails: true,
    reasons: true,
    moduleTrace: true,
  }
}
````

## File: package.json
````json
{
  "name": "squirreltab",
  "version": "1.0.0",
  "description": "like OneTab, except better + open-source",
  "main": "index.js",
  "repository": "https://github.com/elijahcommits/icetab",
  "author": "cnwangjie / elijahcommits",
  "license": "MIT",
  "scripts": {
    "dev": "cross-env NODE_ENV=development webpack --config webpack.dev.js --watch",
    "serve": "cross-env NODE_ENV=development webpack serve --config webpack.serve.js",
    "dev:moz": "cross-env MOZ=1 npm run dev",
    "build": "cross-env NODE_ENV=production webpack --config webpack.prod.js",
    "postbuild": "npm run package",
    "package": "cd dist && powershell Compress-Archive -Path * -DestinationPath ../dist.zip -Force",
    "lint": "eslint src --ext js",
    "prebuild": "npm run lint",
    "validate": "bash scripts/validate-build.sh"
  },
  "dependencies": {
    "date-fns": "^2.30.0",
    "downloadjs": "^1.4.7",
    "lodash": "^4.17.21",
    "material-design-icons-iconfont": "^3.0.3",
    "moment": "^2.29.4",
    "regenerator-runtime": "^0.14.1",
    "socket.io-client": "^4.7.5",
    "webextension-polyfill": "^0.10.0"
  },
  "devDependencies": {
    "@babel/core": "^7.27.4",
    "@babel/eslint-parser": "^7.24.7",
    "@babel/plugin-syntax-dynamic-import": "^7.8.3",
    "@babel/preset-env": "^7.27.2",
    "@cnwangjie/eslint-config": "^1.3.0",
    "@sveltejs/vite-plugin-svelte": "^3.1.2",
    "babel-loader": "^10.0.0",
    "clean-webpack-plugin": "^4.0.0",
    "copy-webpack-plugin": "^13.0.1",
    "cross-env": "^7.0.3",
    "css-loader": "^7.1.2",
    "eslint": "^8.57.0",
    "file-loader": "^6.2.0",
    "html-loader": "^5.1.0",
    "html-webpack-plugin": "^5.6.6",
    "markdown-loader": "^8.0.0",
    "sass": "^1.97.3",
    "sass-loader": "^14.2.1",
    "style-loader": "^4.0.0",
    "stylus": "^0.63.0",
    "stylus-loader": "^8.1.0",
    "svelte": "^5.48.2",
    "svelte-loader": "^3.2.4",
    "svelte-preprocess": "^6.0.3",
    "terser-webpack-plugin": "^5.3.10",
    "webpack": "^5.99.9",
    "webpack-cli": "^5.1.4",
    "webpack-dev-server": "^5.2.3",
    "webpack-merge": "^5.10.0"
  },
  "sideEffects": [
    "**/index.js",
    "*.css",
    "*.styl"
  ]
}
````

## File: src/manifest.json
````json
{
  "manifest_version": 3,
  "name": "__MSG_ext_name__",
  "version": "2025.6.10.04",
  "default_locale": "en",
  "description": "__MSG_ext_desc__",
  "icons": {
    "16": "assets/icons/icon16.png",
    "32": "assets/icons/icon32.png",
    "48": "assets/icons/icon48.png",
    "128": "assets/icons/icon128.png"
  },
  "background": {
    "service_worker": "background.js"
  },
  "action": {
    "default_title": "__MSG_ext_name__",
    "default_icon": {
      "16": "assets/icons/icon16.png",
      "32": "assets/icons/icon32.png",
      "48": "assets/icons/icon48.png"
    },
    "default_popup": "index.html?context=popup"
  },
  "options_page": "index.html#/app/options",
  "permissions": [
    "identity",
    "commands",
    "contextMenus",
    "storage",
    "tabs"
  ],
  "host_permissions": [
    "<all_urls>"
  ],
  "content_security_policy": {
    "extension_pages": "script-src 'self' 'wasm-unsafe-eval'; object-src 'self';"
  },
  "sandbox": {
    "pages": [
      "gdrive_sandbox.html"
    ]
  },
  "web_accessible_resources": [
    {
      "resources": [
        "*",
        "gdrive_sandbox.html"
      ],
      "matches": [
        "<all_urls>"
      ]
    }
  ]
}
````
