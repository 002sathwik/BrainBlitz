"use client";
import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import api from '../services/api';
import { Question } from '../types/quiz.types';

interface CreateQuizPageProps {
    onNavigate: (page: 'home' | 'quiz-list') => void;
}

export const CreateQuizPage: React.FC<CreateQuizPageProps> = ({ onNavigate }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [questions, setQuestions] = useState<Question[]>([
        {
            question: '',
            timeLimit: 20,
            options: [
                { text: '', isCorrect: false },
                { text: '', isCorrect: false },
                { text: '', isCorrect: false },
                { text: '', isCorrect: false },
            ],
        },
    ]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const addQuestion = () => {
        setQuestions([
            ...questions,
            {
                question: '',
                timeLimit: 20,
                options: [
                    { text: '', isCorrect: false },
                    { text: '', isCorrect: false },
                    { text: '', isCorrect: false },
                    { text: '', isCorrect: false },
                ],
            },
        ]);
    };

    const removeQuestion = (index: number) => {
        setQuestions(questions.filter((_, i) => i !== index));
    };

    const updateQuestion = (index: number, field: string, value: any) => {
        const updated = [...questions];
        updated[index] = { ...updated[index], [field]: value };
        setQuestions(updated);
    };

    const updateOption = (qIndex: number, oIndex: number, text: string) => {
        const updated = [...questions];
        updated[qIndex].options[oIndex].text = text;
        setQuestions(updated);
    };

    const setCorrectAnswer = (qIndex: number, oIndex: number) => {
        const updated = [...questions];
        updated[qIndex].options = updated[qIndex].options.map((opt, i) => ({
            ...opt,
            isCorrect: i === oIndex,
        }));
        setQuestions(updated);
    };

    const handleSubmit = async () => {
        setError('');
        setLoading(true);

        try {
            const response = await api.createQuiz({ title, description, questions });

            if (response.success) {
                alert('Quiz created successfully!');
                onNavigate('quiz-list');
            } else {
                setError(response.error || 'Failed to create quiz');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold mb-8">Create New Quiz</h2>

            <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-xl font-bold mb-4">Quiz Information</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Title *</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="Enter quiz title"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="Enter quiz description (optional)"
                                rows={3}
                            />
                        </div>
                    </div>
                </div>

                {questions.map((q, qIndex) => (
                    <div key={qIndex} className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">Question {qIndex + 1}</h3>
                            {questions.length > 1 && (
                                <button
                                    onClick={() => removeQuestion(qIndex)}
                                    className="text-red-600 hover:text-red-700"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            )}
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Question Text *</label>
                                <input
                                    type="text"
                                    value={q.question}
                                    onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                                    placeholder="Enter your question"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Time Limit (seconds)</label>
                                <input
                                    type="number"
                                    value={q.timeLimit}
                                    onChange={(e) => updateQuestion(qIndex, 'timeLimit', parseInt(e.target.value))}
                                    className="w-32 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                                    min={5}
                                    max={120}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Options (select correct answer) *
                                </label>
                                <div className="space-y-2">
                                    {q.options.map((opt, oIndex) => (
                                        <div key={oIndex} className="flex items-center space-x-2">
                                            <input
                                                type="radio"
                                                name={`correct-${qIndex}`}
                                                checked={opt.isCorrect}
                                                onChange={() => setCorrectAnswer(qIndex, oIndex)}
                                                className="w-5 h-5 text-green-600"
                                            />
                                            <input
                                                type="text"
                                                value={opt.text}
                                                onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                                                className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                                                placeholder={`Option ${oIndex + 1}`}
                                            />
                                            {opt.isCorrect && (
                                                <span className="text-green-600 font-medium">✓ Correct</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                <button
                    onClick={addQuestion}
                    className="w-full py-3 border-2 border-dashed border-purple-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition flex items-center justify-center space-x-2"
                >
                    <Plus className="w-5 h-5" />
                    <span>Add Another Question</span>
                </button>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                        {error}
                    </div>
                )}

                <div className="flex space-x-4">
                    <button
                        onClick={() => onNavigate('home')}
                        className="flex-1 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex-1 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
                    >
                        {loading ? 'Creating...' : 'Create Quiz'}
                    </button>
                </div>
            </div>
        </div>
    );
};
