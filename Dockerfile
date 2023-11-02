FROM node:18-alpine

ENV REACT_APP_API_BASE_URL=localhost:8000

RUN apk add git \
    && git clone https://github.com/achint227/resume.git \
    && cd resume \
    && npm i \
    && npm run build \
    && npm install -g serve

EXPOSE 3000

WORKDIR /resume

ENTRYPOINT [ "serve" ]

CMD ["-s","build"]