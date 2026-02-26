filename=verilocale-web_1.0.0.tar.gz
imgname=ver/verilocale-web:1.0.0
ip=159.138.228.40

scp -i ~/.ssh/KeyPair-v2.pem $filename root@159.138.228.40:/root/gk/
scp -i ~/.ssh/KeyPair-v2.pem -r cert root@159.138.228.40:/root/gk/web/
scp -i ~/.ssh/KeyPair-v2.pem -r nginx.conf root@159.138.228.40:/root/gk/web/
scp -i ~/.ssh/KeyPair-v2.pem -r docker-compose.yml root@159.138.228.40:/root/gk/web/

ssh root@159.138.228.40 -i ~/.ssh/KeyPair-v2.pem "cd /root/gk/web; docker compose down -v"
ssh root@159.138.228.40 -i ~/.ssh/KeyPair-v2.pem "cd /root/gk/web; docker compose up -d"
