# Bomberman with geckos.io
Credit to https://geckosio.github.io/ for the amazing libraries and examples.

# Local Dev
Install Caddy 2.5.x

Powershell (admin)
choco install mkcert

Powershell (non-admin)
cd to the caddy directory
mkcert -install
mkcert "*.local.dev"

Hosts file
add the following:
127.0.0.1 bman.local.dev

In the caddy directory
Create file "Caddyfile"
add the below config and save/close
bman.local.dev {
    tls ./_wildcard.local.dev.pem ./_wildcard.local.dev-key.pem
    reverse_proxy localhost:3001
    header {
        # enable HSTS
        Strict-Transport-Security max-age=31536000;
        # disable clients from sniffing the media type
        X-Content-Type-Options nosniff
        # clickjacking protection
        X-Frame-Options DENY
        # keep referrer data off of HTTP connections
        Referrer-Policy no-referrer-when-downgrade
        # Content-Security-Policy: default-src 'self'
    }
    reverse_proxy /.wrtc/v2 localhost:9208 {
        header_up Connection *Upgrade*
        header_up Upgrade websocket
    }
}

Powershell (non-admin)
cd to caddy directory
.\caddy.exe run --config Caddyfile

Browser
Navigate to https://bman.local.dev