
"use client"
import React, { useState, ChangeEvent } from 'react';
import 'tailwindcss/tailwind.css';

interface Color {
    code: string;
    weight: number;
}

interface Matching {
    colors: Color[];
    productionWeight: number;
    neededWeight: number;
}

const ClothTrackingApp: React.FC = () => {
    const [xyzId, setXyzId] = useState<string>("");
    const [matching, setMatching] = useState<Matching>({ colors: [], productionWeight: 0, neededWeight: 0 });
    const [analysis, setAnalysis] = useState<Map<string, number> | null>(null);

    const colorCodes = ["B2R", "HBX", "R2B", "G4Y", "O2P", "L6C", "T3M", "S1W"];

    const handleXyzIdChange = (e: ChangeEvent<HTMLInputElement>) => {
        setXyzId(e.target.value);
    };

    const handleMatchingChange = (key: string, value: string | number) => {
        setMatching({ ...matching, [key]: value });
    };

    const handleColorChange = (colorIndex: number, key: string, value: string) => {
        const updatedColors = [...matching.colors];
        updatedColors[colorIndex][key] = value;
        setMatching({ ...matching, colors: updatedColors });
    };

    const addColor = () => {
        setMatching({
            ...matching,
            colors: [...matching.colors, { code: "", weight: 0 }]
        });
    };

    const calculateTotalColorWeight = (matching: Matching): Map<string, number> => {
        const totalColorWeightMap = new Map<string, number>();
        matching.colors.forEach(color => {
            if (totalColorWeightMap.has(color.code)) {
                totalColorWeightMap.set(color.code, totalColorWeightMap.get(color.code)! + color.weight);
            } else {
                totalColorWeightMap.set(color.code, color.weight);
            }
        });
        return totalColorWeightMap;
    };

    const calculateExpectedWeight = (matching: Matching): Map<string, number> => {
        const expectedWeights = new Map<string, number>();
        matching.colors.forEach(color => {
            const expectedWeight = (color.weight / matching.productionWeight) * matching.neededWeight * 1000; // Convert kg to grams
            expectedWeights.set(color.code, expectedWeight);
        });
        return expectedWeights;
    };

    const handleSubmit = () => {
        const result = calculateTotalColorWeight(matching);
        setAnalysis(result);
    };

    return (
        <div className="container mx-auto mt-10 p-5 max-w-lg bg-white shadow-lg rounded-lg">
            <h1 className="text-2xl font-bold text-gray-800 text-center">Cloth Tracking Application</h1>

            <div className="cloth-info mt-5">
                <h2 className="text-xl font-semibold text-gray-700">Cloth Information</h2>
                <label className="block mt-3">
                    <span className="text-gray-700">XYZ ID:</span>
                    <input
                        type="text"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 text-black rounded-md shadow-sm focus:outline-none focus:ring focus:ring-opacity-50"
                        value={xyzId}
                        onChange={handleXyzIdChange}
                    />
                </label>
            </div>

            <div className="matching mt-5">
                <h2 className="text-xl font-semibold text-gray-700">Matching</h2>
                {matching.colors.map((color, colorIndex) => (
                    <div key={colorIndex} className="color mt-2">
                        <label className="block">
                            <span className="text-gray-700">Color Code:</span>
                            <select
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 text-black rounded-md shadow-sm focus:outline-none focus:ring focus:ring-opacity-50"
                                value={color.code}
                                onChange={(e) => handleColorChange(colorIndex, 'code', e.target.value)}
                            >
                                <option value="">Select Color Code</option>
                                {colorCodes.map((code, index) => (
                                    <option key={index} value={code}>{code}</option>
                                ))}
                            </select>
                        </label>
                        <label className="block mt-2">
                            <span className="text-gray-700">Weight (grams):</span>
                            <input
                                type="number"
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 text-black rounded-md shadow-sm focus:outline-none focus:ring focus:ring-opacity-50"
                                value={color.weight}
                                onChange={(e) => handleColorChange(colorIndex, 'weight', parseFloat(e.target.value))}
                            />
                        </label>
                    </div>
                ))}
                <button className="mt-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={addColor}>Add Color</button>
                <label className="block mt-3">
                    <span className="text-gray-700">Production Weight (kg):</span>
                    <input
                        type="number"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 text-black rounded-md shadow-sm focus:outline-none focus:ring focus:ring-opacity-50"
                        value={matching.productionWeight}
                        onChange={(e) => handleMatchingChange('productionWeight', parseFloat(e.target.value))}
                    />
                </label>
                <label className="block mt-3">
                    <span className="text-gray-700">Needed Weight (kg):</span>
                    <input
                        type="number"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 text-black rounded-md shadow-sm focus:outline-none focus:ring focus:ring-opacity-50"
                        value={matching.neededWeight}
                        onChange={(e) => handleMatchingChange('neededWeight', parseFloat(e.target.value))}
                    />
                </label>
            </div>

            <div className="mt-5">
                <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded" onClick={handleSubmit}>
                    Submit
                </button>
            </div>

            {analysis && (
                <div className="required-colors text-black mt-5">
                    <h2 className="text-xl font-semibold text-gray-700">Required Colors</h2>
                    {Array.from(analysis).map(([code, weight], index) => (
                        <div key={index} className="color mt-2">
                            <p><strong>Color Code:</strong> {code}</p>
                            <p><strong>Weight (grams):</strong> {(weight/ matching.productionWeight) * matching.neededWeight}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default ClothTrackingApp;


