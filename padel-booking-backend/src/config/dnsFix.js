import dns from "dns";

export function applyDnsFix() {
  // Cloudflare + Google
  dns.setServers(["1.1.1.1", "8.8.8.8"]);

  // Preferir IPv4 (ayuda en algunas redes)
  dns.setDefaultResultOrder("ipv4first");
}