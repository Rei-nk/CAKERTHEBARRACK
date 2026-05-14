const { createClient } = require('@supabase/supabase-js');
const fetch = require('node-fetch');

// Ganti pake data asli dari Dashboard Supabase lu
const supabase = createClient('https://frrsvgmkudusxhmnuewc.supabase.co', 'sb_publishable_W0DVJN13Fe4QV6ZK6PGwhg_bin4P4FN');
const BOT_TOKEN = '8771589768:AAH9E5sbf7IIJP_JaDDN6WbsXrIX5iRSMYM';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const body = req.body;

  // Cek kalau ada klik tombol (callback_query)
  if (body.callback_query) {
    const callback = body.callback_query;
    const chatId = callback.message.chat.id;
    const messageId = callback.message.message_id;
    const username = callback.from.username || callback.from.first_name;
    const jobId = 'job_001'; // ID tugas ini

    // 1. Cek kuota & apakah user udah pernah ambil
    const { data: listPekerja } = await supabase
      .from('klaim_tugas')
      .select('username')
      .eq('job_id', jobId);

    if (listPekerja.find(p => p.username === username)) {
      return answerCallback(callback.id, "Sabar bos, lu udah masuk list!");
    }

    if (listPekerja.length >= 25) {
      return answerCallback(callback.id, "Yah, kuota udah penuh!");
    }

    // 2. Masukin ke Database Supabase
    await supabase.from('klaim_tugas').insert([{ job_id: jobId, username: username }]);

    // 3. Ambil data terbaru & Update pesan di Telegram
    const { data: listTerbaru } = await supabase.from('klaim_tugas').select('username').eq('job_id', jobId);
    
    let textList = `📝 **TUGAS BARU!**\nKlaim Tugas (${listTerbaru.length}/25):\n`;
    listTerbaru.forEach((p, index) => {
      textList += `${index + 1}. @${p.username}\n`;
    });

    await updateTelegramMessage(chatId, messageId, textList);
  }

  res.status(200).send('OK');
}

// Fungsi bantu buat komunikasi ke Telegram API
async function answerCallback(id, text) {
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/answerCallbackQuery?callback_query_id=${id}&text=${encodeURIComponent(text)}&show_alert=true`);
}

async function updateTelegramMessage(chatId, messageId, text) {
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/editMessageText?chat_id=${chatId}&message_id=${messageId}&text=${encodeURIComponent(text)}&parse_mode=Markdown&reply_markup=${JSON.stringify({
    inline_keyboard: [[{ text: "🔥 KLAIM TUGAS INI", callback_data: "klaim_tugas" }]]
  })}`);
}