> ## Documentation Index
>
> Fetch the complete documentation index at: [/llms.txt](https://docs.guild.ai/llms.txt)
>
> Use this file to discover all available pages before exploring further.

[Skip to main content](https://docs.guild.ai/api-reference/sessions/fetch-session-events#content-area)

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

Fetch session events

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

# Fetch session events

Copy pageCopy page

Requires `workspaces:read` and `agents:read`. Events default to newest-first (`sort_by=-id`) with a limit of 20, so a naive read returns the tail of the conversation in reverse. For polling, pass `from_id` as an exclusive cursor (`id > from_id`) so each poll returns only what happened since the last one — event ids are UUIDv7 and therefore time-ordered. The agent’s reply arrives as a `runtime_done` event whose `content.text` carries the message; events persist when a turn completes, not while the model is streaming, so a poll during generation returns nothing new until the turn finishes.

A key missing `agents:read` currently gets a `500`, not a filtered `200` or a `403` — serializing an agent task reads details the key isn’t allowed to see, and that read fails loudly instead of being omitted. Grant `agents:read` alongside `workspaces:read` for any session that ran an agent.

Copy pageCopy page

GET

/

sessions

/

{session\_id}

/

events

Try it

Fetch session events

cURL

```
curl --request GET \
  --url 'https://api.guild.ai/v1/sessions/{session_id}/events?limit=20' \
  --header 'Authorization: Basic <encoded-value>'
```

```
import requests

url = "https://api.guild.ai/v1/sessions/{session_id}/events?limit=20"

headers = {"Authorization": "Basic <encoded-value>"}

response = requests.get(url, headers=headers)

print(response.text)
```

```
const options = {method: 'GET', headers: {Authorization: 'Basic <encoded-value>'}};

fetch('https://api.guild.ai/v1/sessions/{session_id}/events?limit=20', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));
```

```
<?php

$curl = curl_init();

curl_setopt_array($curl, [\
  CURLOPT_URL => "https://api.guild.ai/v1/sessions/{session_id}/events?limit=20",\
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

	url := "https://api.guild.ai/v1/sessions/{session_id}/events?limit=20"

	req, _ := http.NewRequest("GET", url, nil)

	req.Header.Add("Authorization", "Basic <encoded-value>")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(string(body))

}
```

```
HttpResponse<String> response = Unirest.get("https://api.guild.ai/v1/sessions/{session_id}/events?limit=20")
  .header("Authorization", "Basic <encoded-value>")
  .asString();
```

```
require 'uri'
require 'net/http'

url = URI("https://api.guild.ai/v1/sessions/{session_id}/events?limit=20")

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
      "task_id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",\
      "level": "INFO",\
      "message": "<string>",\
      "timestamp": "2023-11-07T05:31:56Z",\
      "type": "<unknown>"\
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

[​](https://docs.guild.ai/api-reference/sessions/fetch-session-events#authorization-authorization)

Authorization

string

header

required

Account API key: key id as the username, secret as the password.

#### Path Parameters

[​](https://docs.guild.ai/api-reference/sessions/fetch-session-events#parameter-session-id)

session\_id

string<uuid>

required

#### Query Parameters

[​](https://docs.guild.ai/api-reference/sessions/fetch-session-events#parameter-one-of-0)

sort\_by

string \| null

[​](https://docs.guild.ai/api-reference/sessions/fetch-session-events#parameter-limit)

limit

integer

default:20

Required range: `0 <= x <= 1000`

[​](https://docs.guild.ai/api-reference/sessions/fetch-session-events#parameter-offset)

offset

integer

default:0

Required range: `0 <= x <= 9223372036854776000`

[​](https://docs.guild.ai/api-reference/sessions/fetch-session-events#parameter-one-of-0)

from\_id

string \| null

[​](https://docs.guild.ai/api-reference/sessions/fetch-session-events#parameter-one-of-0)

types

string \| null

#### Response

200

application/json

Successful response

[​](https://docs.guild.ai/api-reference/sessions/fetch-session-events#response-items)

items

object\[\]

- Option 1

- Option 2

- Option 3

- Option 4

- Option 5

- Option 6

- Option 7

- Option 8

- Option 9

- Option 10

- Option 11

- Option 12

- Option 13

- Option 14

- Option 15

- Option 16

- Option 17

- Option 18

- Option 19

- Option 20


Showchild attributes

[​](https://docs.guild.ai/api-reference/sessions/fetch-session-events#response-pagination)

pagination

object

Showchild attributes

[Get a session\\
\\
Previous](https://docs.guild.ai/api-reference/sessions/get-a-session) [Post a follow-up event to a session\\
\\
Next](https://docs.guild.ai/api-reference/sessions/post-a-follow-up-event-to-a-session)

Ctrl+I

Fetch session events

cURL

```
curl --request GET \
  --url 'https://api.guild.ai/v1/sessions/{session_id}/events?limit=20' \
  --header 'Authorization: Basic <encoded-value>'
```

```
import requests

url = "https://api.guild.ai/v1/sessions/{session_id}/events?limit=20"

headers = {"Authorization": "Basic <encoded-value>"}

response = requests.get(url, headers=headers)

print(response.text)
```

```
const options = {method: 'GET', headers: {Authorization: 'Basic <encoded-value>'}};

fetch('https://api.guild.ai/v1/sessions/{session_id}/events?limit=20', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));
```

```
<?php

$curl = curl_init();

curl_setopt_array($curl, [\
  CURLOPT_URL => "https://api.guild.ai/v1/sessions/{session_id}/events?limit=20",\
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

	url := "https://api.guild.ai/v1/sessions/{session_id}/events?limit=20"

	req, _ := http.NewRequest("GET", url, nil)

	req.Header.Add("Authorization", "Basic <encoded-value>")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(string(body))

}
```

```
HttpResponse<String> response = Unirest.get("https://api.guild.ai/v1/sessions/{session_id}/events?limit=20")
  .header("Authorization", "Basic <encoded-value>")
  .asString();
```

```
require 'uri'
require 'net/http'

url = URI("https://api.guild.ai/v1/sessions/{session_id}/events?limit=20")

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
      "task_id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",\
      "level": "INFO",\
      "message": "<string>",\
      "timestamp": "2023-11-07T05:31:56Z",\
      "type": "<unknown>"\
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