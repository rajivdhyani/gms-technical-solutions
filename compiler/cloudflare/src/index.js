// Worker in front of the compiler container.
// Reached only through the main site's service binding (src/app/api/compiler), which already
// sends clean /api/... paths. Every request goes to ONE named container instance,
// because interactive runs live in that instance's memory.
import { Container, getContainer } from "@cloudflare/containers";

export class CompilerContainer extends Container {
  defaultPort = 3000;      // server.js listens on PORT=3000 (set in the Dockerfile)
  sleepAfter = "15m";      // stop the container after 15 minutes without requests (saves cost)
  enableInternet = false;  // submitted programs get no outbound network access
}

export default {
  async fetch(request, env) {
    return getContainer(env.COMPILER, "main").fetch(request);
  },
};
