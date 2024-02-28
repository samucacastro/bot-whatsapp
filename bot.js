// bot.js

const makeWASocket = require("@whiskeysockets/baileys").default;
const {
  DisconnectReason,
  useMultiFileAuthState,
  MessageOptions,
  Mimetype,
  SocketConfig,
  EventEmitter,
  MessageType
} = require("@whiskeysockets/baileys");

async function connectToWhatsApp() {

  const { state, saveCreds } = await useMultiFileAuthState("auth_info_baileys");
  const sock = makeWASocket({
    // Configurações adicionais (opcional)
    printQRInTerminal: true, // Exibe o QR code no terminal
    printQRInTerminal: true,
    auth: state,
  });

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'close') {
      // const shouldReconnect =
      //   (lastDisconnect.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
      // console.log('Conexão fechada devido a:', lastDisconnect.error);
      // if (shouldReconnect) {
      //   connectToWhatsApp(); // Reconecta se não estiver desconectado
      // }
    } else if (connection === 'open') {
      console.log('Conexão aberta');
    }
  });

  sock.ev.on('messages.upsert', async (m) => {
    console.log('Mensagem recebida:', JSON.stringify(m, undefined, 2));
    console.log('Respondendo para', m.messages[0].key.remoteJid);
    await sock.sendMessage(m.messages[0]?.key?.remoteJid, { text: 'Olá!' });
  });
}

// Executa no arquivo principal
connectToWhatsApp();
