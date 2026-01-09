import { Chapter, Question, QuestionType, WeeklyExam, ExamRecord, UserStats, ExamStats } from './types';

export const CHAPTERS: Chapter[] = [
  {
    id: '1',
    title: '第一章 數與式',
    subChapters: [
      { id: '1-1', title: '1-1 實數', videoId: 'x8v_pNX6bQY' },
      { id: '1-2', title: '1-2 式的運算', videoId: 'video-1-2' },
      { id: '1-3', title: '1-3 指數與對數', videoId: 'video-1-3' },
    ]
  },
  {
    id: '2',
    title: '第二章 直線與圓',
    subChapters: [
      { id: '2-1', title: '2-1 直線方程式', videoId: 'video-2-1' },
      { id: '2-2', title: '2-2 圓方程式', videoId: 'video-2-2' },
    ]
  }
];

export const QUESTION_POOL: Question[] = [
  {
    id: 'q1',
    type: QuestionType.SINGLE_CHOICE,
    content: '若 $x$ 為實數且 $|x-2| \\le 3$，則 $x$ 的範圍為何？',
    options: ['$-1 \\le x \\le 5$', '$-5 \\le x \\le 1$', '$1 \\le x \\le 5$', '$x \\ge 5$ 或 $x \\le -1$'],
    correctAnswer: '0',
    solution: '由 $|x-2| \\le 3$ 可得 $-3 \\le x-2 \\le 3$，兩邊加 2 得 $-1 \\le x \\le 5$。',
    tags: ['1-1'],
    difficulty: 2
  },
  {
    id: 'q2',
    type: QuestionType.FILL_IN_BLANK,
    content: '設 $a=\\sqrt{7+\\sqrt{48}}$，則 $a$ 的整數部分為 $\\underline{\\hspace{1cm}}$。',
    correctAnswer: '3',
    solution: '$a = \\sqrt{7+2\\sqrt{12}} = \\sqrt{4}+\\sqrt{3} = 2 + 1.732... = 3.732...$，故整數部分為 3。',
    tags: ['1-1'],
    difficulty: 3
  },
  {
    id: 'q3',
    type: QuestionType.SINGLE_CHOICE,
    content: '已知 $1+\\sqrt{2}i$ 為實係數多項式 $f(x)=0$ 之一根，則 $f(x)$ 必含有下列哪一個因式？',
    options: ['$x^2+2x+3$', '$x^2-2x+3$', '$x^2-2x-3$', '$x^2+2x-3$'],
    correctAnswer: '1',
    solution: '虛根成對，故 $1-\\sqrt{2}i$ 亦為根。因式為 $(x-(1+\\sqrt{2}i))(x-(1-\\sqrt{2}i)) = (x-1)^2+2 = x^2-2x+3$。',
    tags: ['1-2'],
    difficulty: 4
  },
  {
    id: 'q4',
    type: QuestionType.FILL_IN_BLANK,
    content: '求值：$\\log_2 8 + \\log_3 9 = \\underline{\\hspace{1cm}}$。',
    correctAnswer: '5',
    solution: '$\\log_2 2^3 + \\log_3 3^2 = 3 + 2 = 5$。',
    tags: ['1-3'],
    difficulty: 1
  },
  {
    id: 'q5',
    type: QuestionType.SINGLE_CHOICE,
    content: '若 $2^x = 32$，則 $x = $？',
    options: ['4', '5', '6', '7'],
    correctAnswer: '1',
    solution: '$2^5 = 32$，故 $x=5$。',
    tags: ['1-3'],
    difficulty: 1
  },
  {
    id: 'q6',
    type: QuestionType.FILL_IN_BLANK,
    content: '化簡 $\\sqrt{8} + \\sqrt{18} = \\underline{\\hspace{1cm}}$。',
    correctAnswer: '5\\sqrt{2}',
    solution: '$2\\sqrt{2} + 3\\sqrt{2} = 5\\sqrt{2}$。',
    tags: ['1-1'],
    difficulty: 2
  },
  {
    id: 'q7',
    type: QuestionType.SINGLE_CHOICE,
    content: '直線 $L: 2x - y + 3 = 0$ 的斜率為？',
    options: ['2', '-2', '1/2', '-1/2'],
    correctAnswer: '0',
    solution: '$y = 2x + 3$，故斜率為 2。',
    tags: ['2-1'],
    difficulty: 1
  },
  {
    id: 'q8',
    type: QuestionType.FILL_IN_BLANK,
    content: '圓 $C: x^2 + y^2 = 25$ 的半徑為 $\\underline{\\hspace{1cm}}$。',
    correctAnswer: '5',
    solution: '$r^2 = 25 \\implies r = 5$。',
    tags: ['2-2'],
    difficulty: 1
  },
  {
    id: 'q9',
    type: QuestionType.SINGLE_CHOICE,
    content: '若 $(x-1)(x-2) < 0$，則 $x$ 的範圍為？',
    options: ['$x < 1$', '$x > 2$', '$1 < x < 2$', '$x < 1$ 或 $x > 2$'],
    correctAnswer: '2',
    solution: '開口向上拋物線，小於 0 落在兩根之間。',
    tags: ['1-2'],
    difficulty: 2
  },
  {
    id: 'q10',
    type: QuestionType.FILL_IN_BLANK,
    content: '計算 $(a+b)^2 = a^2 + \\underline{\\hspace{1cm}} + b^2$。',
    correctAnswer: '2ab',
    solution: '乘法公式展開。',
    tags: ['1-2'],
    difficulty: 1
  }
];

const HISTORY_KEY = 'LSS_HISTORY_RECORDS';
const STATS_KEY = 'LSS_USER_STATS';

const MOCK_HISTORY_BASE: ExamRecord[] = [
  {
    id: 'rec_init_001',
    date: '2023-10-15 10:20',
    title: '1-1 實數 基礎練習',
    type: 'Practice',
    score: 80,
    totalScore: 100,
    answers: { 'q1': '0', 'q2': '4' },
    questions: [QUESTION_POOL[0], QUESTION_POOL[1]]
  }
];

export const getHistory = (): ExamRecord[] => {
  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    if (!stored) {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(MOCK_HISTORY_BASE));
      return MOCK_HISTORY_BASE;
    }
    return JSON.parse(stored);
  } catch (e) {
    console.error("Failed to parse history", e);
    return MOCK_HISTORY_BASE;
  }
};

export const saveRecord = (record: ExamRecord) => {
  const history = getHistory();
  const newHistory = [record, ...history];
  localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
};

export const getUserStats = (): UserStats => {
  const stored = localStorage.getItem(STATS_KEY);
  if (!stored) {
    const initial = { streak: 12, points: 2450 };
    localStorage.setItem(STATS_KEY, JSON.stringify(initial));
    return initial;
  }
  return JSON.parse(stored);
};

export const completeDailyChallenge = (isCorrect: boolean): UserStats => {
  const stats = getUserStats();
  const today = new Date().toISOString().split('T')[0];
  if (stats.lastDailyChallenge !== today) {
    if (isCorrect) stats.points += 100;
    stats.streak += 1;
    stats.lastDailyChallenge = today;
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  }
  return stats;
};

export const generateGlobalStats = (): ExamStats => ({
  topMark: 92,
  avgMark: 68,
  lowMark: 42,
  distribution: [5, 8, 12, 15, 20, 25, 30, 22, 10, 5]
});

export const WEEKLY_EXAMS: WeeklyExam[] = [
  {
    id: 'exam_w1',
    title: '第一週：數與式綜合測驗',
    dateRange: '2023/10/01 - 2023/10/07',
    status: 'available',
    questions: QUESTION_POOL.slice(0, 10)
  },
  {
    id: 'exam_w2',
    title: '第二週：式的運算與直線',
    dateRange: '2023/10/24 - 2023/10/31',
    status: 'available',
    questions: QUESTION_POOL.slice(0, 10)
  }
];

export const getFormattedNow = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
};