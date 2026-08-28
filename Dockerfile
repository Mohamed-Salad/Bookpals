# --- Stage 1: build the static Vite bundle ---
FROM node:24-alpine AS build
WORKDIR /app

COPY package*.json ./
# ponytail: --legacy-peer-deps works around @emoji-mart/react's peer range
# (react ^16-18) not yet covering React 19 - stream-chat-react pulls it in,
# and chat is dead code until Phase 6 removes stream-chat-react entirely,
# which resolves this at the source. React 19 itself builds and runs fine.
RUN npm ci --legacy-peer-deps

COPY . .

# Vite bakes VITE_* vars into the JS bundle at build time, not runtime -
# they have to be passed in here as build args, not as a docker run env var.
# Only public-safe values: the Supabase anon key is meant to be exposed
# (RLS is the real gate), same reasoning as the VITE_ prefix rule in
# .env.example. Never pass STREAM_API_SECRET/SUPABASE_SERVICE_ROLE_KEY here.
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_STREAM_API_KEY=placeholder
ARG VITE_APP_URL=http://localhost:5173
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL \
    VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY \
    VITE_STREAM_API_KEY=$VITE_STREAM_API_KEY \
    VITE_APP_URL=$VITE_APP_URL

RUN npm run build

# --- Stage 2: serve the built assets with nginx, nothing else ---
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
