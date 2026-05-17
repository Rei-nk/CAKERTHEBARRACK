import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

// ==========================================
// ⚙️ KONFIGURASI OVERLORD
// ==========================================
const BOT_TOKEN = process.env.BOT_TOKEN;
const SPREADSHEET_ID = '12qxsfW8TAdonpXHgLxF7kSKT-m2yRQV-7aaKzQ2XcRk'; 
const BARRACKS_ID = '-1003905992209'; // The Barracks
const VALIDATION_ID = '-1003967062925'; // Dashboard Validasi
// Masukin ID lu dan ID temen lu ke dalam Array ini. Kalau ada admin ke-3, tinggal tambahin koma.
const ADMIN_IDS = ['6338250421', '1274691415'];
const CLIENT_EMAIL = "bot-sheets@simulacra-bot.iam.gserviceaccount.com";
const PRIVATE_KEY = `-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCh+ohIwX4cg8JG\nnGZZWDqWTaKqNPCXVuyRHVqXRMZp9CvdzRzHjMtD4TGjxsJQD+wefoRlrJtXEwmq\n+UEW2dJk5Py4XZe4Fh6SdJ9bx2vLvt7woIAc+of9u7spr/x1D+9IUKtM5DxA+bKA\nLycWvYv060rgA/+AeHRaNpRRatUYdyA2nnMp6+LG9sKXC4BKT8vzwtnpz36hX5oa\n8lEocKUHwrEzXbZ2aeMtn9rXpb+mRz7aizcSkfvgeMbkD7yigL1piUIsyfVTEyls\noTqPT+tjS2A4d34vCy0e9MqItFfTJ4NIdIlOnho6j3aJ3f7fGSfdYD46XpS7ID/d\nM0mWxvhXAgMBAAECggEACXBa/rpfyfOXn5u/jxdIGrgdcYOyPW9wS6iFPelhEo2K\n/NrWAX7f3W3DAcM0UYwL+17uAirDxpgyaQcrVtSMoRqC649wpuaLE4e+PY/qZS4T\nObxwmr+yqwOEjZJWyM+L5w/kW4+1PygN0dBtm7Kh9Dy92T4CZo8eYJ9rly79ifZX\nZLrLpiArZOODD31E/B+leH6YyIhXmCDLjAaw5orUDlEHCWzcdXCM6meY9y3xpOvN\n+lR32CU871ntGmbmo8tBLvJN8eV2tdidg1zZgiGvZ/vkX3FiGrumDiGjNAiihcgO\nmSlajFC6tbjItSY1MuJpjWiPsg7Lllt6bKEBDeTFmQKBgQDVkarwIKNRp98BcR7R\niNv2u0rCs/WwQYVLPTNxESTllRH9bC1YX1C4r0IW6CIIuzVZDYbs8/fJQJQc6gHH\ngN6psPfw/fgvqskuXsiPbhIQhKvHmelE9oaif9ujAIPL05Dp/SXnfUCDBcO3Gxca\n8dKHyydjc6rCE/O/7Lacm+aYmwKBgQDCKO1Rxai5ieIQcsog9Dircw04lZDdjzgb\n//vQQWkzztr5/6NFM2K+o97Yuxm/LCENz4i8TZZN70UYKE6kT0oyrUX6oSaYdMke\nYdCQ682a8SvwnI+YMvh0yIuf8hzvlPdvuAnO9BH5twImZnhwJ3yf8voawF5P7Y3p\n6Wt4KiWE9QKBgBzxuwsEQV4ltDGL1TNsqvMLexxcK2YR2zDRQJGIU0nSJDgGWzbo\n5BXDmt9j4ojwZlCFZs3iWqip2ej5Rfh13Ld+xnugz+wV52IjcmcN8eDPOkC4+UZh\naunHDktPHI2ZRMCRkHuJHB8lvtqoDz+VmoTQ4au212OqNJTEThN3hY8VAoGBAJDS\nHCnZJ/+0c/VW2aN45mgjueHR1asc73obFsWAdKrbCQReBHdSW73c1xSLginRDZqS\niOgDazAYX04kinwOVEa2bbMCzpn6yiSqSvo9mC+Q4fhnnsekhSP+jf6whZrCX0lq\nWY6PCHVdZvIjjoQBP/jCMIERqYcupqKpo6qOrUudAoGBAJ0nLymCQxyA6HJtlZnR\n0tssEFZmtNSuynRc+YohE94k7mbw8C6sW8ju+PYqa2QypZBkLO5LDdzBteweLZhV\n9uBakNlHnlQsgNPYBZCmUmYLi6pWWWM583PDb+wG9JS5XMhFbHnu/itWTJ9Ovwez\n2gQ7mWzxHpii6Z0gtVA7FYbk\n-----END PRIVATE KEY-----\n`;

const serviceAccountAuth = new JWT({ email: CLIENT_EMAIL, key: PRIVATE_KEY, scopes: ['https://www.googleapis.com/auth/spreadsheets'] });
const doc = new GoogleSpreadsheet(SPREADSHEET_ID, serviceAccountAuth);

async function sendTelegramMsg(chatId, text) {
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text: text, parse_mode: 'Markdown' })
  });
}

// ==========================================
// 🚀 INTI MESIN WEBHOOK
// ==========================================
export default async function handler(req, res) {
  if (req.method === 'GET') return res.status(200).send('Mata Dewa & Dispenser Aktif.');
  if (req.method !== 'POST') return res.status(405).send('Dilarang Masuk');

  try {
    const body = req.body;
    await doc.loadInfo(); 

    // ---------------------------------------------------------
    // TAHAP 2: ORKESTRASI (Admin ketik /runtask ORD-001 25)
    // ---------------------------------------------------------
    if (body.message && body.message.text && body.message.text.startsWith('/runtask')) {
      const chatId = body.message.chat.id;
      const userId = body.message.from.id.toString();
      
      if (!ADMIN_IDS.includes(userId)) {
        await sendTelegramMsg(chatId, "⚠️ Akses ditolak! Lu bukan jajaran Overlord.");
        return res.status(200).send('OK');
      }

      const parts = body.message.text.split(' ');
      if (parts.length < 3) {
        await sendTelegramMsg(chatId, "Format salah bos! Ketik: `/runtask [ID_ORDER] [KUOTA]`");
        return res.status(200).send('OK');
      }

      const orderId = parts[1];
      const kuota = parts[2];

      // Broadcast ke The Barracks
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: BARRACKS_ID,
          text: `🚨 **TUGAS BARU TERSEDIA** 🚨\n\n🎯 ID Order: ${orderId}\n⚠️ Rules: Wajib Tonton 15 Detik Baru Komen!\n\nRebutan dimulai bos, sikat!`,
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [[ { text: `[ AMBIL TUGAS | Kuota: ${kuota} ]`, callback_data: `claim_${orderId}` } ]]
          }
        })
      });

      await sendTelegramMsg(chatId, `✅ Drip-feed jalan! ${kuota} kuota ${orderId} udah disebar ke kolam.`);
      return res.status(200).send('OK');
    }

    // ---------------------------------------------------------
    // TAHAP 3: EKSEKUSI PASUKAN (Klik Ambil Tugas)
    // ---------------------------------------------------------
    if (body.callback_query && body.callback_query.data.startsWith('claim_')) {
      const callback = body.callback_query;
      const orderId = callback.data.replace('claim_', '');
      const userId = callback.from.id.toString();
      const callbackId = callback.id;
      const msgId = callback.message.message_id;
      const chatGroupId = callback.message.chat.id;

      const sheetScript = doc.sheetsByTitle["Master Scripting"];
      const rows = await sheetScript.getRows();
      
      // Cari baris pertama yang "Tersedia" untuk ID Order ini
      const availableRow = rows.find(r => r.get('ID Order') === orderId && r.get('Status') === 'Tersedia');

      if (availableRow) {
        // Ambil Skrip
        const scriptId = availableRow.get('ID Script');
        const scriptText = availableRow.get('Teks Komentar');
        
        // Tandai sebagai diambil
        availableRow.set('Status', 'Diambil');
        availableRow.set('Worker_ID', userId);
        await availableRow.save();

        // Hitung Sisa Kuota Real-time
        const sisaRows = rows.filter(r => r.get('ID Order') === orderId && r.get('Status') === 'Tersedia');
        const sisaKuota = sisaRows.length - 1; // Kurangi 1 karena barusan diambil

        // Jawab klik dengan pop-up sukses
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/answerCallbackQuery`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ callback_query_id: callbackId, text: "Berhasil dapat kuota! Cek DM Bot sekarang.", show_alert: true })
        });

        // Kirim DM ke Pekerja
        await sendTelegramMsg(userId, `🔥 **Tugas Diterima!**\n\nTugas Komentar Lo: \n_"${scriptText}"_ \n(Script ID: ${scriptId})\n\nBalas pesan ini dengan SCREENSHOT bukti komen lo!`);

        // Update Tombol di Channel The Barracks
        const buttonText = sisaKuota > 0 ? `[ AMBIL TUGAS | Sisa Kuota: ${sisaKuota} ]` : `[ TUGAS HABIS ❌ ]`;
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/editMessageReplyMarkup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatGroupId,
            message_id: msgId,
            reply_markup: {
              inline_keyboard: [[ { text: buttonText, callback_data: sisaKuota > 0 ? `claim_${orderId}` : `habis` } ]]
            }
          })
        });

      } else {
        // Kalau kehabisan
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/answerCallbackQuery`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ callback_query_id: callbackId, text: "Telat bos! Kuota udah habis.", show_alert: true })
        });
      }
      return res.status(200).send('OK');
    }

    // ---------------------------------------------------------
    // TAHAP 4: MATA DEWA (Terima Foto di DM & Setor ke Dashboard)
    // ---------------------------------------------------------
    if (body.message && body.message.photo && body.message.chat.type === 'private') {
      const chatId = body.message.chat.id;
      const userId = body.message.from.id;
      const username = body.message.from.username || body.message.from.first_name;
      const fileId = body.message.photo[body.message.photo.length - 1].file_id;

      await sendTelegramMsg(chatId, `✅ **BUKTI DITERIMA!**\n\nSetoran lu udah masuk ke meja "Mata Dewa". Tunggu notifikasi lulus/gagalnya di sini.`);

      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: VALIDATION_ID,
          photo: fileId,
          caption: `📸 **SETORAN BARU**\nWorker: @${username}\nID Worker: ${userId}\n\nEksekusi, Bos!`,
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [
                { text: "✅ APPROVE", callback_data: `approve_${userId}_${username}` },
                { text: "❌ REJECT", callback_data: `reject_${userId}_${username}` }
              ]
            ]
          }
        })
      });
      return res.status(200).send('OK');
    }

    // ---------------------------------------------------------
    // TAHAP 5: VALIDASI (Klik Approve/Reject)
    // ---------------------------------------------------------
    if (body.callback_query && (body.callback_query.data.startsWith('approve_') || body.callback_query.data.startsWith('reject_'))) {
      const callback = body.callback_query;
      const data = callback.data;
      const messageId = callback.message.message_id;
      const callbackChatId = callback.message.chat.id;
      const parts = data.split('_');
      const action = parts[0];
      const workerId = parts[1];
      const workerName = parts[2] || 'Worker';

      if (action === 'approve') {
        const sheetFinance = doc.sheetsByTitle["Finance & Payout"];
        if (sheetFinance) {
          await sheetFinance.addRow({
            'Worker_ID': workerId,
            'Nama Worker': workerName,
            'Bank/E-Wallet': '-',
            'Nomor Rekening/HP': '-',
            'Total Saldo': 1500,
            'Status Pencairan': 'Belum'
          });
        }
        await sendTelegramMsg(workerId, `🎉 **TUGAS LULUS!**\n\nKerja bagus bos! Saldo lo nambah **+Rp 1.500**. Terus pantau The Barracks buat tugas selanjutnya.`);
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/editMessageCaption`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: callbackChatId, message_id: messageId, caption: `✅ **APPROVED**\nWorker: @${workerName} (ID: ${workerId})\nRp 1.500 telah ditambahkan ke Sheets.`, parse_mode: 'Markdown' })
        });
      } else if (action === 'reject') {
        await sendTelegramMsg(workerId, `❌ **TUGAS DITOLAK!**\n\nBukti screenshot lo tidak valid (Salah akun/Gak sesuai rules). Coba lagi lain kali dan main bersih!`);
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/editMessageCaption`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: callbackChatId, message_id: messageId, caption: `❌ **REJECTED**\nWorker: @${workerName} (ID: ${workerId})\nTugas ditolak.`, parse_mode: 'Markdown' })
        });
      }

      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/answerCallbackQuery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callback_query_id: callback.id })
      });
      return res.status(200).send('OK');
    }

    return res.status(200).send('OK');
  } catch (error) {
    console.error("OVERLORD SYSTEM ERROR:", error);
    return res.status(500).send('Error');
  }
}