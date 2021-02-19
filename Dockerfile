FROM node:10.23.1
ENV NODE_ENV production

WORKDIR /
ADD dist /

# Write a script that starts the zentity-ui server
# with optional arguments passed via docker run.
# Use that script as the entrypoint.
RUN echo '#!/bin/bash' >> /run.sh
RUN echo 'node /server/server.js "$@"' >> /run.sh
RUN chmod +x /run.sh
ENTRYPOINT ["/run.sh"]
