// 英語：光村図書「Here We Go! 1」 Round 3（Unit 1〜8）・Round 4（Unit 4まで）
// 文法は Unit 4 までに扱ったもの（be動詞・一般動詞・can・代名詞など）
// 教科書の本文は使わず、すべてオリジナルの英文で作る。
import type { ChoiceQ, InputQ, OrderQ, SelfQ, Subject } from '../types';

let cid = 0;
const ch = (unit: string, q: string, answer: string, wrong: string[], explain: string, extra: Partial<ChoiceQ> = {}): ChoiceQ => ({
  id: `${unit}-${cid++}`, unit, type: 'choice', q, answer, choices: [answer, ...wrong], explain, ...extra,
});
const en = (unit: string, q: string, answers: string[], explain: string, extra: Partial<InputQ> = {}): InputQ => ({
  id: `${unit}-${cid++}`, unit, type: 'input', kind: 'en', q, answers, explain, ...extra,
});
const ord = (unit: string, q: string, tokens: string[], explain: string, extra: Partial<OrderQ> = {}): OrderQ => ({
  id: `${unit}-${cid++}`, unit, type: 'order', q, tokens, join: ' ', explain, ...extra,
});
const self = (unit: string, q: string, model: string, points: string[], explain: string): SelfQ => ({
  id: `${unit}-${cid++}`, unit, type: 'self', q, model, points, explain,
});

// ---------- 文法：適語選択 ----------
const be = [
  ch('e-be', '( ) に入る語を選びなさい。\nI ( ) a student.', 'am', ['are', 'is', 'be'], '主語が I のときの be動詞は am。'),
  ch('e-be', '( ) に入る語を選びなさい。\nYou ( ) my friend.', 'are', ['am', 'is', 'be'], '主語が you のときは are。'),
  ch('e-be', '( ) に入る語を選びなさい。\nThis ( ) my bag.', 'is', ['am', 'are', 'be'], '主語が this / that / he / she / it のときは is。'),
  ch('e-be', '( ) に入る語を選びなさい。\nMs. Brown ( ) our English teacher.', 'is', ['am', 'are', 'do'], 'Ms. Brown は1人（he / she と同じ）なので is。'),
  ch('e-be', '( ) に入る語を選びなさい。\n( ) you from Canada? — Yes, I am.', 'Are', ['Do', 'Is', 'Am'], 'be動詞の疑問文は be動詞を主語の前に出す。Are you 〜? には Yes, I am. / No, I\'m not. で答える。'),
  ch('e-be', '( ) に入る語を選びなさい。\nIs that a library? — Yes, ( ) is.', 'it', ['that', 'this', 'he'], 'this / that でたずねられたら、答えでは it を使う。'),
  ch('e-be', '「私はおなかがすいていません。」の正しい英文はどれですか。', "I'm not hungry.", ["I don't hungry.", 'I not am hungry.', "I amn't hungry."], 'be動詞の否定文は be動詞のあとに not。I am not = I\'m not。'),
  ch('e-be', '( ) に入る語を選びなさい。\nWho is that boy? — ( ) is Ken.', 'He', ['She', 'It', 'His'], '男の子なので he。'),
  ch('e-be', '( ) に入る語を選びなさい。\nThis is Emma. ( ) is from Australia.', 'She', ['He', 'Her', 'It'], '女の人を指すときは she。'),
  ch('e-be', '( ) に入る語を選びなさい。\nWhat ( ) this? — It\'s a guitar.', 'is', ['are', 'do', 'does'], 'What is this? = 「これは何ですか」。'),
];

const verb = [
  ch('e-verb', '( ) に入る語を選びなさい。\nI ( ) tennis every day.', 'play', ['am', 'plays', 'am play'], '一般動詞の文では be動詞は使わない。'),
  ch('e-verb', '( ) に入る語を選びなさい。\n( ) you like music? — Yes, I do.', 'Do', ['Are', 'Is', 'Can'], '一般動詞の疑問文は Do を主語の前に置く。'),
  ch('e-verb', '( ) に入る語を選びなさい。\nI ( ) have a dog.', "don't", ["am not", "isn't", "not"], '一般動詞の否定文は動詞の前に do not（don\'t）。'),
  ch('e-verb', '( ) に入る語を選びなさい。\nDo you play the piano? — No, I ( ).', "don't", ["am not", "can't", "do"], 'Do 〜? の答えは Yes, I do. / No, I don\'t.'),
  ch('e-verb', '「私は毎朝朝ごはんを食べます。」に合う英文はどれですか。', 'I eat breakfast every morning.', ['I am eat breakfast every morning.', 'I breakfast eat every morning.', 'I eating breakfast every morning.'], '主語 → 動詞 → 目的語 の順。'),
  ch('e-verb', '( ) に入る語を選びなさい。\nWhat do you ( ) after school? — I practice soccer.', 'do', ['are', 'play', 'is'], 'What do you do 〜? =「何をしますか」。最初の do は疑問文の do、2つ目は「する」という動詞。'),
  ch('e-verb', '「あなたはネコが好きですか。」に合う英文はどれですか。', 'Do you like cats?', ['Are you like cats?', 'You like cats?', 'Do you cats like?'], 'Do + 主語 + 動詞 〜?'),
  ch('e-verb', '( ) に入る語を選びなさい。\nWe ( ) English on Monday.', 'study', ['are', 'studies', 'is study'], 'we は複数なので動詞はそのままの形。'),
  ch('e-verb', '( ) に入る語を選びなさい。\nI usually ( ) to school by bike.', 'go', ['am', 'goes', 'going'], 'go to school =「学校へ行く」。'),
];

const can = [
  ch('e-can', '( ) に入る語を選びなさい。\nI can ( ) fast.', 'run', ['runs', 'running', 'am run'], 'can のあとの動詞はもとの形（原形）。'),
  ch('e-can', '( ) に入る語を選びなさい。\n( ) you cook? — Yes, I can.', 'Can', ['Do', 'Are', 'Is'], 'can の疑問文は Can を主語の前に出す。'),
  ch('e-can', '( ) に入る語を選びなさい。\nCan you ski? — No, I ( ).', "can't", ["don't", "am not", "can"], 'Can 〜? の答えは Yes, I can. / No, I can\'t.'),
  ch('e-can', '「私は一輪車に乗れません。」に合う英文はどれですか。', "I can't ride a unicycle.", ["I don't can ride a unicycle.", "I can ride not a unicycle.", "I am not ride a unicycle."], 'can の否定は can\'t（cannot）+ 動詞の原形。'),
  ch('e-can', '( ) に入る語を選びなさい。\nMy sister can ( ) the guitar well.', 'play', ['plays', 'playing', 'is play'], '主語が my sister でも、can のあとは原形。'),
  ch('e-can', '「〜してもいいですか」と許可を求める英文はどれですか。', 'Can I use your pen?', ['Do I use your pen?', 'Am I use your pen?', 'Can you use my pen?'], 'Can I 〜? =「〜してもいいですか」。Can you 〜? =「〜してくれますか」。'),
  ch('e-can', 'Can you help me? と言われて引き受けるとき、最も適切な返事はどれですか。', 'Sure.', ['No, I am not.', 'Yes, I do.', "You're welcome."], 'Can you 〜? は「〜してくれますか」。Sure. / OK. などで答える。'),
];

const pron = [
  ch('e-pron', '( ) に入る語を選びなさい。\nThis is ( ) bike.', 'my', ['I', 'me', 'mine'], '名詞の前には「〜の」の形（my）。'),
  ch('e-pron', '( ) に入る語を選びなさい。\nI know Tom. I like ( ).', 'him', ['he', 'his', 'he\'s'], '動詞のあとには「〜を」の形。he → him。'),
  ch('e-pron', '( ) に入る語を選びなさい。\nThat is Ms. Sato. Do you know ( )?', 'her', ['she', 'hers', "she's"], 'she → her（〜を）。her は「彼女の」「彼女を」の両方。'),
  ch('e-pron', '( ) に入る語を選びなさい。\nThis notebook is ( ).（私のもの）', 'mine', ['my', 'me', 'I'], '「〜のもの」は mine / yours / his / hers / ours / theirs。'),
  ch('e-pron', '( ) に入る語を選びなさい。\nKen and Yumi are my friends. I often play with ( ).', 'them', ['they', 'their', 'theirs'], 'they → them（〜を・〜と）。前置詞のあとも「〜を」の形。'),
  ch('e-pron', '( ) に入る語を選びなさい。\nThey are ( ) classmates.（私たちの）', 'our', ['we', 'us', 'ours'], 'we の「〜の」は our。'),
  ch('e-pron', '( ) に入る語を選びなさい。\nIs this your cap? — Yes, it\'s ( ).', 'mine', ['my', 'me', 'I'], '「私のもの」は mine。'),
  ch('e-pron', '( ) に入る語を選びなさい。\nI have a cat. ( ) name is Momo.', 'Its', ["It's", 'It', 'Their'], 'it の「〜の」は its。it\'s は it is の短縮形。'),
  ch('e-pron', '( ) に入る語を選びなさい。\nPlease help ( ).（私たちを）', 'us', ['we', 'our', 'ours'], 'we → us（〜を）。'),
  ch('e-pron', '( ) に入る語を選びなさい。\nWhose pencil is this? — It\'s ( ).（彼のもの）', 'his', ['he', 'him', "he's"], 'he の「〜の」「〜のもの」はどちらも his。'),
];

const wh = [
  ch('e-wh', '( ) に入る語を選びなさい。\n( ) do you live? — I live in Saitama.', 'Where', ['What', 'When', 'Who'], 'where =「どこ」。'),
  ch('e-wh', '( ) に入る語を選びなさい。\n( ) is your birthday? — It\'s May 5.', 'When', ['Where', 'What', 'How'], 'when =「いつ」。'),
  ch('e-wh', '( ) に入る語を選びなさい。\n( ) many pens do you have? — I have three.', 'How', ['What', 'Where', 'Who'], 'How many 〜? =「いくつの〜」。後ろの名詞は複数形。'),
  ch('e-wh', '( ) に入る語を選びなさい。\n( ) is that girl? — She is my sister.', 'Who', ['What', 'Where', 'When'], 'who =「だれ」。'),
  ch('e-wh', '( ) に入る語を選びなさい。\n( ) sport do you like? — I like basketball.', 'What', ['Who', 'Where', 'How'], 'What sport 〜? =「何のスポーツ」。'),
  ch('e-wh', '( ) に入る語を選びなさい。\n( ) are you? — I\'m fine, thank you.', 'How', ['What', 'Who', 'Where'], 'How are you? =「元気ですか」。'),
  ch('e-wh', '( ) に入る語を選びなさい。\n( ) time is it? — It\'s seven thirty.', 'What', ['How', 'When', 'Which'], 'What time is it? =「何時ですか」。'),
];

// ---------- 単語 ----------
const words = [
  en('e-word', '「水曜日」を英語で書きなさい。', ['Wednesday'], 'Wednesday（d を忘れやすい）。曜日は大文字で始める。'),
  en('e-word', '「木曜日」を英語で書きなさい。', ['Thursday'], 'Thursday。Tuesday（火曜日）と区別する。'),
  en('e-word', '「火曜日」を英語で書きなさい。', ['Tuesday'], 'Tuesday。'),
  en('e-word', '「土曜日」を英語で書きなさい。', ['Saturday'], 'Saturday。'),
  en('e-word', '「2月」を英語で書きなさい。', ['February'], 'February（r が2つ）。'),
  en('e-word', '「8月」を英語で書きなさい。', ['August'], 'August。月は大文字で始める。'),
  en('e-word', '「9月」を英語で書きなさい。', ['September'], 'September。'),
  en('e-word', '「12」を英語のつづりで書きなさい。', ['twelve'], 'twelve。'),
  en('e-word', '「20」を英語のつづりで書きなさい。', ['twenty'], 'twenty。'),
  en('e-word', '「数学」を英語で書きなさい。', ['math', 'mathematics'], 'math。'),
  en('e-word', '「理科」を英語で書きなさい。', ['science'], 'science（c を忘れやすい）。'),
  en('e-word', '「図書館」を英語で書きなさい。', ['library'], 'library。'),
  en('e-word', '「友だち」を英語で書きなさい。', ['friend'], 'friend（i を忘れやすい）。'),
  en('e-word', '「美しい」を英語で書きなさい。', ['beautiful'], 'beautiful。'),
  en('e-word', '「〜を知っている」を英語で書きなさい。', ['know'], 'know（k は読まない）。'),
  en('e-word', '「書く」を英語で書きなさい。', ['write'], 'write（w は読まない）。'),
  en('e-word', '「よく、じょうずに」を英語で書きなさい。', ['well'], 'well。'),
  en('e-word', '「いつも」を英語で書きなさい。', ['always'], 'always。'),
  ch('e-word', 'favorite の意味はどれですか。', 'いちばん好きな', ['有名な', 'ふつうの', '大切な'], 'my favorite food =「私のいちばん好きな食べ物」。'),
  ch('e-word', 'practice の意味はどれですか。', '練習する', ['勉強する', '料理する', '説明する'], 'practice soccer =「サッカーを練習する」。'),
  ch('e-word', 'sometimes の意味はどれですか。', 'ときどき', ['いつも', 'たいてい', '一度も〜ない'], 'always（いつも） > usually（たいてい） > often（よく） > sometimes（ときどき）。'),
  ch('e-word', 'every day の意味はどれですか。', '毎日', ['ある日', '昨日', '日曜日'], 'every 〜 =「毎〜」。every morning（毎朝）。'),
  ch('e-word', '反対の意味の組み合わせとして正しいものはどれですか。', 'big — small', ['tall — high', 'happy — glad', 'fast — quick'], 'big（大きい）⇔ small（小さい）。'),
];

// ---------- 並べかえ ----------
const order = [
  ord('e-order', '日本語に合うように並べかえなさい。\n「私はバスケットボールが好きです。」', ['I', 'like', 'basketball', '.'], '主語 → 動詞 → 目的語。'),
  ord('e-order', '日本語に合うように並べかえなさい。\n「あなたは自転車に乗れますか。」', ['Can', 'you', 'ride', 'a', 'bike', '?'], 'Can + 主語 + 動詞の原形 〜?'),
  ord('e-order', '日本語に合うように並べかえなさい。\n「私は音楽部に入っていません。」', ['I', "am", 'not', 'in', 'the', 'music', 'club', '.'], 'be動詞の否定文。be in the 〜 club =「〜部に入っている」。'),
  ord('e-order', '日本語に合うように並べかえなさい。\n「あなたは何の教科が好きですか。」', ['What', 'subject', 'do', 'you', 'like', '?'], 'What + 名詞 + do you 〜?'),
  ord('e-order', '日本語に合うように並べかえなさい。\n「こちらは私の兄の健です。」', ['This', 'is', 'my', 'brother', 'Ken', '.'], 'This is 〜. で人を紹介する。'),
  ord('e-order', '日本語に合うように並べかえなさい。\n「私は日曜日に彼といっしょにテニスをします。」', ['I', 'play', 'tennis', 'with', 'him', 'on', 'Sunday', '.'], 'with のあとは him（〜を・〜と の形）。曜日の前は on。', { alts: [['I', 'play', 'tennis', 'on', 'Sunday', 'with', 'him', '.']] }),
  ord('e-order', '日本語に合うように並べかえなさい。\n「あなたはどこで昼食を食べますか。」', ['Where', 'do', 'you', 'eat', 'lunch', '?'], '疑問詞 + do you + 動詞 〜?'),
  ord('e-order', '日本語に合うように並べかえなさい。\n「私の姉はじょうずに泳ぐことができます。」', ['My', 'sister', 'can', 'swim', 'well', '.'], 'can + 動詞の原形。well は文の最後。'),
  ord('e-order', '日本語に合うように並べかえなさい。\n「あれはあなたのかばんですか。」', ['Is', 'that', 'your', 'bag', '?'], 'be動詞の疑問文は be動詞を前に出す。'),
  ord('e-order', '日本語に合うように並べかえなさい。\n「あなたはネコを何匹飼っていますか。」', ['How', 'many', 'cats', 'do', 'you', 'have', '?'], 'How many + 複数形 + do you have?'),
];

// ---------- 和文英訳 ----------
const write = [
  en('e-write', '次の日本語を英語にしなさい。\n「私はサッカーファンです。」', ['I am a soccer fan', "I'm a soccer fan"], 'I am（I\'m）a 〜. a を忘れない。'),
  en('e-write', '次の日本語を英語にしなさい。\n「私はピアノをひくことができます。」', ['I can play the piano'], 'play the piano（楽器には the を付ける）。'),
  en('e-write', '次の日本語を英語にしなさい。\n「あなたは犬が好きですか。」', ['Do you like dogs'], '「〜が好き」で数えられるものは複数形にする（dogs）。'),
  en('e-write', '次の日本語を英語にしなさい。\n「私は泳げません。」', ["I can't swim", 'I cannot swim', 'I can not swim'], "can't + 動詞の原形。"),
  en('e-write', '次の日本語を英語にしなさい。\n「これは私のノートではありません。」', ["This is not my notebook", "This isn't my notebook"], 'is のあとに not。'),
  en('e-write', '次の日本語を英語にしなさい。\n「私は毎日英語を勉強します。」', ['I study English every day'], 'every day =「毎日」（2語）。'),
  en('e-write', '次の日本語を英語にしなさい。\n「あなたはどこの出身ですか。」', ['Where are you from'], 'Where are you from? — I\'m from 〜.'),
  en('e-write', '次の日本語を英語にしなさい。\n「彼女は私の友だちです。」', ['She is my friend', "She's my friend"], 'she → is。'),
  self('e-write', 'あなた自身について、好きなことを1文の英語で書きなさい。', 'I like baseball. / I like music. など', ['I like 〜. の形になっている', '最初は大文字、最後はピリオド'], '自分のことを書く問題。I like 〜. / I can 〜. / I play 〜. などの形を使う。'),
  self('e-write', 'あなた自身について、できることを1文の英語で書きなさい。', 'I can swim fast. / I can play the guitar. など', ['I can + 動詞の原形 の形になっている'], 'can のあとは動詞の原形。'),
];

// ---------- リスニング（読み上げ） ----------
const L = (q: string, audio: string, answer: string, wrong: string[], explain: string) =>
  ch('e-listen', `🔊 英語を聞いて答えなさい。\n${q}`, answer, wrong, `【英文】${audio}\n\n${explain}`, { audio });
const listen = [
  L('話している人の好きなスポーツはどれですか。', 'Hi, I am Mika. I like tennis. I play it with my friends on Saturday.', 'テニス', ['サッカー', '野球', 'バスケットボール'], 'I like tennis. と言っている。'),
  L('ケンができることはどれですか。', 'This is Ken. He is my friend. He can cook well. But he can\'t swim.', '料理', ['水泳', 'スキー', 'ギター'], 'He can cook well. But he can\'t swim. → 料理はできるが、泳げない。'),
  L('話している人は何匹の犬を飼っていますか。', 'I have two dogs and one cat. My dogs are big.', '2匹', ['1匹', '3匹', '4匹'], 'I have two dogs and one cat. → 犬2匹、ネコ1匹。'),
  L('話している人の誕生日はいつですか。', 'My birthday is July tenth. I am thirteen.', '7月10日', ['6月10日', '7月13日', '1月10日'], 'July = 7月、tenth = 10日。'),
  L('質問に対する答えとして最も適切なものはどれですか。', 'Do you like math?', 'Yes, I do.', ['Yes, I am.', 'Yes, I can.', 'It is math.'], 'Do you 〜? には do で答える。'),
  L('質問に対する答えとして最も適切なものはどれですか。', 'Where is your school?', 'It is near the station.', ['It is my school.', 'Yes, it is.', 'I go to school.'], 'where は「どこ」。場所を答える。'),
  L('質問に対する答えとして最も適切なものはどれですか。', 'Can you play the guitar?', "No, I can't.", ["No, I don't.", "No, I'm not.", 'I play the guitar.'], 'Can you 〜? には can で答える。'),
  L('話している人が放課後にすることはどれですか。', 'I am in the art club. I draw pictures after school.', '絵をかく', ['歌を歌う', 'テニスをする', '本を読む'], 'I draw pictures after school. → 放課後に絵をかく。'),
  L('スミス先生はどこの出身ですか。', 'This is Mr. Smith. He is from Canada. He is our English teacher.', 'カナダ', ['アメリカ', 'オーストラリア', 'イギリス'], 'He is from Canada.'),
  L('話している人が好きな教科はどれですか。', 'I like science. It is interesting. I don\'t like math.', '理科', ['数学', '英語', '社会'], 'I like science. I don\'t like math. → 理科が好き。'),
  L('質問に対する答えとして最も適切なものはどれですか。', 'What do you have in your bag?', 'I have a notebook.', ['Yes, I do.', 'It is a bag.', 'I like bags.'], 'What do you have 〜? には I have 〜. で答える。'),
  L('質問に対する答えとして最も適切なものはどれですか。', 'Who is that woman?', 'She is my mother.', ['He is my father.', 'Yes, she is.', 'It is a woman.'], 'who は「だれ」。woman（女性）なので she で答える。'),
];

// ---------- 読解（オリジナル本文） ----------
const passages: Subject['passages'] = {
  p1: {
    title: 'Aoi のスピーチ',
    text: `Hello, everyone. I'm Aoi. I'm from Saitama. I'm in the brass band. I play the trumpet. I practice it every day after school.

I have a brother. His name is Sota. He is ten. He likes soccer very much. He can run fast. We sometimes play soccer in the park on Sunday.

I like music and books. My favorite book is "The Little Prince." I read it again and again. Thank you.`,
  },
  p2: {
    title: 'Lucas との会話',
    text: `Lucas: Hi, Mei. What's that?
Mei: It's a furoshiki. It's a Japanese cloth.
Lucas: A furoshiki? What do you do with it?
Mei: We wrap things with it. I use it for my lunch box.
Lucas: Cool! Can I try?
Mei: Sure. Here you are.
Lucas: Thanks. ... Oh, this is difficult.
Mei: Don't worry. I can help you.`,
  },
  p3: {
    title: 'Emily のメール',
    text: `Hi, Taku.
How are you? I'm Emily. I live in Sydney, Australia. It is summer here in December. We don't have snow at Christmas. We often go to the beach!

I'm a junior high school student. I'm on the swimming team. I swim every morning before school. I like Japanese food. I eat sushi with my family on Friday.

Do you like sports? What do you do on weekends? Please write back.
Emily`,
  },
};
const P = (p: string, q: string, answer: string, wrong: string[], explain: string) =>
  ch('e-read', q, answer, wrong, explain, { passage: p });
const read = [
  P('p1', 'Aoi が入っている部活動はどれですか。', '吹奏楽部', ['サッカー部', '美術部', '水泳部'], "I'm in the brass band. → brass band ＝吹奏楽部。"),
  P('p1', 'Aoi はいつトランペットを練習しますか。', '毎日放課後', ['日曜日', '毎朝', '土曜日の放課後だけ'], 'I practice it every day after school.'),
  P('p1', 'Sota について正しいものはどれですか。', '10才で、速く走ることができる', ['13才で、トランペットをふく', '10才で、本を読むのが好き', 'Aoi の姉である'], 'He is ten. ... He can run fast.'),
  P('p1', 'Aoi と Sota が日曜日にときどきすることはどれですか。', '公園でサッカーをする', ['家で本を読む', 'トランペットを練習する', '海へ行く'], 'We sometimes play soccer in the park on Sunday.'),
  P('p1', '本文の内容に合うものはどれですか。', 'Aoi はお気に入りの本を何度も読む', ['Aoi は音楽が好きではない', 'Aoi には妹がいる', 'Aoi は東京出身である'], 'I read it again and again. =「何度も読む」。'),
  P('p2', 'furoshiki について Mei が説明していることはどれですか。', '物を包むのに使う日本の布', ['日本のお弁当箱', '日本のおかし', '日本の楽器'], "It's a Japanese cloth. We wrap things with it."),
  P('p2', 'Mei は furoshiki を何に使っていますか。', 'お弁当箱を包むこと', ['本を包むこと', '手をふくこと', '頭に巻くこと'], 'I use it for my lunch box.'),
  P('p2', 'Can I try? の意味として最も近いものはどれですか。', 'やってみてもいいですか', ['手伝ってくれますか', 'それは何ですか', 'あなたはできますか'], 'Can I 〜? =「〜してもいいですか」。'),
  P('p2', 'Lucas が furoshiki を使ってみて言ったことはどれですか。', 'むずかしい', ['かんたんだ', 'かっこいい', 'きれいだ'], 'Oh, this is difficult. → difficult ＝むずかしい。'),
  P('p2', '最後の Mei の言葉の意味はどれですか。', '心配しないで。手伝えるよ。', ['心配だね。手伝ってね。', 'だいじょうぶ？ 自分でやって。', 'ありがとう。また来てね。'], "Don't worry. =心配しないで。I can help you. =手伝えるよ。"),
  P('p3', 'Emily が住んでいる国はどこですか。', 'オーストラリア', ['アメリカ', 'カナダ', 'イギリス'], 'I live in Sydney, Australia.'),
  P('p3', 'Emily の住んでいる所の12月について正しいものはどれですか。', '夏で、クリスマスに雪はない', ['冬で、雪がたくさん降る', '春で、花がさく', '秋で、すずしい'], 'It is summer here in December. We don\'t have snow at Christmas.'),
  P('p3', 'Emily が毎朝学校の前にすることはどれですか。', '泳ぐ', ['すしを食べる', '海へ行く', '手紙を書く'], 'I swim every morning before school.'),
  P('p3', 'Emily が金曜日に家族とすることはどれですか。', 'すしを食べる', ['泳ぐ', '海へ行く', 'クリスマスを祝う'], 'I eat sushi with my family on Friday.'),
  P('p3', 'Emily が Taku にたずねていることはどれですか。', 'スポーツが好きか、週末に何をするか', ['日本の天気はどうか', 'すしが好きか', '何人家族か'], 'Do you like sports? What do you do on weekends?'),
];

// 本文の並べかえ（意味をとらえて文の順番を考える）
const sentOrder = [
  ord('e-sent', '意味が通るように、会話の文を正しい順に並べなさい。', ['Hi, Ken. What do you have?', "It's a new racket.", 'Do you play tennis?', 'Yes, I do. I play it every Sunday.'], 'たずねる → 答える → さらにたずねる → 答える、の順に会話がつながる。', { join: '\n' }),
  ord('e-sent', '意味が通るように、自己紹介の文を正しい順に並べなさい。', ['Hello. My name is Yuki.', "I'm from Osaka.", 'I like animals.', 'I have a dog and two cats.', 'Thank you.'], 'あいさつ・名前 → 出身 → 好きなもの → 具体的な説明 → 終わりのあいさつ。', { join: '\n' }),
  ord('e-sent', '意味が通るように、会話の文を正しい順に並べなさい。', ['Can you play the piano?', 'Yes, I can.', 'Great! Can you play this song?', "Sure. Let's play it together."], 'Can you 〜? → Yes, I can. → お願い → 引き受ける。', { join: '\n' }),
  ord('e-sent', '意味が通るように、会話の文を正しい順に並べなさい。', ['Who is that boy?', "He's Tom. He's my classmate.", 'Where is he from?', "He's from London."], 'who でたずねる → 答える → where でたずねる → 答える。', { join: '\n' }),
  ord('e-sent', '意味が通るように、文を正しい順に並べなさい。', ['I have a sister.', 'Her name is Saki.', 'She is a high school student.', 'She can speak English well.'], '「姉がいる」→「名前は」→「高校生だ」→「英語がじょうず」と、くわしくなっていく。', { join: '\n' }),
];

export const english: Subject = {
  id: 'english',
  name: '英語',
  icon: '🔤',
  color: '#d6336c',
  scope: 'Round 3（Unit 1〜8）／Round 4（Unit 4まで）／リスニング／文法（be動詞・一般動詞・can・代名詞など Unit 4 まで）',
  passages,
  units: [
    { id: 'e-listen', name: 'リスニング', questions: listen },
    { id: 'e-word', name: '単語', questions: words },
    { id: 'e-be', name: 'be動詞', questions: be },
    { id: 'e-verb', name: '一般動詞', questions: verb },
    { id: 'e-can', name: 'can', questions: can },
    { id: 'e-pron', name: '代名詞', questions: pron },
    { id: 'e-wh', name: '疑問詞', questions: wh },
    { id: 'e-order', name: '語の並べかえ', questions: order },
    { id: 'e-write', name: '和文英訳・英作文', questions: write },
    { id: 'e-read', name: '読解', questions: read },
    { id: 'e-sent', name: '本文の並べかえ', questions: sentOrder },
  ],
  exam: [
    { title: 'リスニング', units: ['e-listen'], count: 5, points: 2 },
    { title: '単語', units: ['e-word'], count: 6, points: 2 },
    { title: '文法', units: ['e-be', 'e-verb', 'e-can', 'e-pron', 'e-wh'], count: 12, points: 2 },
    { title: '並べかえ', units: ['e-order'], count: 4, points: 3 },
    { title: '英作文', units: ['e-write'], count: 3, points: 4 },
    { title: '読解', units: ['e-read'], count: 5, points: 4 },
    { title: '本文の並べかえ', units: ['e-sent'], count: 2, points: 5 },
  ],
};
