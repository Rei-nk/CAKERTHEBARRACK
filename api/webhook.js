const { createClient } = require('@supabase/supabase-js');
const fetch = require('node-fetch');

// Data Supabase Lu (Sudah diupdate pake Key baru)
const SUPABASE_URL = 'https://frrsvgmkudusxhmnuewc.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZycnN2Z21rdWR1c3hobW51ZXdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3Njg5MzAsImV4cCI6MjA5NDM0NDkzMH0.1LhuYkJQQuFxgQ7-9KNMG4Vt3-bFnOSI8q4vPNOh_UA';
const BOT_TOKEN = '8771589768:AAH9E5sbf7IIJP_JaDDN6WbsXrIX5iRSMYM';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const body = req.body;

  // Logika ketika tombol klaim diklik
  if (body.callback_query) {
    const callback = body.callback_query;
    const chatId = callback.message.chat.id;
    const messageId = callback.message.message_id;
    const username = callback.from.username || callback.from.first_name;
    const callbackData = callback.data;

    if (callbackData === 'klaim_tugas') {
      const jobId = 'job_perdana'; 
      const kuotaMaksimal = 25;

      try {
        // 1. Ambil list pendaftar dari Supabase
        const { data: pendaftar, error: fetchError } = await supabase
          .from('klaim_tugas')
          .select('username')
          .eq('job_id', jobId);

        if (fetchError) throw fetchError;

        // 2. Cek apakah user udah pernah klaim
        const sudahKlaim = pendaftar.some(p => p.username === username);
        if (sudahKlaim) {
          await answerCallback(callback.id, "Sabar bos, lu udah masuk list!");
          return res.status(200).json({ ok: true });
        }

        // 3. Cek kuota
        if (pendaftar.length >= kuotaMaksimal) {
          await answerCallback(callback.id, "Yah, kuota udah penuh!");
          return res.status(200).json({ ok: true });
        }

        // 4. Masukin ke Database
        const { error: insertError } = await supabase
          .from('klaim_tugas')
          .insert([{ job_id: jobId, username: username }]);

        if (insertError) throw insertError;

        // 5. Ambil data terbaru buat update tampilan
        const { data: listTerbaru } = await supabase
          .from('klaim_tugas')
          .select('username')
          .eq('job_id', jobId)
          .order('id', { ascending: true });

        let textBaru = `📝 **TUGAS PERDANA: THE BARRACKS**\n\n`;
        textBaru += `Klaim Tugas (${listTerbaru.length}/${kuotaMaksimal}):\n`;
        listTerbaru.forEach((p, i) => { textBaru += `${i + 1}. @${p.username}\n`; });

        await updateTelegramMessage(chatId, messageId, textBaru, listTerbaru.length < kuotaMaksimal);
        await answerCallback(callback.id, "Berhasil klaim!");

      } catch (err) {
        console.error('Bot Error:', err.message);
        await answerCallback(callback.id, "Waduh sistem lagi error bos!");
      }
    }
  }
  return res.status(200).json({ ok: true });
}

async function answerCallback(id, text) {
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/answerCallbackQuery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ callback_query_id: id, text: text, show_alert: true })
  });
}

async function updateTelegramMessage(chatId, msgId, text, showBtn) {
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/editMessageText`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      message_id: msgId,
      text: text,
      parse_mode: 'Markdown',
      reply_markup: showBtn ? { inline_keyboard: [[{ text: "🔥 KLAIM TUGAS INI", callback_data: "klaim_tugas" }]] } : { inline_keyboard: [] }
    })
  });
}