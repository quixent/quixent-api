import Question from './models/Question';

const questions = [
  {
    order: 1,
    text: 'How do you prefer to spend your weekends?',
    options: [
      { text: 'Outdoor adventures & travel', weight: 5 },
      { text: 'Socialising with friends & family', weight: 4 },
      { text: 'Relaxing at home with movies/books', weight: 3 },
      { text: 'Working on personal projects', weight: 2 },
    ],
  },
  {
    order: 2,
    text: 'What is your approach to finances?',
    options: [
      { text: 'Save first, spend later', weight: 5 },
      { text: 'Balanced — save some, enjoy some', weight: 4 },
      { text: 'Live in the moment, spend freely', weight: 2 },
      { text: 'Invest aggressively', weight: 3 },
    ],
  },
  {
    order: 3,
    text: 'How important is religion/spirituality in your life?',
    options: [
      { text: 'Very important — practice daily', weight: 5 },
      { text: 'Important but personal', weight: 4 },
      { text: 'Respect it but not a priority', weight: 2 },
      { text: 'Not important to me', weight: 1 },
    ],
  },
  {
    order: 4,
    text: 'What are your thoughts on having children?',
    options: [
      { text: 'Definitely want kids', weight: 5 },
      { text: 'Open to it', weight: 4 },
      { text: 'Undecided', weight: 3 },
      { text: 'Do not want kids', weight: 1 },
    ],
  },
  {
    order: 5,
    text: 'How do you handle conflicts in a relationship?',
    options: [
      { text: 'Talk it out immediately', weight: 5 },
      { text: 'Take time to cool down then discuss', weight: 4 },
      { text: 'Avoid conflict, let it pass', weight: 2 },
      { text: 'Seek outside help (family/counsellor)', weight: 3 },
    ],
  },
  {
    order: 6,
    text: 'Where would you prefer to live after marriage?',
    options: [
      { text: 'With parents / joint family', weight: 5 },
      { text: 'Near parents but independent', weight: 4 },
      { text: 'In a different city for career', weight: 3 },
      { text: 'Abroad', weight: 2 },
    ],
  },
  {
    order: 7,
    text: 'How would you describe your social life?',
    options: [
      { text: 'Very social — love large gatherings', weight: 5 },
      { text: 'Selective — close circle of friends', weight: 4 },
      { text: 'Mostly introverted, prefer one-on-one', weight: 3 },
      { text: 'Homebody, rarely go out', weight: 2 },
    ],
  },
  {
    order: 8,
    text: 'How do you feel about your partner working?',
    options: [
      { text: 'Strongly encourage career growth', weight: 5 },
      { text: 'Fine either way', weight: 4 },
      { text: 'Prefer partner focuses on home', weight: 2 },
      { text: 'Depends on life stage', weight: 3 },
    ],
  },
  {
    order: 9,
    text: 'What best describes your personality?',
    options: [
      { text: 'Adventurous & spontaneous', weight: 5 },
      { text: 'Caring & family-oriented', weight: 4 },
      { text: 'Ambitious & driven', weight: 3 },
      { text: 'Calm & easygoing', weight: 4 },
    ],
  },
  {
    order: 10,
    text: 'How do you show love?',
    options: [
      { text: 'Quality time together', weight: 5 },
      { text: 'Words of affirmation', weight: 4 },
      { text: 'Acts of service', weight: 4 },
      { text: 'Gifts & surprises', weight: 3 },
    ],
  },
];

export async function seedQuestions(): Promise<void> {
  const count = await Question.countDocuments();
  if (count > 0) return;

  await Question.insertMany(questions);
  console.log(`✅ Seeded ${questions.length} questions`);
}
