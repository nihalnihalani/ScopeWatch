> ## Documentation Index
>
> Fetch the complete documentation index at: [/llms.txt](https://docs.guild.ai/llms.txt)
>
> Use this file to discover all available pages before exploring further.

[Skip to main content](https://docs.guild.ai/api-reference/workspaces/start-a-session-in-a-workspace#content-area)

[Guild home page![light logo](https://mintcdn.com/guildai/x-xVeOd53CpYbehm/logo/light.svg?fit=max&auto=format&n=x-xVeOd53CpYbehm&q=85&s=21393c9a072674c192091492cc76f441)![dark logo](https://mintcdn.com/guildai/x-xVeOd53CpYbehm/logo/dark.svg?fit=max&auto=format&n=x-xVeOd53CpYbehm&q=85&s=d6acfb4e042a02c7229b6dea41c1a957)](https://docs.guild.ai/)

- [Guides](https://docs.guild.ai/)
- [CLI](https://docs.guild.ai/cli/getting-started)
- [SDK](https://docs.guild.ai/packages/agents-sdk)
- [API Reference](https://docs.guild.ai/api-reference/introduction)
- [Integrations](https://docs.guild.ai/integrations/overview)
- [Examples](https://docs.guild.ai/examples/overview)

Search...

Ctrl KAsk AssistantCTRLI

- [guild.ai](https://guild.ai/)
- [Sign in](https://app.guild.ai/)

[Guild home page![light logo](https://mintcdn.com/guildai/x-xVeOd53CpYbehm/logo/light.svg?fit=max&auto=format&n=x-xVeOd53CpYbehm&q=85&s=21393c9a072674c192091492cc76f441)![dark logo](https://mintcdn.com/guildai/x-xVeOd53CpYbehm/logo/dark.svg?fit=max&auto=format&n=x-xVeOd53CpYbehm&q=85&s=d6acfb4e042a02c7229b6dea41c1a957)](https://docs.guild.ai/)

Search or ask...

Navigation

Workspaces

Start a session in a workspace

### Get Started

- [Introduction](https://docs.guild.ai/api-reference/introduction)
- [Conversations](https://docs.guild.ai/api-reference/conversations)

### OAuth

- [POST\\
\\
Register an OAuth client](https://docs.guild.ai/api-reference/oauth/register-an-oauth-client)

### Workspaces

- [POST\\
\\
Create a workspace](https://docs.guild.ai/api-reference/workspaces/create-a-workspace)
- [GET\\
\\
Get a workspace](https://docs.guild.ai/api-reference/workspaces/get-a-workspace)
- [GET\\
\\
List a workspace's installed agents](https://docs.guild.ai/api-reference/workspaces/list-a-workspaces-installed-agents)
- [POST\\
\\
Add an agent to a workspace](https://docs.guild.ai/api-reference/workspaces/add-an-agent-to-a-workspace)
- [GET\\
\\
List a workspace agent's credential associations](https://docs.guild.ai/api-reference/workspaces/list-a-workspace-agents-credential-associations)
- [POST\\
\\
Share an existing credential with a workspace agent](https://docs.guild.ai/api-reference/workspaces/share-an-existing-credential-with-a-workspace-agent)
- [DEL\\
\\
Disconnect a credential association from a workspace agent](https://docs.guild.ai/api-reference/workspaces/disconnect-a-credential-association-from-a-workspace-agent)
- [POST\\
\\
Mint an API-key credential for a workspace agent](https://docs.guild.ai/api-reference/workspaces/mint-an-api-key-credential-for-a-workspace-agent)
- [GET\\
\\
List a workspace's sessions](https://docs.guild.ai/api-reference/workspaces/list-a-workspaces-sessions)
- [POST\\
\\
Start a session in a workspace](https://docs.guild.ai/api-reference/workspaces/start-a-session-in-a-workspace)
- [POST\\
\\
Create a trigger in a workspace](https://docs.guild.ai/api-reference/workspaces/create-a-trigger-in-a-workspace)

### Agents

- [GET\\
\\
List agents](https://docs.guild.ai/api-reference/agents/list-agents)
- [POST\\
\\
Create an agent](https://docs.guild.ai/api-reference/agents/create-an-agent)
- [GET\\
\\
Get an agent](https://docs.guild.ai/api-reference/agents/get-an-agent)
- [GET\\
\\
List an agent's versions](https://docs.guild.ai/api-reference/agents/list-an-agents-versions)
- [POST\\
\\
Configure an LLM agent](https://docs.guild.ai/api-reference/agents/configure-an-llm-agent)
- [POST\\
\\
Publish an agent version](https://docs.guild.ai/api-reference/agents/publish-an-agent-version)

### Sessions

- [GET\\
\\
Get a session](https://docs.guild.ai/api-reference/sessions/get-a-session)
- [GET\\
\\
Fetch session events](https://docs.guild.ai/api-reference/sessions/fetch-session-events)
- [POST\\
\\
Post a follow-up event to a session](https://docs.guild.ai/api-reference/sessions/post-a-follow-up-event-to-a-session)
- [GET\\
\\
Fetch session sub-tasks](https://docs.guild.ai/api-reference/sessions/fetch-session-sub-tasks)
- [GET\\
\\
Fetch session runtimes](https://docs.guild.ai/api-reference/sessions/fetch-session-runtimes)

### Skills

- [GET\\
\\
Get a skill](https://docs.guild.ai/api-reference/skills/get-a-skill)
- [POST\\
\\
Create a skill version](https://docs.guild.ai/api-reference/skills/create-a-skill-version)

### Accounts

- [GET\\
\\
Identify the calling key](https://docs.guild.ai/api-reference/accounts/identify-the-calling-key)
- [GET\\
\\
List an account's workspaces](https://docs.guild.ai/api-reference/accounts/list-an-accounts-workspaces)
- [GET\\
\\
List an account's skills](https://docs.guild.ai/api-reference/accounts/list-an-accounts-skills)
- [POST\\
\\
Create a skill under an account](https://docs.guild.ai/api-reference/accounts/create-a-skill-under-an-account)

Workspaces

# Start a session in a workspace

Copy pageCopy page

Requires `sessions:write` on a workspace the key’s account owns. `chat` is the only `session_type` a key may create — `time`, `webhook`, `api_trigger`, and `agent_test` sessions are a `403`. The key is recorded as the session’s `initiator` (serialized `type: "api_key"`), and the agent begins executing `initial_prompt` immediately.

Copy pageCopy page

POST

/

workspaces

/

{workspace\_id\_or\_name}

/

sessions

Try it

Start a session in a workspace

cURL

```
curl --request POST \
  --url https://api.guild.ai/v1/workspaces/{workspace_id_or_name}/sessions \
  --header 'Authorization: Basic <encoded-value>' \
  --header 'Content-Type: application/json' \
  --data '
{
  "session_type": "chat",
  "agent_id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",
  "initial_prompt": "<string>"
}
'
```

```
import requests

url = "https://api.guild.ai/v1/workspaces/{workspace_id_or_name}/sessions"

payload = {
    "session_type": "chat",
    "agent_id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",
    "initial_prompt": "<string>"
}
headers = {
    "Authorization": "Basic <encoded-value>",
    "Content-Type": "application/json"
}

response = requests.post(url, json=payload, headers=headers)

print(response.text)
```

```
const options = {
  method: 'POST',
  headers: {Authorization: 'Basic <encoded-value>', 'Content-Type': 'application/json'},
  body: JSON.stringify({
    session_type: 'chat',
    agent_id: '3c90c3cc-0d44-4b50-8888-8dd25736052a',
    initial_prompt: '<string>'
  })
};

fetch('https://api.guild.ai/v1/workspaces/{workspace_id_or_name}/sessions', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));
```

```
<?php

$curl = curl_init();

curl_setopt_array($curl, [\
  CURLOPT_URL => "https://api.guild.ai/v1/workspaces/{workspace_id_or_name}/sessions",\
  CURLOPT_RETURNTRANSFER => true,\
  CURLOPT_ENCODING => "",\
  CURLOPT_MAXREDIRS => 10,\
  CURLOPT_TIMEOUT => 30,\
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,\
  CURLOPT_CUSTOMREQUEST => "POST",\
  CURLOPT_POSTFIELDS => json_encode([\
    'session_type' => 'chat',\
    'agent_id' => '3c90c3cc-0d44-4b50-8888-8dd25736052a',\
    'initial_prompt' => '<string>'\
  ]),\
  CURLOPT_HTTPHEADER => [\
    "Authorization: Basic <encoded-value>",\
    "Content-Type: application/json"\
  ],\
]);

$response = curl_exec($curl);
$err = curl_error($curl);

curl_close($curl);

if ($err) {
  echo "cURL Error #:" . $err;
} else {
  echo $response;
}
```

```
package main

import (
	"fmt"
	"strings"
	"net/http"
	"io"
)

func main() {

	url := "https://api.guild.ai/v1/workspaces/{workspace_id_or_name}/sessions"

	payload := strings.NewReader("{\n  \"session_type\": \"chat\",\n  \"agent_id\": \"3c90c3cc-0d44-4b50-8888-8dd25736052a\",\n  \"initial_prompt\": \"<string>\"\n}")

	req, _ := http.NewRequest("POST", url, payload)

	req.Header.Add("Authorization", "Basic <encoded-value>")
	req.Header.Add("Content-Type", "application/json")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(string(body))

}
```

```
HttpResponse<String> response = Unirest.post("https://api.guild.ai/v1/workspaces/{workspace_id_or_name}/sessions")
  .header("Authorization", "Basic <encoded-value>")
  .header("Content-Type", "application/json")
  .body("{\n  \"session_type\": \"chat\",\n  \"agent_id\": \"3c90c3cc-0d44-4b50-8888-8dd25736052a\",\n  \"initial_prompt\": \"<string>\"\n}")
  .asString();
```

```
require 'uri'
require 'net/http'

url = URI("https://api.guild.ai/v1/workspaces/{workspace_id_or_name}/sessions")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Post.new(url)
request["Authorization"] = 'Basic <encoded-value>'
request["Content-Type"] = 'application/json'
request.body = "{\n  \"session_type\": \"chat\",\n  \"agent_id\": \"3c90c3cc-0d44-4b50-8888-8dd25736052a\",\n  \"initial_prompt\": \"<string>\"\n}"

response = http.request(request)
puts response.read_body
```

200

400

401

403

```
{
  "id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",
  "created_at": "2023-11-07T05:31:56Z",
  "updated_at": "2023-11-07T05:31:56Z",
  "initiator_id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",
  "test_type": "MANUAL",
  "version_override_id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",
  "workspace_id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",
  "context_id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",
  "context_override_id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",
  "interrupted_at": "2023-11-07T05:31:56Z",
  "interrupted_by_id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",
  "seed_context": "<string>"
}
```

```
{
  "error": "<string>",
  "message": "<string>"
}
```

```
{
  "error": "<string>",
  "message": "<string>"
}
```

```
{
  "error": "<string>",
  "message": "<string>"
}
```

#### Authorizations

[​](https://docs.guild.ai/api-reference/workspaces/start-a-session-in-a-workspace#authorization-authorization)

Authorization

string

header

required

Account API key: key id as the username, secret as the password.

#### Path Parameters

[​](https://docs.guild.ai/api-reference/workspaces/start-a-session-in-a-workspace#parameter-workspace-id-or-name)

workspace\_id\_or\_name

string

required

#### Body

application/json

[​](https://docs.guild.ai/api-reference/workspaces/start-a-session-in-a-workspace#body-session-type)

session\_type

enum<string>

required

The only value a key may pass.

Available options:

`chat`

[​](https://docs.guild.ai/api-reference/workspaces/start-a-session-in-a-workspace#body-agent-id)

agent\_id

string<uuid>

required

[​](https://docs.guild.ai/api-reference/workspaces/start-a-session-in-a-workspace#body-initial-prompt)

initial\_prompt

string

required

#### Response

200

application/json

Successful response

- Option 1

- Option 2

- Option 3

- Option 4

- Option 5


[​](https://docs.guild.ai/api-reference/workspaces/start-a-session-in-a-workspace#response-one-of-0-id)

id

string<uuid>

[​](https://docs.guild.ai/api-reference/workspaces/start-a-session-in-a-workspace#response-one-of-0-created-at)

created\_at

string<date-time>

[​](https://docs.guild.ai/api-reference/workspaces/start-a-session-in-a-workspace#response-one-of-0-updated-at)

updated\_at

string<date-time>

[​](https://docs.guild.ai/api-reference/workspaces/start-a-session-in-a-workspace#response-one-of-0-initiator-id)

initiator\_id

string<uuid>

The user who started this agent test session.

[​](https://docs.guild.ai/api-reference/workspaces/start-a-session-in-a-workspace#response-one-of-0-test-type)

test\_type

enum<string>

Eval trials run as agent-test sessions; this separates them from sessions a person started from the agent editor.

Available options:

`MANUAL`,

`EVAL`

[​](https://docs.guild.ai/api-reference/workspaces/start-a-session-in-a-workspace#response-one-of-0-version-override-id)

version\_override\_id

string<uuid>

The specific agent version being tested in this session.

[​](https://docs.guild.ai/api-reference/workspaces/start-a-session-in-a-workspace#response-one-of-0-workspace-id)

workspace\_id

string<uuid>

The workspace this session belongs to.

[​](https://docs.guild.ai/api-reference/workspaces/start-a-session-in-a-workspace#response-one-of-0-context-id-one-of-0)

context\_id

string<uuid> \| null

The context used in this session, if available.

[​](https://docs.guild.ai/api-reference/workspaces/start-a-session-in-a-workspace#response-one-of-0-context-override-id-one-of-0)

context\_override\_id

string<uuid> \| null

Optional context override for testing purposes.

[​](https://docs.guild.ai/api-reference/workspaces/start-a-session-in-a-workspace#response-one-of-0-interrupted-at-one-of-0)

interrupted\_at

string<date-time> \| null

Timestamp when this session was interrupted by a user. If set, no new messages can be sent and tasks cannot be executed.

[​](https://docs.guild.ai/api-reference/workspaces/start-a-session-in-a-workspace#response-one-of-0-interrupted-by-id-one-of-0)

interrupted\_by\_id

string<uuid> \| null

User who interrupted this session.

[​](https://docs.guild.ai/api-reference/workspaces/start-a-session-in-a-workspace#response-one-of-0-seed-context-one-of-0)

seed\_context

string \| null

Optional hidden pre-seed text for this session only, prepended to the agent's context on the first turn (e.g. the onboarding handoff tour transcript). Not a workspace context.

[List a workspace's sessions\\
\\
Previous](https://docs.guild.ai/api-reference/workspaces/list-a-workspaces-sessions) [Create a trigger in a workspace\\
\\
Next](https://docs.guild.ai/api-reference/workspaces/create-a-trigger-in-a-workspace)

Ctrl+I

Start a session in a workspace

cURL

```
curl --request POST \
  --url https://api.guild.ai/v1/workspaces/{workspace_id_or_name}/sessions \
  --header 'Authorization: Basic <encoded-value>' \
  --header 'Content-Type: application/json' \
  --data '
{
  "session_type": "chat",
  "agent_id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",
  "initial_prompt": "<string>"
}
'
```

```
import requests

url = "https://api.guild.ai/v1/workspaces/{workspace_id_or_name}/sessions"

payload = {
    "session_type": "chat",
    "agent_id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",
    "initial_prompt": "<string>"
}
headers = {
    "Authorization": "Basic <encoded-value>",
    "Content-Type": "application/json"
}

response = requests.post(url, json=payload, headers=headers)

print(response.text)
```

```
const options = {
  method: 'POST',
  headers: {Authorization: 'Basic <encoded-value>', 'Content-Type': 'application/json'},
  body: JSON.stringify({
    session_type: 'chat',
    agent_id: '3c90c3cc-0d44-4b50-8888-8dd25736052a',
    initial_prompt: '<string>'
  })
};

fetch('https://api.guild.ai/v1/workspaces/{workspace_id_or_name}/sessions', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));
```

```
<?php

$curl = curl_init();

curl_setopt_array($curl, [\
  CURLOPT_URL => "https://api.guild.ai/v1/workspaces/{workspace_id_or_name}/sessions",\
  CURLOPT_RETURNTRANSFER => true,\
  CURLOPT_ENCODING => "",\
  CURLOPT_MAXREDIRS => 10,\
  CURLOPT_TIMEOUT => 30,\
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,\
  CURLOPT_CUSTOMREQUEST => "POST",\
  CURLOPT_POSTFIELDS => json_encode([\
    'session_type' => 'chat',\
    'agent_id' => '3c90c3cc-0d44-4b50-8888-8dd25736052a',\
    'initial_prompt' => '<string>'\
  ]),\
  CURLOPT_HTTPHEADER => [\
    "Authorization: Basic <encoded-value>",\
    "Content-Type: application/json"\
  ],\
]);

$response = curl_exec($curl);
$err = curl_error($curl);

curl_close($curl);

if ($err) {
  echo "cURL Error #:" . $err;
} else {
  echo $response;
}
```

```
package main

import (
	"fmt"
	"strings"
	"net/http"
	"io"
)

func main() {

	url := "https://api.guild.ai/v1/workspaces/{workspace_id_or_name}/sessions"

	payload := strings.NewReader("{\n  \"session_type\": \"chat\",\n  \"agent_id\": \"3c90c3cc-0d44-4b50-8888-8dd25736052a\",\n  \"initial_prompt\": \"<string>\"\n}")

	req, _ := http.NewRequest("POST", url, payload)

	req.Header.Add("Authorization", "Basic <encoded-value>")
	req.Header.Add("Content-Type", "application/json")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(string(body))

}
```

```
HttpResponse<String> response = Unirest.post("https://api.guild.ai/v1/workspaces/{workspace_id_or_name}/sessions")
  .header("Authorization", "Basic <encoded-value>")
  .header("Content-Type", "application/json")
  .body("{\n  \"session_type\": \"chat\",\n  \"agent_id\": \"3c90c3cc-0d44-4b50-8888-8dd25736052a\",\n  \"initial_prompt\": \"<string>\"\n}")
  .asString();
```

```
require 'uri'
require 'net/http'

url = URI("https://api.guild.ai/v1/workspaces/{workspace_id_or_name}/sessions")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Post.new(url)
request["Authorization"] = 'Basic <encoded-value>'
request["Content-Type"] = 'application/json'
request.body = "{\n  \"session_type\": \"chat\",\n  \"agent_id\": \"3c90c3cc-0d44-4b50-8888-8dd25736052a\",\n  \"initial_prompt\": \"<string>\"\n}"

response = http.request(request)
puts response.read_body
```

200

400

401

403

```
{
  "id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",
  "created_at": "2023-11-07T05:31:56Z",
  "updated_at": "2023-11-07T05:31:56Z",
  "initiator_id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",
  "test_type": "MANUAL",
  "version_override_id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",
  "workspace_id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",
  "context_id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",
  "context_override_id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",
  "interrupted_at": "2023-11-07T05:31:56Z",
  "interrupted_by_id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",
  "seed_context": "<string>"
}
```

```
{
  "error": "<string>",
  "message": "<string>"
}
```

```
{
  "error": "<string>",
  "message": "<string>"
}
```

```
{
  "error": "<string>",
  "message": "<string>"
}
```

[Guild home page![light logo](https://mintcdn.com/guildai/x-xVeOd53CpYbehm/logo/light.svg?fit=max&auto=format&n=x-xVeOd53CpYbehm&q=85&s=21393c9a072674c192091492cc76f441)![dark logo](https://mintcdn.com/guildai/x-xVeOd53CpYbehm/logo/dark.svg?fit=max&auto=format&n=x-xVeOd53CpYbehm&q=85&s=d6acfb4e042a02c7229b6dea41c1a957)](https://docs.guild.ai/)

[github](https://github.com/guildaidev) [discord](https://discord.gg/guild-ai)

[About](https://www.guild.ai/about) [Contact](https://www.guild.ai/contact) [Privacy policy](https://www.guild.ai/privacy-policy) [Terms](https://www.guild.ai/terms)

[github](https://github.com/guildaidev) [discord](https://discord.gg/guild-ai)

Assistant

Responses are generated using AI and may contain mistakes.