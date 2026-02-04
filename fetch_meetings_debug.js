const WEBHOOK_URL = "https://n8n.srv1010832.hstgr.cloud/webhook/493e8a5a-417b-4bef-81ba-49c83069c86d";

async function check() {
  try {
    const response = await fetch(WEBHOOK_URL);
    const data = await response.json();
    if (data.users && data.users.length > 0) {
        data.users.forEach(u => {
            console.log("User Name:", u.Name);
            console.log("Status:", u.Status);
            console.log("Summary:", u.ConversationSummary);
            // Check for any other interesting keys
            Object.keys(u).forEach(k => {
                if (k.toLowerCase().includes('meet') || k.toLowerCase().includes('call')) {
                    console.log(`Potential key ${k}:`, u[k]);
                }
            });
        });
    }
  } catch (e) {
    console.error(e);
  }
}

check();
