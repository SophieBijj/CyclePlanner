import React, { useState } from 'react';
import { XIcon, TrashIcon } from '../icons';

const ConfigModal = ({ config, cycleHistory, onSave, onClose }) => {
    // Utiliser le temps local au lieu d'UTC pour éviter les problèmes de fuseau horaire
    const formatLocalDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const [startDate, setStartDate] = useState(formatLocalDate(config.cycleStartDate));
    const [cycleLength, setCycleLength] = useState(config.cycleLength);
    const [history, setHistory] = useState(cycleHistory || []);

    const addCycleToHistory = () => {
        if (history.length < 12) {
            setHistory([...history, { startDate: '' }]);
        }
    };

    const removeCycleFromHistory = (index) => {
        setHistory(history.filter((_, i) => i !== index));
    };

    const updateHistoryItem = (index, value) => {
        const newHistory = [...history];
        newHistory[index].startDate = value;
        setHistory(newHistory);
    };

    // Calculer les durées des cycles automatiquement
    const calculateCycleLengths = (historyDates, currentStart) => {
        if (historyDates.length === 0) return [];

        // Trier les dates par ordre chronologique (plus anciennes en premier)
        const sortedHistory = [...historyDates]
            .filter(h => h.startDate)
            .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

        const result = [];

        for (let i = 0; i < sortedHistory.length; i++) {
            const currentDate = new Date(sortedHistory[i].startDate);
            let nextDate;

            if (i < sortedHistory.length - 1) {
                // Pas le dernier : utiliser le prochain cycle de l'historique
                nextDate = new Date(sortedHistory[i + 1].startDate);
            } else {
                // Le dernier : utiliser le cycle actuel
                nextDate = new Date(currentStart);
            }

            const diffTime = nextDate - currentDate;
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

            result.push({
                startDate: sortedHistory[i].startDate,
                length: diffDays
            });
        }

        return result;
    };

    // Afficher les durées calculées
    const displayHistory = calculateCycleLengths(history, startDate);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000] overflow-auto p-5">
            <div className="bg-white rounded-xl p-6 max-w-[600px] w-full max-h-[90vh] overflow-auto shadow-xl">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="m-0 text-xl font-semibold">Configuration du cycle</h2>
                    <button onClick={onClose} className="cursor-pointer border-none bg-transparent">
                        <XIcon />
                    </button>
                </div>

                <div className="mb-5">
                    <label className="block mb-2 text-sm font-medium">
                        Premier jour des dernières règles (J1 actuel)
                    </label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full p-2.5 rounded-lg border border-gray-200 text-sm"
                    />
                </div>

                <div className="mb-6">
                    <label className="block mb-2 text-sm font-medium">
                        Durée du cycle actuel (jours)
                    </label>
                    <input
                        type="number"
                        min="21"
                        max="35"
                        value={cycleLength}
                        onChange={(e) => setCycleLength(parseInt(e.target.value))}
                        className="w-full p-2.5 rounded-lg border border-gray-200 text-sm"
                    />
                </div>

                {/* Historique des cycles */}
                <div className="mb-6 border-t border-gray-200 pt-5">
                    <div className="flex justify-between items-center mb-3">
                        <label className="text-sm font-medium">
                            Historique des cycles passés (J1 uniquement)
                        </label>
                        <button
                            onClick={addCycleToHistory}
                            disabled={history.length >= 12}
                            className={`px-3 py-1.5 text-xs ${
                                history.length >= 12
                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    : 'bg-pink-500 text-white cursor-pointer'
                            } border-none rounded-md font-medium`}
                        >
                            + Ajouter J1
                        </button>
                    </div>
                    <p className="text-xs text-gray-500 mb-3">
                        Entre les dates de début (J1) de tes cycles passés. Les durées seront calculées automatiquement. (max 12)
                    </p>

                    {history.length > 0 && (
                        <div className="flex flex-col gap-2 max-h-[250px] overflow-auto">
                            {history.map((cycle, index) => {
                                const displayed = displayHistory.find(d => d.startDate === cycle.startDate);
                                return (
                                    <div key={index} className="flex gap-2 items-center">
                                        <input
                                            type="date"
                                            value={cycle.startDate}
                                            onChange={(e) => updateHistoryItem(index, e.target.value)}
                                            className="flex-[2] p-2 rounded-md border border-gray-200 text-xs"
                                            placeholder="Date J1"
                                        />
                                        {displayed && (
                                            <div className="flex-1 p-2 rounded-md bg-green-50 border border-green-300 text-xs font-medium text-green-800 text-center">
                                                {displayed.length} jours
                                            </div>
                                        )}
                                        <button
                                            onClick={() => removeCycleFromHistory(index)}
                                            className="p-1.5 bg-red-100 text-red-500 border-none rounded-md cursor-pointer text-xs"
                                        >
                                            <TrashIcon />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {displayHistory.length > 0 && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <p className="m-0 text-xs font-medium text-blue-700">
                                📊 Durée moyenne des cycles : {Math.round(
                                    displayHistory.reduce((sum, h) => sum + h.length, cycleLength) /
                                    (displayHistory.length + 1)
                                )} jours
                            </p>
                        </div>
                    )}
                </div>

                <div className="flex gap-3 justify-end">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-lg border border-gray-200 bg-white cursor-pointer text-sm font-medium"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={() => {
                            // Créer une date locale pour éviter les problèmes de fuseau horaire
                            const parts = startDate.split('-');
                            const localDate = new Date(
                                parseInt(parts[0]),
                                parseInt(parts[1]) - 1,
                                parseInt(parts[2])
                            );
                            onSave({
                                cycleStartDate: localDate,
                                cycleLength,
                                cycleHistory: calculateCycleLengths(history.filter(h => h.startDate), startDate)
                            });
                        }}
                        className="px-5 py-2.5 rounded-lg border-none bg-pink-500 text-white cursor-pointer text-sm font-medium"
                    >
                        Enregistrer
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfigModal;
