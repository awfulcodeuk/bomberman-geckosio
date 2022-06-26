# Bomberman with geckos.io
Credit to https://geckosio.github.io/ for the amazing libraries and examples.

# Local Dev
Install Caddy

use the below config
bman.foo.bar {
    tls ./_wildcard.foo.bar.pem ./_wildcard.foo.bar-key.pem
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