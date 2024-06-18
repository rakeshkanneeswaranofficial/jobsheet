"use client"
import React, { useState, useReducer, ChangeEvent } from 'react';
import '../../styles/globals.css';
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs
import type { AppProps } from 'next/app';

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

interface Color {
    code: string;
    weight: number;
}

interface Matching {
    id: string;
    colors: Color[];
    productionWeight: number;
    neededWeight: number;
}

interface State {
    xyzId: string;
    matchings: Matching[];
    analysis: Map<string, number> | null;
    error: string | null;
}

const initialState: State = {
    xyzId: "",
    matchings: [],
    analysis: null,
    error: null,
};

type Action =
    | { type: 'SET_XYZ_ID'; payload: string }
    | { type: 'SET_MATCHING'; payload: { id: string, data: Partial<Matching> } }
    | { type: 'SET_COLOR'; payload: { matchingId: string, colorIndex: number, key: string, value: any } }
    | { type: 'ADD_MATCHING' }
    | { type: 'REMOVE_MATCHING'; payload: string }
    | { type: 'SET_ANALYSIS'; payload: Map<string, number> | null }
    | { type: 'SET_ERROR'; payload: string | null };

const reducer = (state: State, action: Action): State => {
    switch (action.type) {
        case 'SET_XYZ_ID':
            return { ...state, xyzId: action.payload };
        case 'SET_MATCHING':
            return {
                ...state,
                matchings: state.matchings.map(matching =>
                    matching.id === action.payload.id ? { ...matching, ...action.payload.data } : matching
                )
            };
        case 'SET_COLOR':
            return {
                ...state,
                matchings: state.matchings.map(matching => {
                    if (matching.id === action.payload.matchingId) {
                        const updatedColors = [...matching.colors];
                        updatedColors[action.payload.colorIndex][action.payload.key] = action.payload.value;
                        return { ...matching, colors: updatedColors };
                    }
                    return matching;
                })
            };
        case 'ADD_MATCHING':
            return {
                ...state,
                matchings: [...state.matchings, { id: uuidv4(), colors: [], productionWeight: 0, neededWeight: 0 }]
            };
        case 'REMOVE_MATCHING':
            return { ...state, matchings: state.matchings.filter(matching => matching.id !== action.payload) };
        case 'SET_ANALYSIS':
            return { ...state, analysis: action.payload };
        case 'SET_ERROR':
            return { ...state, error: action.payload };
        default:
            return state;
    }
};

const ClothInfo: React.FC<{ xyzId: string, onChange: (e: ChangeEvent<HTMLInputElement>) => void }> = ({ xyzId, onChange }) => (
    <div className="cloth-info mt-5">
        <h2 className="text-xl font-semibold text-gray-700">Cloth Information</h2>
        <label className="block mt-3">
            <span className="text-gray-700">XYZ ID:</span>
            <input
                type="text"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 text-black rounded-md shadow-sm focus:outline-none focus:ring focus:ring-opacity-50"
                value={xyzId}
                onChange={onChange}
            />
        </label>
    </div>
);

const MatchingComponent: React.FC<{
    matching: Matching,
    colorCodes: string[],
    onColorChange: (colorIndex: number, key: string, value: string) => void,
    onMatchingChange: (key: string, value: string | number) => void,
    onAddColor: () => void,
    onRemove: () => void
}> = ({ matching, colorCodes, onColorChange, onMatchingChange, onAddColor, onRemove }) => (
    <div className="matching mt-5 border border-gray-300 p-4 rounded-md">
        <h2 className="text-xl font-semibold text-gray-700">Matching</h2>
        {matching.colors.map((color, colorIndex) => (
            <div key={colorIndex} className="color mt-2">
                <label className="block">
                    <span className="text-gray-700">Color Code:</span>
                    <select
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 text-black rounded-md shadow-sm focus:outline-none focus:ring focus:ring-opacity-50"
                        value={color.code}
                        onChange={(e) => onColorChange(colorIndex, 'code', e.target.value)}
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
                        onChange={(e) => onColorChange(colorIndex, 'weight', parseFloat(e.target.value))}
                    />
                </label>
            </div>
        ))}
        <button className="mt-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={onAddColor}>Add Color</button>
        <label className="block mt-3">
            <span className="text-gray-700">Production Weight (kg):</span>
            <input
                type="number"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 text-black rounded-md shadow-sm focus:outline-none focus:ring focus:ring-opacity-50"
                value={matching.productionWeight}
                onChange={(e) => onMatchingChange('productionWeight', parseFloat(e.target.value))}
            />
        </label>
        <label className="block mt-3">
            <span className="text-gray-700">Needed Weight (kg):</span>
            <input
                type="number"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 text-black rounded-md shadow-sm focus:outline-none focus:ring focus:ring-opacity-50"
                value={matching.neededWeight}
                onChange={(e) => onMatchingChange('neededWeight', parseFloat(e.target.value))}
            />
        </label>
        <button className="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded" onClick={onRemove}>Remove Matching</button>
    </div>
);

const RequiredColors: React.FC<{ analysis: Map<string, number>, matchings: Matching[] }> = ({ analysis, matchings }) => (
    <div className="required-colors text-black mt-5">
        <h2 className="text-xl font-semibold text-gray-700">Required Colors</h2>
        {Array.from(analysis).map(([code, weight], index) => (
            <div key={index} className="color mt-2">
                <p><strong>Color Code:</strong> {code}</p>
                <p><strong>Weight (grams):</strong> {
                    matchings.map(matching => (weight / matching.productionWeight) * matching.neededWeight)
                        .reduce((acc, val) => acc + val, 0)
                }</p>
            </div>
        ))}
    </div>
);

const ClothTrackingApp: React.FC = () => {
    const [state, dispatch] = useReducer(reducer, initialState);

    const colorCodes = ["B2R", "HBX", "R2B", "G4Y", "O2P", "L6C", "T3M", "S1W"];

    const handleXyzIdChange = (e: ChangeEvent<HTMLInputElement>) => {
        dispatch({ type: 'SET_XYZ_ID', payload: e.target.value });
    };

    const handleMatchingChange = (id: string, key: string, value: string | number) => {
        dispatch({ type: 'SET_MATCHING', payload: { id, data: { [key]: value } } });
    };

    const handleColorChange = (matchingId: string, colorIndex: number, key: string, value: string) => {
        dispatch({ type: 'SET_COLOR', payload: { matchingId, colorIndex, key, value } });
    };

    const addMatching = () => {
        dispatch({ type: 'ADD_MATCHING' });
    };

    const removeMatching = (id: string) => {
        dispatch({ type: 'REMOVE_MATCHING', payload: id });
    };

    const addColor = (matchingId: string) => {
        const matching = state.matchings.find(matching => matching.id === matchingId);
        if (matching) {
            const updatedColors = [...matching.colors, { code: "", weight: 0 }];
            dispatch({ type: 'SET_MATCHING', payload: { id: matchingId, data: { colors: updatedColors } } });
        }
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

    const handleSubmit = () => {
        if (state.matchings.some(matching => matching.productionWeight === 0 || matching.neededWeight === 0)) {
            dispatch({ type: 'SET_ERROR', payload: "Production and needed weights must be greater than zero." });
            return;
        }

        const totalWeights = new Map<string, number>();

        state.matchings.forEach(matching => {
            const result = calculateTotalColorWeight(matching);
            result.forEach((weight, code) => {
                if (totalWeights.has(code)) {
                    totalWeights.set(code, totalWeights.get(code)! + weight);
                } else {
                    totalWeights.set(code, weight);
                }
            });
        });

        dispatch({ type: 'SET_ANALYSIS', payload: totalWeights });
        dispatch({ type: 'SET_ERROR', payload: null });
    };

    return (
        <div className="container mx-auto mt-10 p-5 max-w-lg bg-white shadow-lg rounded-lg">
            <h1 className="text-2xl font-bold text-gray-800 text-center">Cloth Tracking Application</h1>

            <ClothInfo xyzId={state.xyzId} onChange={handleXyzIdChange} />

            {state.matchings.map(matching => (
                <MatchingComponent
                    key={matching.id}
                    matching={matching}
                    colorCodes={colorCodes}
                    onColorChange={(colorIndex, key, value) => handleColorChange(matching.id, colorIndex, key, value)}
                    onMatchingChange={(key, value) => handleMatchingChange(matching.id, key, value)}
                    onAddColor={() => addColor(matching.id)}
                    onRemove={() => removeMatching(matching.id)}
                />
            ))}

            <button className="mt-5 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={addMatching}>
                Add Matching
            </button>

            <div className="mt-5">
                <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded" onClick={handleSubmit}>
                    Submit
                </button>
            </div>

            {state.error && (
                <div className="mt-5 text-red-500">
                    <p>{state.error}</p>
                </div>
            )}

            {state.analysis && <RequiredColors analysis={state.analysis} matchings={state.matchings} />}
        </div>
    );
};

export default ClothTrackingApp;
