// 英語の追加問題（範囲：Unit 4 まで。be動詞・一般動詞・can・代名詞・疑問詞。3人称単数現在はまだ出さない）
import type { ChoiceQ, InputQ, OrderQ, Question, Subject } from '../types';

let i = 0;
const ch = (unit: string, q: string, answer: string, wrong: string[], explain: string, extra: Partial<ChoiceQ> = {}): ChoiceQ => ({
  id: `${unit}-m${i++}`, unit, type: 'choice', q, answer, choices: [answer, ...wrong], explain, ...extra,
});
const en = (unit: string, q: string, answers: string[], explain: string): InputQ => ({
  id: `${unit}-m${i++}`, unit, type: 'input', kind: 'en', q, answers, explain,
});
const ord = (unit: string, q: string, tokens: string[], explain: string, extra: Partial<OrderQ> = {}): OrderQ => ({
  id: `${unit}-m${i++}`, unit, type: 'order', q, tokens, join: ' ', explain, ...extra,
});
const C = (unit: string) => (q: string, answer: string, wrong: string[], explain: string) => ch(unit, `( ) に入る語を選びなさい。\n${q}`, answer, wrong, explain);

const be = C('e-be');
const verb = C('e-verb');
const can = C('e-can');
const pron = C('e-pron');
const wh = C('e-wh');
const L = (q: string, audio: string, answer: string, wrong: string[], explain: string) =>
  ch('e-listen', `🔊 英語を聞いて答えなさい。\n${q}`, answer, wrong, `【英文】${audio}\n\n${explain}`, { audio });
const P = (q: string, answer: string, wrong: string[], explain: string) => ch('e-read', q, answer, wrong, explain, { passage: 'p4' });

export const moreEnglish: { units: Record<string, Question[]>; passages: NonNullable<Subject['passages']> } = {
  units: {
    'e-be': [
      be('We ( ) in the same class.', 'are', ['am', 'is', 'be'], '主語が we（複数）のときは are。'),
      be('Ken and I ( ) good friends.', 'are', ['am', 'is', 'be'], '「Ken and I」は2人なので are。I があっても am にはならない。'),
      be('( ) this your pen? — No, it isn\'t.', 'Is', ['Are', 'Do', 'Am'], 'this が主語なので Is。答えは it で受ける。'),
      be('Are you hungry? — Yes, I ( ).', 'am', ['are', 'do', 'is'], 'Are you 〜? には I am で答える（Yes, I\'m. とは短縮しない）。'),
      ch('e-be', '「あなたたちは中学生ですか。」の英文として正しいものはどれですか。', 'Are you junior high school students?', ['Are you a junior high school student?', 'Do you junior high school students?', 'Is you junior high school students?'], '「あなたたち」なので students と複数形。a は付けない。'),
    ],
    'e-verb': [
      verb('I ( ) a sister.', 'have', ['am', 'has', 'am have'], '一般動詞の文に be動詞はいらない。'),
      verb('( ) you walk to school? — No. I go by bus.', 'Do', ['Are', 'Can', 'Is'], '一般動詞の疑問文は Do で始める。'),
      verb('We don\'t ( ) TV in the morning.', 'watch', ['watches', 'watching', 'are watch'], 'don\'t のあとは動詞のもとの形。'),
      verb('Do they ( ) Japanese? — Yes, they do.', 'speak', ['speaks', 'speaking', 'are speak'], 'Do の疑問文では動詞はもとの形。'),
      ch('e-verb', '「私は朝食を食べません。」の英文として正しいものはどれですか。', "I don't eat breakfast.", ["I am not eat breakfast.", "I not eat breakfast.", "I eat not breakfast."], '一般動詞の否定文は do not（don\'t）＋動詞。'),
      ch('e-verb', 'Do you like soccer? の答えとして正しくないものはどれですか。', 'Yes, I am.', ['Yes, I do.', "No, I don't.", 'Yes. I like it very much.'], 'Do 〜? の質問に am では答えない。'),
    ],
    'e-can': [
      can('Can your brother ( ) a car?', 'drive', ['drives', 'driving', 'is drive'], 'can のあとの動詞は原形。主語が your brother でも同じ。'),
      can('I ( ) speak Chinese. I can only speak Japanese and English.', "can't", ["don't", "am not", 'can'], '「話せない」は can\'t。'),
      ch('e-can', '「窓を開けてくれますか。」の英文として最も適切なものはどれですか。', 'Can you open the window?', ['Can I open the window?', 'Do you open the window?', 'Are you open the window?'], 'Can you 〜? =「〜してくれますか」（依頼）。Can I 〜? は「〜してもいいですか」。'),
      ch('e-can', 'Can I sit here? と聞かれて、許可するときの答えとして最も適切なものはどれですか。', 'Sure. Go ahead.', ['Yes, I can.', 'No, you are not.', 'Yes, I do.'], 'Can I 〜?（許可を求める）には Sure. / OK. / Go ahead. などで答える。'),
    ],
    'e-pron': [
      pron('Look at those girls. Do you know ( )?', 'them', ['they', 'their', 'theirs'], 'know のあとは「〜を」の形。they → them。'),
      pron('This is Mr. Sato. ( ) car is red.', 'His', ['He', 'Him', "He's"], '「彼の」は his。'),
      pron('Is this bag yours? — No, it\'s not ( ). It\'s Yuki\'s.', 'mine', ['my', 'me', 'I'], '「私のもの」は mine。'),
      pron('My father and I often go fishing. ( ) like the sea.', 'We', ['Us', 'Our', 'They'], '「父と私」＝私たち（we）。'),
      ch('e-pron', '次の組み合わせのうち、まちがっているものはどれですか。（〜は・〜の・〜を・〜のもの）', 'she — her — her — her', ['I — my — me — mine', 'he — his — him — his', 'they — their — them — theirs'], 'she の「〜のもの」は hers。her ではない。'),
    ],
    'e-wh': [
      wh('( ) is your favorite subject? — It\'s music.', 'What', ['Who', 'Where', 'How'], '「何が好きな教科か」→ what。'),
      wh('( ) old are you? — I\'m thirteen.', 'How', ['What', 'When', 'Who'], 'How old 〜? =「何才」。'),
      wh('( ) bag is this? — It\'s mine.', 'Whose', ['Who', 'What', 'Which'], 'Whose 〜? =「だれの〜」。'),
      wh('( ) do you go to the library? — On Saturdays.', 'When', ['Where', 'What', 'How'], '答えが曜日（いつ）なので when。'),
      wh('( ) do you come to school? — By bike.', 'How', ['What', 'Where', 'When'], '「どうやって」→ how。By bike. =自転車で。'),
    ],
    'e-word': [
      en('e-word', '「1月」を英語で書きなさい。', ['January'], 'January。月は大文字で始める。'),
      en('e-word', '「金曜日」を英語で書きなさい。', ['Friday'], 'Friday。'),
      en('e-word', '「15」を英語のつづりで書きなさい。', ['fifteen'], 'fifteen（five ではなく fif-）。'),
      en('e-word', '「40」を英語のつづりで書きなさい。', ['forty'], 'forty（four と ちがい u がない）。'),
      en('e-word', '「音楽」を英語で書きなさい。', ['music'], 'music。'),
      en('e-word', '「教室」を英語で書きなさい。', ['classroom'], 'classroom（1語）。'),
      en('e-word', '「話す（言語を）」を英語で書きなさい。', ['speak'], 'speak English =「英語を話す」。'),
      ch('e-word', 'usually の意味はどれですか。', 'ふつうは、たいてい', ['いつも', 'ときどき', '決して〜ない'], 'always > usually > often > sometimes。'),
      ch('e-word', '次のうち、教科を表す語でないものはどれですか。', 'library', ['science', 'P.E.', 'social studies'], 'library は「図書館」。P.E. は体育。'),
    ],
    'e-order': [
      ord('e-order', '日本語に合うように並べかえなさい。\n「あなたはどこに住んでいますか。」', ['Where', 'do', 'you', 'live', '?'], '疑問詞 + do you + 動詞 〜?'),
      ord('e-order', '日本語に合うように並べかえなさい。\n「私は毎日、母を手伝います。」', ['I', 'help', 'my', 'mother', 'every', 'day', '.'], 'every day は文の最後。'),
      ord('e-order', '日本語に合うように並べかえなさい。\n「あれはだれの自転車ですか。」', ['Whose', 'bike', 'is', 'that', '?'], 'Whose + 名詞 + is 〜?'),
      ord('e-order', '日本語に合うように並べかえなさい。\n「私たちは彼らをよく知っています。」', ['We', 'know', 'them', 'well', '.'], '「彼らを」は them。well は最後。'),
      ord('e-order', '日本語に合うように並べかえなさい。\n「あなたは何時に起きますか。」', ['What', 'time', 'do', 'you', 'get', 'up', '?'], 'What time do you 〜? =「何時に〜しますか」。'),
      ord('e-order', '日本語に合うように並べかえなさい。\n「私の兄は速く泳げません。」', ['My', 'brother', "can't", 'swim', 'fast', '.'], "can't + 動詞の原形。"),
    ],
    'e-write': [
      en('e-write', '次の日本語を英語にしなさい。\n「あなたはテニスをしますか。」', ['Do you play tennis'], 'Do you + 動詞 〜?'),
      en('e-write', '次の日本語を英語にしなさい。\n「私は犬を飼っていません。」', ["I don't have a dog", 'I do not have a dog', "I don't have any dogs", "I don't have dogs"], "don't have =「持っていない・飼っていない」。"),
      en('e-write', '次の日本語を英語にしなさい。\n「あなたは何を持っていますか。」', ['What do you have'], 'What do you have? =「何を持っていますか」。'),
      en('e-write', '次の日本語を英語にしなさい。\n「彼は私の兄です。」', ['He is my brother', "He's my brother"], 'he → is。'),
      en('e-write', '次の日本語を英語にしなさい。\n「あなたは料理ができますか。」', ['Can you cook'], 'Can you + 動詞の原形 〜?'),
    ],
    'e-listen': [
      L('話している人が毎朝することはどれですか。', 'I get up at six every morning. I walk my dog before breakfast.', '犬の散歩をする', ['朝ごはんを作る', 'ジョギングをする', 'ピアノを練習する'], 'I walk my dog before breakfast. → 朝食の前に犬の散歩。'),
      L('話している人の好きな食べ物はどれですか。', 'My favorite food is curry and rice. I don\'t like fish.', 'カレーライス', ['魚', 'すし', 'ラーメン'], 'My favorite food is curry and rice.'),
      L('エミは何部に入っていますか。', 'This is Emi. She is in the tennis club. She can play the piano, too.', 'テニス部', ['音楽部', '美術部', 'サッカー部'], 'She is in the tennis club.'),
      L('質問に対する答えとして最も適切なものはどれですか。', 'How do you go to school?', 'I walk to school.', ['I go to school at eight.', 'Yes, I do.', 'My school is big.'], 'How は「どうやって」。手段を答える。'),
      L('質問に対する答えとして最も適切なものはどれですか。', 'Whose notebook is this?', "It's Ken's.", ["It's a notebook.", 'Yes, it is.', 'Ken is my friend.'], 'Whose は「だれの」。持ち主を答える。'),
      L('質問に対する答えとして最も適切なものはどれですか。', 'When do you practice the piano?', 'After dinner.', ['At home.', 'Yes, I do.', 'With my sister.'], 'When は「いつ」。'),
    ],
    'e-read': [
      P('Ryo が住んでいるのはどこですか。', '埼玉', ['東京', '大阪', 'ロンドン'], 'I live in Saitama.'),
      P('Ryo が日曜日にすることはどれですか。', '父と川で魚つりをする', ['友だちとサッカーをする', '図書館で勉強する', '祖母の家に行く'], 'On Sundays, I go fishing in the river with my father.'),
      P('Ryo が料理について言っていることはどれですか。', 'カレーを作れるが、魚は料理できない', ['魚を料理するのが得意だ', '料理はまったくできない', '毎日夕食を作る'], 'I can cook curry, but I can\'t cook fish.'),
      P('本文の内容に合うものはどれですか。', 'Ryo は動物が好きで、ネコを2匹飼っている', ['Ryo は犬を2匹飼っている', 'Ryo の父は魚が好きではない', 'Ryo は月曜日に魚つりに行く'], 'I like animals. I have two cats.'),
      P('Ryo が Mike にたずねていることはどれですか。', '魚つりが好きか', ['ネコを飼っているか', 'カレーが作れるか', 'どこに住んでいるか'], 'Do you like fishing?'),
    ],
    'e-sent': [
      ord('e-sent', '意味が通るように、会話の文を正しい順に並べなさい。', ['What do you do on Sundays?', 'I play baseball with my friends.', 'Are you a good player?', 'Yes! I can hit the ball well.'], '質問 → 答え → さらに質問 → 答え。', { join: '\n' }),
      ord('e-sent', '意味が通るように、文を正しい順に並べなさい。', ['This is my friend, Lisa.', 'She is from Canada.', 'She can speak English and French.', 'She is a very good singer, too.'], '紹介 → 出身 → できること → 付け加え（too）。', { join: '\n' }),
      ord('e-sent', '意味が通るように、会話の文を正しい順に並べなさい。', ['Excuse me. Is this your pen?', 'No, it isn\'t.', 'Whose pen is it?', "I think it's Tom's."], '質問 → 否定 → だれのものか質問 → 答え。', { join: '\n' }),
    ],
  },
  passages: {
    p4: {
      title: 'Ryo のメール',
      text: `Hi, Mike.
My name is Ryo. I live in Saitama. I'm a junior high school student.

I like animals. I have two cats. Their names are Kuro and Shiro. They are very cute.

On Sundays, I go fishing in the river with my father. We like fish very much. I can cook curry, but I can't cook fish. My father can cook fish well.

Do you like fishing? Please tell me about you.
Ryo`,
    },
  },
};
