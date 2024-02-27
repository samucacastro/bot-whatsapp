const express = require("express");
const app = require("express")();
app.use(express.json);

app.get('/', (req, res)=>{
	return res.send('ok')
})

const {
	DisconnectReason,
	useMultiFileAuthState,
	MessageOptions,
	Mimetype,
	SocketConfig,
	EventEmitter,
	MessageType
} = require("@whiskeysockets/baileys");
//const { MessageType } = require("@whiskeysockets/baileys"); 
const makeWASocket = require("@whiskeysockets/baileys").default;
const fs = require("fs");


const pino = require('pino');
async function connectionLogic() {
	// Use file-based authentication state
	const { state, saveCreds } = await useMultiFileAuthState("auth_info_baileys");
	const sock = makeWASocket({
		logger: pino({ level: "silent" }),
		printQRInTerminal: true,
		auth: state,
		emitOwnEvents: true,
	});
	sock.ev.on("connection.update", async (update) => {
		const { connection, lastDisconnect, qr } = update || {};
		if (qr) {
			console.log(qr);
			// write custom logic over here
		}

		if (connection === "close") {
			const shouldReconnect =
			lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;

			if (shouldReconnect) {
				connectionLogic();
			}
		}
		// ... rest of your code 
	});
	sock.ev.on("creds.update", saveCreds);


                          /*LOGICA*/
	await sock.ev.on("messages.upsert", async (m) => {
		/*Função*/
		async function listGroupParticipants(groupJid) {
					    const participants = await sock.groupMetadata(groupJid);
					    return participants;
					}
		/*#########*/
		if (m.messages[0].message?.extendedTextMessage?.text === '/ban') {
				const idParaBanir = m.messages[0].message.extendedTextMessage.contextInfo.participant;
				//console.log()
				const membros = await listGroupParticipants(m.messages[0].key?.remoteJid);
					//console.log()
					const isAdm = membros.participants.find((participantId)=> participantId.id === m.messages[0].key?.participant)
					if (!isAdm.admin) {
						await sock.sendMessage(m.messages[0].key.remoteJid, { text: 'Este comando só pode ser utilizado por um ADM!'})
					} else{
						await sock.groupParticipantsUpdate(m.messages[0].key?.remoteJid, [idParaBanir], "remove")
					}
			}
		if (m.messages[0].message?.conversation) {
			const comando = m.messages[0].message?.conversation;
			//console.log(comando)

			/*messagem de grupo*/
			if (m.messages[0].key.remoteJid.split('@')[1] === 'g.us') {
				//console.log('é de grupo')
				if (comando === '/All') {
					const membros = await listGroupParticipants(m.messages[0].key.remoteJid);
					//console.log()
					const participantsIds = membros.participants.map((participantId)=>{
						return participantId.id;
					})
					const sentMsg  =  sock.sendMessage(m.messages[0].key.remoteJid, { text: 'Atenção!', mentions: participantsIds })
				}
				if (comando === '/ban') {
					//console.log(m)
					sock.sendMessage(m.messages[0].key.remoteJid, { text: 'Responda uma mensagem com /ban para banir quem a enviou!'})
				}
			}
		}
		
			sock.readMessages([m.messages[0].key]);
		//sock.sendMessage(m.messages[0].key.remoteJid, { text: mensagem });
		}
	);

	// ... rest of your code
	// sock.ev.on('chats.set', async () => {
	// 		// can use "store.chats" however you want, even after the socket dies out
	// 		// "chats" => a KeyedDB instance
	// 		await sock.sendMessage('557792025471@s.whatsapp.net', { text: "Olá! Zé." });
	// 		//console.log('got chats', store.chats.all())
	// })


sock.ev.on("creds.update", async () => {
	// O código dentro desta função será executado quando as credenciais forem atualizadas, ou seja, quando a conexão for estabelecida
	console.log("Conexão estabelecida!")
	try{
		await sock.sendMessage('557792025471@s.whatsapp.net', { text: "Olá! Conexão estabelecida." });
		const options = {}
	}catch(error){
		console.log('DEU ERRO NO CREDS UPDATE')
		console.log(error)
	}
});

// ... rest of your code


	 sock.ev.on("creds.update", saveCreds);
}



connectionLogic();
app.use()
app.listen(3000, ()=>{
	console.log("SERVIDORR ON")
});