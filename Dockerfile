FROM node:latest

COPY . .

CMD ["/bin/bash", "./run_dev.sh"]

EXPOSE 3000