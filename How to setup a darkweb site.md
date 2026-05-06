# How to setup a darkweb site

We may join forums and markets on the dark web, most of which are onion sites. But who made these sites? Well here I’ll explain how configure a common web server to run a hidden service on TOR

![](https://miro.medium.com/v2/resize:fit:720/format:webp/0*dpve6OUqdpn3GL0S)

First of all, a brief mention of What is TOR?

The Onion Routing (TOR) is an encrypted and multilayered connection; it provides privacy against ISPs and eavesdroppers that sniff out internet traffic.


![](https://miro.medium.com/v2/resize:fit:700/1*r2wKDx0AhmK0DpnC0AkX8g.png)

> Image from [TOR docs](https://support.torproject.org/https/)

In the TOR network we can provide a hidden service. This is a web service only accessed over TOR and provides the HTTPS security with TOR privacy:

- Hide our real location.
- Use an end-to-end authentication, avoiding a rerouting of the connection source (location).
- End-to-end encryption
- NAT punching: it can bypass local network measures like firewalls that block our connections because TOR services do not require an open port to connect us.

These hidden services can be a blog, forum, market, or just be used to host our personal web for free. Yes, host an onion site — it’s free. We don’t need a domain or public IP because onion sites don’t need an IP, just an onion address like this one: **ciadotgov4sjwlzihbbgxnqg3xiyrg7so2r2o3lt5wz5ypk4sxyjstad.onion**, for example, this is the [CIA](https://www.cia.gov/stories/story/cias-latest-layer-an-onion-site/) hidden service URL.

---

### How we set up the hidden service?

> **NOTE:** All of the steps were done on a VPS that had Debian and a nginx web server already set up.

As all service installation, first we need to update repositories and install dependencies

```bash
sudo apt update  
sudo apt install apt-transport-https  
sudo apt install gnupg
```

Beacuse I use a debian system it;s needed to add the repository to my machine sources, to do that, create a file in the source list for Tor at this route: `/etc/apt/sources.list.d/tor.list` and add the follow line to the new `tor.list` file

```bash
deb     [signed-by=/usr/share/keyrings/deb.torproject.org-keyring.gpg] https://deb.torproject.org/torproject.org <DISTRIBUTION> main  
deb-src [signed-by=/usr/share/keyrings/deb.torproject.org-keyring.gpg] https://deb.torproject.org/torproject.org <DISTRIBUTION> main
```

In the `tor.list` content there is a `<DISTRIBUTION>` it should be replaced with our distribution code name to get it to run the following command.
```bash
lsb_release -c

#It shows something like this
Codename: jammy
```

Then in my case `jammy` is my `<DISTRIBUTION>` value

Add the **gpg key** for the tor packages:

```bash
sudo wget -qO- https://deb.torproject.org/torproject.org/A3C4F0F979CAA22CDBA8F512EE8CBC9E886DDD89.asc | gpg --dearmor | tee /usr/share/keyrings/deb.torproject.org-keyring.gpg >/dev/null
```

To apply the changes, just update the apt repositories.
```bash
sudo apt update
```

We can install TOR service now

```bash
sudo apt install tor deb.torproject.org-keyring
```

With the TOR service installed, we can check their status by running the following command:

```
sudo systemctl status tor
# If all is OK, the result should contain this.  
# Active: active
```

If the service is running ok, then edit the TOR config file in path `/etc/tor/torrc`

```
HiddenServiceDir /var/lib/tor/<site_name>/  
HiddenServicePort 80 unix:/var/lib/tor/<site_name>/onion.sock
```

> **NOTE:** From now on, every time `_<site_name>_` is shown, it will be the same as the name you give your onion site’s directory, so change it

The file’s last line, `HiddenServicePort 80 unix:/var/lib/tor/<site_name>/onion.socks` means that we use UNIX sockets to connect instead of the raw 80 TCP port. It provides us more security because only the service or users with the right permissions can connect to a socket, preventing information leaks in the local network.

To apply the TOR config changes, run

```bash
sudo systemctl restart tor
```

We need our onion **hostname** because this is the address to access the site. To get it, do the following:

```bash
cat /var/lib/tor/<site_name>/hostname  
  
# The result should show a URL like this.  
# zupnrpreqdsf66eemz3rfbkuskiv4kll2xgwhnrekgmnc4aiuguse4rcqd.onion
```

Now, to configure the access, a **web server** is needed. I use **nginx**, but it is possible to do it with an Apache server, a PHP server, and also with the web server provided with `python -m http.server` , If you don’t have a web server, you can install nginx following the instructions here: [nginx installation](https://docs.nginx.com/nginx/admin-guide/installing-nginx/installing-nginx-open-source/)

> Prepare a basic index file to test your site. For that, I use the route `/var/www/html/index.html`

To configure the nginx server, create the following file in this path: `/etc/nginx/sites-enabled/onion-site.conf`

```bash
server {  
 listen unix:/var/lib/tor/test/onion.sock;  
 server_name <onion_address>;  
 error_log /var/log/nginx/test-error.log;  
 access_log /var/log/nginx/test.log;  
 index index.html;  
 root /var/www/html;   
}
```

> **NOTE:** replace `<onion_address>` with the hostname of your onion site

Before applying changes, verify the **nginx syntax** with
```bash
sudo nginx -t
```

If the command result shows `test is successful`, apply the changes with

```bash
sudo systemctl restart nginx
```

After the restart, nginx creates the Unix socket, but it has a permissions set that can produce connection problems, for example, an `https`redirection when we visit the **onion address**.
![](https://miro.medium.com/v2/resize:fit:720/format:webp/1*-ij8tXZwp9pCFoajAFEhvQ.png)

> Example of tor connection error

Sockets require the correct permission to work; you can check the socket permission with
```bash
ls -ld /var/lib/tor/<site_name>  
# Maybe it shows the permissions:  
# rw-rw-rw- | 666  
# and the ownership:  
# root debian-tor
```

To connect, we need the following permissions and ownership.

- `660` = `rw-rw----`
- `debian-tor debian-tor`

> **NOTE:** `debian-tor` is the user for the TOR service.

To change permissions and ownership, do this:

```bash
sudo chown debian-tor:debian-tor /var/lib/tor/<site_name>/onion.sock    
sudo chmod 660 /var/lib/tor/<site_name>/onion.sock
```

Now the permissions and ownership are:

- `660` = `rw-rw----`
- `debian-tor debian-tor`

But if nginx is restarted, the permissions and ownership will revert. To solve this, add the following config to the nginx service. You can run this command directly:

```bash
sudo mkdir -p /etc/systemd/system/nginx.service.d  
sudo tee /etc/systemd/system/nginx.service.d/override.conf > /dev/null <<'EOF'  
[Service]  
ExecStartPost=/bin/chown debian-tor:debian-tor /var/lib/tor/<site_name>/onion.sock  
ExecStartPost=/bin/chmod 660 /var/lib/tor/<site_name>/onion.sock  
EOF
```

> **NOTE:** remember replace `<site_name>`

Apply the changes:

```bash
sudo systemctl daemon-reload  
sudo systemctl restart nginx
```

Now try to connect to the onion address; it should work.

Here is an optional step: the default onion addresses are generated by the **TOR service**, but if you want to have a custom (vanity) address, follow the next steps.

To do that, I use the tool **mkp224o**. It generates onion addresses with brute force. To clone and set up the tool, follow these steps:

```bash
# Maybe you need to install these dependencies  
  
sudo apt install gcc libc6-dev libsodium-dev make autoconf

git clone https://github.com/cathugger/mkp224o.git  
cd mkp224o  
./autogen.sh  
./configure  
make
```

Now, to generate the custom address, first create a directory `~/tmp` to save the onion address extracted data and then run the tool. Replace `<address_name>` with words that you want to have in your custom address, but more complex words require more time because it’s a brute force process.

```bash
./mkp224o <address_name> -d ~/tmp/ -t $(nproc)
```


> `-t $(nproc)` is for using all the threads of the CPU in the brute force

For example, if we choose `test` as `<address_name>` , the result can show something like this: **testz7v7tffyftby37pnoqwwyifn4x5zkjfkxpq6uyq7fds2ujyqd.onion**

> **NOTE:** You can delete the onion site created above with `sudo rm -r` or just rename it with `sudo mv` , do this before the next step.

In the directory used for the extracted data, a subdirectory will be created with the needed data, like keys for this address. Then copy the new address directory to our onion site directory.

```bash
sudo copy -r ~/tmp/testz7v7tffyftby37pnoqwwyifn4x5zkjfkxpq6uyq7fds2ujyqd.onion /var/var/lib/tor/<site_name>
```

Now with the data copied, we need to change the directory permissions and ownership.

```bash
# change all directory's files permissions  
sudo chmod 600 /var/lib/tor/<site_name>/*  
# change directory permissions  
sudo chmod 700 /var/lib/tor/<site_name>/
```

If the command above generates a failure, try this.

```bash
# change to root user  
sudo su  
  
# change permissions  
chmod 600 /var/lib/tor/<site_name>/*
```

Change directory and file ownership.

```bash
sudo chown -R debian-tor:debian-tor /var/lib/tor/<site_name>
```

Now in our nginx config file `/etc/nginx/sites-enabled/onion-site.conf` , change this line.

```bash
<...>  
server_name <vanity_address>;  
<...>
```

> NOTE: `<vanity_address>` is the new generated address; replace it.

Now restart **nginx** to create the Unix socket.

```bash
sudo systemctl restart nginx
```

With our previous Nginx service config, now the Unix socket is created with the correct permissions and ownership, and finally, to apply the change, restart TOR.

```bash
sudo systemctl restart tor
```


Now you can try to connect with your new vanity address.

![](https://miro.medium.com/v2/resize:fit:720/format:webp/1*45EDKPwB0A_DxUOgKfX-ag.png)

