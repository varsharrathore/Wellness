'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ChevronRight } from 'lucide-react';

const questions = [
  {
    id: 1,
    question: "What's your experience level?",
    options: ['Beginner', 'Intermediate', 'Advanced', 'Expert']
  },
  {
    id: 2,
    question: "What are you looking for?",
    options: ['Solo Play', 'Couples Fun', 'Both', 'Not Sure']
  },
  {
    id: 3,
    question: "What's your preferred intensity?",
    options: ['Gentle & Soft', 'Moderate', 'Powerful', 'Adjustable']
  },
  {
    id: 4,
    question: "What matters most to you?",
    options: ['Discreet Design', 'Premium Quality', 'Innovative Features', 'Value for Money']
  }
];

export default function QuizPage() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const router = useRouter();

  const handleAnswer = (answer: string) => {
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      router.push('/products');
    }
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-white">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600 mb-4">
            Find Your Perfect Match
          </h1>
          <p className="text-gray-600 text-lg">Answer a few questions to discover products tailored for you</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Question {currentQuestion + 1} of {questions.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-500 rounded-full"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-12 border-2 border-pink-100">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            {questions[currentQuestion].question}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {questions[currentQuestion].options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(option)}
                className="group relative bg-gradient-to-br from-pink-50 to-purple-50 hover:from-pink-100 hover:to-purple-100 border-2 border-pink-200 hover:border-pink-400 rounded-2xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-gray-800">{option}</span>
                  <ChevronRight className="h-6 w-6 text-pink-500 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Skip Button */}
        <div className="text-center mt-8">
          <button
            onClick={() => router.push('/products')}
            className="text-gray-500 hover:text-gray-700 underline"
          >
            Skip quiz and browse all products
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
}
