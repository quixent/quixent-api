import mongoose from 'mongoose';
import Question from '../models/Question';
import Answer from '../models/Answer';

export const getAllQuestionsService = async () => {
  return Question.find().sort({ order: 1 }).select('-__v');
};

export const getQuestionsForMatchService = async (matchId: string, userId: string) => {
  const [questions, answers] = await Promise.all([
    Question.find().sort({ order: 1 }).select('-__v'),
    Answer.find({ matchId: new mongoose.Types.ObjectId(matchId), userId }),
  ]);
  const answerMap = new Map(answers.map((a) => [a.questionId.toString(), a.optionId.toString()]));

  return {
    matchId,
    questions: questions.map((q) => ({
      _id: q._id.toString(),
      text: q.text,
      order: q.order,
      options: q.options.map((o) => ({ _id: o._id.toString(), text: o.text })),
      answered: answerMap.has(q._id.toString()),
      selectedOptionId: answerMap.get(q._id.toString()) ?? null,
    })),
  };
};
