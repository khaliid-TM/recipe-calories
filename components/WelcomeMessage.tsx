import React from 'react';

export const WelcomeMessage: React.FC = () => {
    return (
        <div className="w-full max-w-xl text-center bg-slate-800/50 border border-slate-700 rounded-2xl p-8 mt-4">
            <h2 className="text-2xl font-bold text-slate-200 mb-3">How it works</h2>
            <div className="text-left text-slate-400 space-y-3">
                <p className="flex items-start">
                    <span className="text-cyan-400 font-bold mr-3">1.</span>
                    <span>Upload a clear picture of a single dish.</span>
                </p>
                <p className="flex items-start">
                    <span className="text-cyan-400 font-bold mr-3">2.</span>
                    <span>Click the "Estimate Calories" button.</span>
                </p>
                <p className="flex items-start">
                    <span className="text-cyan-400 font-bold mr-3">3.</span>
                    <span>Our AI will analyze the food and provide an estimated calorie count along with key ingredients.</span>
                </p>
            </div>
            <p className="text-xs text-slate-500 mt-6">
                Please note: The calorie count is an AI-generated estimate and should be used for informational purposes only.
            </p>
        </div>
    );
};
