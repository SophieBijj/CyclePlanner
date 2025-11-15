import React, { useState } from 'react';

const TasksSidebar = ({ activities, onTaskClick, onTaskToggle, isOpen, onClose, onCreateTask }) => {
    const [selectedTaskList, setSelectedTaskList] = useState('all');

    // Extraire toutes les tâches de activities
    const allTasks = [];
    const taskLists = new Set();
    Object.keys(activities).forEach(dateKey => {
        activities[dateKey].forEach(activity => {
            if (activity.isTask) {
                allTasks.push({
                    ...activity,
                    dateKey
                });
                if (activity.taskListTitle) {
                    taskLists.add(JSON.stringify({ id: activity.taskListId, title: activity.taskListTitle }));
                }
            }
        });
    });

    // Convertir le Set en tableau d'objets
    const taskListsArray = Array.from(taskLists).map(str => JSON.parse(str));

    // Filtrer les tâches par liste sélectionnée
    const filteredTasks = selectedTaskList === 'all'
        ? allTasks
        : allTasks.filter(task => task.taskListId === selectedTaskList);

    // Trier les tâches filtrées par date d'échéance
    filteredTasks.sort((a, b) => {
        // Tâches complétées à la fin
        if (a.status === 'completed' && b.status !== 'completed') return 1;
        if (a.status !== 'completed' && b.status === 'completed') return -1;
        // Sinon par date
        return a.date - b.date;
    });

    // Grouper par statut
    const activeTasks = filteredTasks.filter(t => t.status !== 'completed');
    const completedTasks = filteredTasks.filter(t => t.status === 'completed');

    if (!isOpen) return null;

    return (
        <div className="w-full md:w-[350px] md:min-w-[350px] bg-white border-t md:border-t-0 md:border-l border-gray-200 flex flex-col max-h-[500px] md:max-h-[calc(100vh-180px)] order-3">
            {/* Header */}
            <div className="p-5 border-b border-gray-200 flex justify-between items-center bg-amber-500 text-white">
                <h2 className="m-0 text-xl font-bold">
                    ✓ Mes Tâches
                </h2>
                <div className="flex gap-2">
                    <button
                        onClick={onCreateTask}
                        className="border-0 bg-white/20 cursor-pointer text-white text-xl px-3 py-1 rounded-md font-bold hover:bg-white/30 transition-colors"
                        title="Créer une nouvelle tâche"
                    >
                        +
                    </button>
                    <button
                        onClick={onClose}
                        className="border-0 bg-transparent cursor-pointer text-white text-2xl p-1 hover:bg-white/20 rounded transition-colors"
                    >
                        ×
                    </button>
                </div>
            </div>

            {/* Dropdown de sélection de liste */}
            <div className="p-3 px-4 border-b border-gray-200 bg-amber-50">
                <select
                    value={selectedTaskList}
                    onChange={(e) => setSelectedTaskList(e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-amber-600 bg-white text-amber-900 text-sm font-medium cursor-pointer outline-none hover:border-amber-700 focus:border-amber-700 focus:ring-2 focus:ring-amber-200"
                >
                    <option value="all">📋 Toutes les listes ({allTasks.length})</option>
                    {taskListsArray.map(list => (
                        <option key={list.id} value={list.id}>
                            {list.title} ({allTasks.filter(t => t.taskListId === list.id).length})
                        </option>
                    ))}
                </select>
            </div>

            {/* Contenu */}
            <div className="flex-1 overflow-y-auto p-4">
                {filteredTasks.length === 0 ? (
                    <div className="text-center py-10 px-5 text-gray-400">
                        <div className="text-5xl mb-4">📝</div>
                        <p className="m-0 text-sm">
                            Aucune tâche avec échéance.<br/>
                            Synchronisez pour voir vos tâches Google Tasks.
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Tâches actives */}
                        {activeTasks.length > 0 && (
                            <div className="mb-6">
                                <h3 className="m-0 mb-3 text-sm font-semibold text-gray-500 uppercase tracking-wide">
                                    À faire ({activeTasks.length})
                                </h3>
                                {activeTasks.map(task => (
                                    <div
                                        key={task.id}
                                        onClick={(e) => {
                                            if (e.target.type !== 'checkbox') {
                                                onTaskClick(task);
                                            }
                                        }}
                                        className="p-3 mb-2 bg-amber-50 border border-amber-400 rounded-lg cursor-pointer transition-all hover:bg-amber-100 hover:-translate-x-0.5"
                                    >
                                        <div className="flex items-start gap-2">
                                            <input
                                                type="checkbox"
                                                checked={false}
                                                onChange={(e) => {
                                                    e.stopPropagation();
                                                    onTaskToggle(task, true);
                                                }}
                                                onClick={(e) => e.stopPropagation()}
                                                className="mt-0.5 cursor-pointer w-[18px] h-[18px]"
                                            />
                                            <div className="flex-1">
                                                <div className="font-semibold text-sm text-amber-900 mb-1">
                                                    {task.title}
                                                </div>
                                                <div className="text-xs text-amber-800 flex gap-2 flex-wrap">
                                                    <span>
                                                        {task.hasNoDueDate ? '📌 Pas d\'échéance' : `📅 ${task.date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}`}
                                                    </span>
                                                    {task.taskListTitle && (
                                                        <span>📋 {task.taskListTitle}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Tâches complétées */}
                        {completedTasks.length > 0 && (
                            <div>
                                <h3 className="m-0 mb-3 text-sm font-semibold text-gray-500 uppercase tracking-wide">
                                    Terminées ({completedTasks.length})
                                </h3>
                                {completedTasks.map(task => (
                                    <div
                                        key={task.id}
                                        onClick={(e) => {
                                            if (e.target.type !== 'checkbox') {
                                                onTaskClick(task);
                                            }
                                        }}
                                        className="p-3 mb-2 bg-gray-100 border border-gray-300 rounded-lg cursor-pointer opacity-70 transition-all hover:opacity-85 hover:-translate-x-0.5"
                                    >
                                        <div className="flex items-start gap-2">
                                            <input
                                                type="checkbox"
                                                checked={true}
                                                onChange={(e) => {
                                                    e.stopPropagation();
                                                    onTaskToggle(task, false);
                                                }}
                                                onClick={(e) => e.stopPropagation()}
                                                className="mt-0.5 cursor-pointer w-[18px] h-[18px]"
                                            />
                                            <div className="flex-1">
                                                <div className="font-semibold text-sm text-gray-500 mb-1 line-through">
                                                    {task.title}
                                                </div>
                                                <div className="text-xs text-gray-400 flex gap-2 flex-wrap">
                                                    <span>
                                                        {task.hasNoDueDate ? '📌 Pas d\'échéance' : `📅 ${task.date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}`}
                                                    </span>
                                                    {task.taskListTitle && (
                                                        <span>📋 {task.taskListTitle}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default TasksSidebar;
