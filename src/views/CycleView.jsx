import React from 'react';

// Vue circulaire temporaire simple - TODO: Implémenter la version complète depuis index.html.backup
const CycleView = ({ cycleConfig, activities, onCreateEvent }) => {
    return (
        <div className="flex flex-col items-center justify-center h-full p-8">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-pink-500 mb-4">Vue Cycle (Temporaire)</h2>
                <p className="text-gray-600 mb-4">
                    La vue circulaire du cycle sera implémentée depuis le code original.
                </p>
                <div className="text-sm text-gray-500">
                    <p>Cycle: {cycleConfig.cycleLength} jours</p>
                    <p>Début: {cycleConfig.cycleStartDate?.toLocaleDateString('fr-FR')}</p>
                </div>
                <div className="mt-8 p-6 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">
                        Pour restaurer la vue circulaire complète, extraire la fonction <code className="bg-gray-200 px-2 py-1 rounded">renderCircleView</code> depuis <code className="bg-gray-200 px-2 py-1 rounded">index.html.backup</code> lignes 3330-3650.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CycleView;
