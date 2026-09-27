# 1) 빌드: /api 상대경로로 호출하도록 빌드 (nginx가 프록시)
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build

# vite는 VITE_* 값이 없어도 빌드에 실패하지 않고 문자열 "undefined"를 번들에 굳힌다.
# 2026-09-01에 EC2에 .env.production이 없어 소셜 로그인이 조용히 죽은 적이 있다
# (배포는 성공, 버튼만 동작 안 함). 그래서 산출물을 직접 검사해 크게 터뜨린다.
RUN if grep -rqE '(client_id|redirect_uri)=undefined' dist/; then \
      echo "빌드 중단: 번들에 undefined가 박혔다. VITE_* 환경변수(.env.production)를 확인하라." >&2; \
      exit 1; \
    fi

# 2) 서빙: nginx가 정적파일 + /api 프록시
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
