const fs = require('fs');

async function fetchInstagram() {
  try {
    const response = await fetch("https://n8n.srv1010832.hstgr.cloud/webhook/instagramdata");
    const text = await response.text();
    fs.writeFileSync('debug_instagram.txt', text);
    console.log("Written to debug_instagram.txt");
  } catch (error) {
    console.error("Error:", error);
  }
}

fetchInstagram();
