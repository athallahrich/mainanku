import fs from 'fs';
import path from 'path';

const TRUTHS = [
    "Apa hal termemalukan yang pernah kamu lakukan saat berhubungan?",
    "Pernahkah kamu berfantasi tentang orang lain saat bersama pasangan?",
    "Apa bagian tubuh pasangan yang paling membuatmu bergairah?",
    "Kapan terakhir kali kamu merasa sangat puas secara seksual?",
    "Apa hal yang paling ingin kamu coba di tempat tidur tapi malu mengatakannya?",
    "Pernahkah kamu menonton film dewasa sendirian?",
    "Apa pakaian pasangan yang menurutmu paling seksi?",
    "Momen 'panas' mana yang paling tidak bisa kamu lupakan?",
    "Apa fantasi seksual terliar yang pernah kamu bayangkan?",
    "Kalau kita beli mainan dewasa, kamu mau yang seperti apa?",
    "Apa yang paling kamu sukai saat kita melakukan foreplay?",
    "Apa posisi favoritmu saat kita sedang bersama?",
    "Pernahkah kamu berpura-pura puas agar pasangan senang?",
    "Apa hal paling gila yang pernah terlintas di pikiranmu saat melihatku?",
    "Sebutkan satu hal nakal yang ingin kamu lakukan malam ini!",
    "Di mana tempat paling aneh kamu pernah ingin melakukannya?",
    "Apa yang ada di pikiranmu saat pertama kali kita melakukannya?",
    "Sebutkan satu bagian tubuhku yang paling ingin kamu cium sekarang!",
    "Apa rahasia terdalammu yang belum pernah kamu ceritakan?",
    "Pernahkah kamu diam-diam memperhatikan orang lain di depan umum?",
    "Apa hal pertama yang kamu perhatikan dari lawan jenis?",
    "Berapa kali dalam seminggu kamu ingin melakukannya?",
    "Apa yang membuatmu paling cepat 'panas'?",
    "Pernahkah kamu mencoba melakukannya di luar ruangan?",
    "Sebutkan satu hal yang aku lakukan yang paling membuatmu turn on."
];

const DARES = [
    { text: "Buka semua pakaian luar!", duration: 0, icon: "👔" },
    { text: "Berikan Hot Kiss selama 30 detik!", duration: 30, icon: "💋" },
    { text: "Lakukan pijat sensual di punggung pasangan selama 1 menit!", duration: 60, icon: "💆" },
    { text: "Gunakan jari-jarimu untuk mengeksplorasi tubuh pasangan selama 30 detik!", duration: 30, icon: "🤚" },
    { text: "Berikan ciuman panas di leher pasangan!", duration: 0, icon: "💋" },
    { text: "Bisikkan hal paling nakal di telinga pasangan!", duration: 0, icon: "👂" },
    { text: "Lakukan posisi favoritmu selama 2 menit!", duration: 120, icon: "🔥" },
    { text: "Oral Mr P / Miss V pasangan selama 1 menit!", duration: 60, icon: "😛" },
    { text: "Hot Kiss & Pelukan erat selama 2 menit!", duration: 120, icon: "🫂" },
    { text: "Gaya Misionaris / Doggy Style selama 2 menit!", duration: 120, icon: "🛏️" },
    { text: "Tatap mata pasangan sambil meraba bagian tubuh sensitifnya!", duration: 0, icon: "🫦" },
    { text: "Lakukan Woman on Top / Man on Top selama 2 menit!", duration: 120, icon: "👩" },
    { text: "Berikan pijatan di area sensitif pasangan!", duration: 0, icon: "🫦" },
    { text: "Lakukan gerakan menggoda di depan pasangan!", duration: 0, icon: "💃" },
    { text: "Berikan 10 ciuman di area yang berbeda-beda!", duration: 0, icon: "💋" },
    { text: "Lepaskan bra / ikat pinggang dalam 10 detik!", duration: 0, icon: "👙" },
    { text: "Goda pasangan dengan es batu di area sensitif!", duration: 0, icon: "🧊" },
    { text: "Lakukan 69 position selama 1 menit!", duration: 60, icon: "🔄" },
    { text: "Pura-pura orgasme sekeras mungkin!", duration: 0, icon: "🔊" },
    { text: "Gunakan lidahmu untuk mengeksplorasi telinga pasangan!", duration: 0, icon: "👅" },
    { text: "Hanya gunakan pakaian dalam selama sisa permainan!", duration: 0, icon: "👙" },
    { text: "Berikan hickey (cupang) di tempat yang terlihat!", duration: 0, icon: "💋" },
    { text: "Lakukan dirty talk sambil mencium pasangan!", duration: 0, icon: "💬" },
    { text: "Biarkan pasangan menyentuhmu di manapun selama 1 menit!", duration: 60, icon: "😈" }
];

const CHARACTERS = [
    { id: 'prince', emoji: '🤴', label: 'Pangeran' },
    { id: 'princess', emoji: '👸', label: 'Putri' },
    { id: 'man', emoji: '🧑', label: 'Pria' },
    { id: 'woman', emoji: '👩', label: 'Wanita' },
    { id: 'groom', emoji: '🤵', label: 'Pengantin♂' },
    { id: 'bride', emoji: '👰', label: 'Pengantin♀' },
    { id: 'devil', emoji: '😈', label: 'Nakal' },
    { id: 'angel', emoji: '😇', label: 'Malaikat' },
    { id: 'cat', emoji: '🐱', label: 'Kucing' },
    { id: 'dog', emoji: '🐶', label: 'Anjing' },
    { id: 'superhero', emoji: '🦸', label: 'Superhero' },
    { id: 'fairy', emoji: '🧚', label: 'Peri' }
];

const OUTER_PATH = [
    [6, 0], [6, 1], [6, 2], [6, 3], [6, 4], [6, 5],
    [5, 6], [4, 6], [3, 6], [2, 6], [1, 6], [0, 6],
    [0, 7],
    [0, 8], [1, 8], [2, 8], [3, 8], [4, 8], [5, 8],
    [6, 9], [6, 10], [6, 11], [6, 12], [6, 13], [6, 14],
    [7, 14],
    [8, 14], [8, 13], [8, 12], [8, 11], [8, 10], [8, 9],
    [9, 8], [10, 8], [11, 8], [12, 8], [13, 8], [14, 8],
    [14, 7],
    [14, 6], [13, 6], [12, 6], [11, 6], [10, 6], [9, 6],
    [8, 5], [8, 4], [8, 3], [8, 2], [8, 1], [8, 0],
    [7, 0]
];

const PLAYER_COLORS = [
    {
        name: 'Merah', color: '#e74c3c', light: 'rgba(231,76,60,0.2)', startTile: 1,
        homeStretch: [[7, 1], [7, 2], [7, 3], [7, 4], [7, 5]], homeArea: { r: '1/7', c: '1/7' }
    },
    {
        name: 'Hijau', color: '#27ae60', light: 'rgba(39,174,96,0.2)', startTile: 14,
        homeStretch: [[1, 7], [2, 7], [3, 7], [4, 7], [5, 7]], homeArea: { r: '1/7', c: '10/16' }
    },
    {
        name: 'Kuning', color: '#f39c12', light: 'rgba(243,156,18,0.2)', startTile: 27,
        homeStretch: [[7, 13], [7, 12], [7, 11], [7, 10], [7, 9]], homeArea: { r: '10/16', c: '10/16' }
    },
    {
        name: 'Biru', color: '#3498db', light: 'rgba(52,152,219,0.2)', startTile: 40,
        homeStretch: [[13, 7], [12, 7], [11, 7], [10, 7], [9, 7]], homeArea: { r: '10/16', c: '1/7' }
    }
];

const STAR_POSITIONS = [1, 9, 14, 22, 27, 35, 40, 48];

const DOTS = {
    1: [[50, 50]], 2: [[25, 25], [75, 75]], 3: [[25, 25], [50, 50], [75, 75]],
    4: [[25, 25], [75, 25], [25, 75], [75, 75]], 5: [[25, 25], [75, 25], [50, 50], [25, 75], [75, 75]],
    6: [[25, 25], [75, 25], [25, 50], [75, 50], [25, 75], [75, 75]]
};

const jsonPath = path.join(process.cwd(), 'public/questions.json');
const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

if (!data.ludo_outer_path) {
    data.ludo_truths = TRUTHS;
    data.ludo_dares = DARES;
    data.ludo_characters = CHARACTERS;
    data.ludo_outer_path = OUTER_PATH;
    data.ludo_player_colors = PLAYER_COLORS;
    data.ludo_star_positions = STAR_POSITIONS;
    data.ludo_dots = DOTS;
    fs.writeFileSync(jsonPath, JSON.stringify(data, null, 4));
    console.log('Successfully migrated Ludo constants to questions.json');
} else {
    console.log('Ludo constants already exist in questions.json');
}
