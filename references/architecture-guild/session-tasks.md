> ## Documentation Index
>
> Fetch the complete documentation index at: [/llms.txt](https://docs.guild.ai/llms.txt)
>
> Use this file to discover all available pages before exploring further.

[Skip to main content](https://docs.guild.ai/api-reference/sessions/fetch-session-sub-tasks#content-area)

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

Sessions

Fetch session sub-tasks

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

Sessions

# Fetch session sub-tasks

Copy pageCopy page

Requires `workspaces:read` and `agents:read` — see the note on session events above about the `500` when `agents:read` is missing.

Copy pageCopy page

GET

/

sessions

/

{session\_id}

/

tasks

Try it

Fetch session sub-tasks

cURL

```
curl --request GET \
  --url 'https://api.guild.ai/v1/sessions/{session_id}/tasks?limit=20' \
  --header 'Authorization: Basic <encoded-value>'
```

```
import requests

url = "https://api.guild.ai/v1/sessions/{session_id}/tasks?limit=20"

headers = {"Authorization": "Basic <encoded-value>"}

response = requests.get(url, headers=headers)

print(response.text)
```

```
const options = {method: 'GET', headers: {Authorization: 'Basic <encoded-value>'}};

fetch('https://api.guild.ai/v1/sessions/{session_id}/tasks?limit=20', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));
```

```
<?php

$curl = curl_init();

curl_setopt_array($curl, [\
  CURLOPT_URL => "https://api.guild.ai/v1/sessions/{session_id}/tasks?limit=20",\
  CURLOPT_RETURNTRANSFER => true,\
  CURLOPT_ENCODING => "",\
  CURLOPT_MAXREDIRS => 10,\
  CURLOPT_TIMEOUT => 30,\
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,\
  CURLOPT_CUSTOMREQUEST => "GET",\
  CURLOPT_HTTPHEADER => [\
    "Authorization: Basic <encoded-value>"\
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
	"net/http"
	"io"
)

func main() {

	url := "https://api.guild.ai/v1/sessions/{session_id}/tasks?limit=20"

	req, _ := http.NewRequest("GET", url, nil)

	req.Header.Add("Authorization", "Basic <encoded-value>")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(string(body))

}
```

```
HttpResponse<String> response = Unirest.get("https://api.guild.ai/v1/sessions/{session_id}/tasks?limit=20")
  .header("Authorization", "Basic <encoded-value>")
  .asString();
```

```
require 'uri'
require 'net/http'

url = URI("https://api.guild.ai/v1/sessions/{session_id}/tasks?limit=20")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Get.new(url)
request["Authorization"] = 'Basic <encoded-value>'

response = http.request(request)
puts response.read_body
```

200

401

404

```
{
  "items": [\
    {\
      "id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",\
      "created_at": "2023-11-07T05:31:56Z",\
      "updated_at": "2023-11-07T05:31:56Z",\
      "session_id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",\
      "status": "CREATED",\
      "notified_at": "2023-11-07T05:31:56Z",\
      "parent_task_id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",\
      "runtime_id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",\
      "saved_state": "<string>",\
      "span_id": "<unknown>",\
      "trace_id": null,\
      "version_id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",\
      "agent": "<unknown>",\
      "cache_read_tokens": "<unknown>",\
      "cache_write_tokens": "<unknown>",\
      "input_tokens": "<unknown>",\
      "llm_call_count": "<unknown>",\
      "output_tokens": "<unknown>",\
      "parent_task": "<unknown>",\
      "token_usage": "<unknown>",\
      "total_tokens": "<unknown>",\
      "version": "<unknown>"\
    }\
  ],
  "pagination": {
    "total_count": 123,
    "limit": 123,
    "offset": 123,
    "has_more": true
  }
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

[​](https://docs.guild.ai/api-reference/sessions/fetch-session-sub-tasks#authorization-authorization)

Authorization

string

header

required

Account API key: key id as the username, secret as the password.

#### Path Parameters

[​](https://docs.guild.ai/api-reference/sessions/fetch-session-sub-tasks#parameter-session-id)

session\_id

string<uuid>

required

#### Query Parameters

[​](https://docs.guild.ai/api-reference/sessions/fetch-session-sub-tasks#parameter-limit)

limit

integer

default:20

Maximum number of items to return.

Required range: `0 <= x <= 1000`

[​](https://docs.guild.ai/api-reference/sessions/fetch-session-sub-tasks#parameter-offset)

offset

integer

default:0

Number of items to skip before returning results.

Required range: `x >= 0`

#### Response

200

application/json

Successful response

[​](https://docs.guild.ai/api-reference/sessions/fetch-session-sub-tasks#response-items)

items

object\[\]

- Option 1

- Option 2


Showchild attributes

[​](https://docs.guild.ai/api-reference/sessions/fetch-session-sub-tasks#response-pagination)

pagination

object

Showchild attributes

[Post a follow-up event to a session\\
\\
Previous](https://docs.guild.ai/api-reference/sessions/post-a-follow-up-event-to-a-session) [Fetch session runtimes\\
\\
Next](https://docs.guild.ai/api-reference/sessions/fetch-session-runtimes)

Ctrl+I

Fetch session sub-tasks

cURL

```
curl --request GET \
  --url 'https://api.guild.ai/v1/sessions/{session_id}/tasks?limit=20' \
  --header 'Authorization: Basic <encoded-value>'
```

```
import requests

url = "https://api.guild.ai/v1/sessions/{session_id}/tasks?limit=20"

headers = {"Authorization": "Basic <encoded-value>"}

response = requests.get(url, headers=headers)

print(response.text)
```

```
const options = {method: 'GET', headers: {Authorization: 'Basic <encoded-value>'}};

fetch('https://api.guild.ai/v1/sessions/{session_id}/tasks?limit=20', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));
```

```
<?php

$curl = curl_init();

curl_setopt_array($curl, [\
  CURLOPT_URL => "https://api.guild.ai/v1/sessions/{session_id}/tasks?limit=20",\
  CURLOPT_RETURNTRANSFER => true,\
  CURLOPT_ENCODING => "",\
  CURLOPT_MAXREDIRS => 10,\
  CURLOPT_TIMEOUT => 30,\
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,\
  CURLOPT_CUSTOMREQUEST => "GET",\
  CURLOPT_HTTPHEADER => [\
    "Authorization: Basic <encoded-value>"\
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
	"net/http"
	"io"
)

func main() {

	url := "https://api.guild.ai/v1/sessions/{session_id}/tasks?limit=20"

	req, _ := http.NewRequest("GET", url, nil)

	req.Header.Add("Authorization", "Basic <encoded-value>")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(string(body))

}
```

```
HttpResponse<String> response = Unirest.get("https://api.guild.ai/v1/sessions/{session_id}/tasks?limit=20")
  .header("Authorization", "Basic <encoded-value>")
  .asString();
```

```
require 'uri'
require 'net/http'

url = URI("https://api.guild.ai/v1/sessions/{session_id}/tasks?limit=20")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Get.new(url)
request["Authorization"] = 'Basic <encoded-value>'

response = http.request(request)
puts response.read_body
```

200

401

404

```
{
  "items": [\
    {\
      "id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",\
      "created_at": "2023-11-07T05:31:56Z",\
      "updated_at": "2023-11-07T05:31:56Z",\
      "session_id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",\
      "status": "CREATED",\
      "notified_at": "2023-11-07T05:31:56Z",\
      "parent_task_id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",\
      "runtime_id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",\
      "saved_state": "<string>",\
      "span_id": "<unknown>",\
      "trace_id": null,\
      "version_id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",\
      "agent": "<unknown>",\
      "cache_read_tokens": "<unknown>",\
      "cache_write_tokens": "<unknown>",\
      "input_tokens": "<unknown>",\
      "llm_call_count": "<unknown>",\
      "output_tokens": "<unknown>",\
      "parent_task": "<unknown>",\
      "token_usage": "<unknown>",\
      "total_tokens": "<unknown>",\
      "version": "<unknown>"\
    }\
  ],
  "pagination": {
    "total_count": 123,
    "limit": 123,
    "offset": 123,
    "has_more": true
  }
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