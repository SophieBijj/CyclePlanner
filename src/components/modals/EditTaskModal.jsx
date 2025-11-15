import React, { useState, useEffect } from 'react';
import { XIcon } from '../icons';

const EditTaskModal = ({ task, onClose, onSync }) => {
    const [title, setTitle] = useState(task.title);
    const [selectedDate, setSelectedDate] = useState(task.date);
    const [selectedTaskList, setSelectedTaskList] = useState(task.taskListId);
    const [taskLists, setTaskLists] = useState([]);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadTaskLists();
    }, []);

    const loadTaskLists = async () => {
        try {
            const response = await window.gapi.client.tasks.tasklists.list();
            setTaskLists(response.result.items || []);
            setIsLoading(false);
        } catch (err) {
            console.error('Error loading task lists:', err);
            setIsLoading(false);
        }
    };

    const handleUpdate = async () => {
        if (!title.trim()) {
            alert('Le titre est obligatoire');
            return;
        }

        setIsUpdating(true);
        try {
            // Si la liste de tâches a changé, déplacer la tâche
            if (selectedTaskList !== task.taskListId) {
                // 1. Créer la tâche dans la nouvelle liste
                const year = selectedDate.getFullYear();
                const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
                const day = String(selectedDate.getDate()).padStart(2, '0');
                const dueDate = `${year}-${month}-${day}T00:00:00.000Z`;

                await window.gapi.client.tasks.tasks.insert({
                    tasklist: selectedTaskList,
                    resource: {
                        title: title,
                        notes: task.description || '',
                        due: dueDate,
                        status: task.status
                    }
                });

                // 2. Supprimer l'ancienne tâche
                await window.gapi.client.tasks.tasks.delete({
                    tasklist: task.taskListId,
                    task: task.id
                });
            } else {
                // Simplement mettre à jour la tâche
                const year = selectedDate.getFullYear();
                const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
                const day = String(selectedDate.getDate()).padStart(2, '0');
                const dueDate = `${year}-${month}-${day}T00:00:00.000Z`;

                await window.gapi.client.tasks.tasks.patch({
                    tasklist: task.taskListId,
                    task: task.id,
                    title: title,
                    due: dueDate
                });
            }

            // Re-synchroniser pour rafraîchir l'affichage
            if (onSync) {
                await onSync();
            }

            onClose();
        } catch (err) {
            console.error('Error updating task:', err);
            alert('Erreur lors de la mise à jour de la tâche');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
            return;
        }

        try {
            await window.gapi.client.tasks.tasks.delete({
                tasklist: task.taskListId,
                task: task.id
            });

            // Re-synchroniser pour rafraîchir l'affichage
            if (onSync) {
                await onSync();
            }

            onClose();
        } catch (err) {
            console.error('Error deleting task:', err);
            alert('Erreur lors de la suppression de la tâche');
        }
    };

    const formatDateForInput = (d) => {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const handleDateChange = (e) => {
        const newDate = new Date(e.target.value + 'T00:00:00');
        setSelectedDate(newDate);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000]">
            <div className="bg-white rounded-xl p-6 max-w-[500px] w-[90%] shadow-xl">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="m-0 text-xl font-semibold">Modifier la tâche</h2>
                    <button onClick={onClose} className="cursor-pointer border-none bg-transparent">
                        <XIcon />
                    </button>
                </div>

                <div className="mb-4">
                    <label className="block mb-2 text-sm font-medium">
                        Titre
                    </label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Nom de la tâche"
                        className="w-full p-2.5 rounded-lg border border-gray-200 text-sm"
                    />
                </div>

                <div className="mb-4">
                    <label className="block mb-2 text-sm font-medium">
                        Date d'échéance
                    </label>
                    <input
                        type="date"
                        value={formatDateForInput(selectedDate)}
                        onChange={handleDateChange}
                        className="w-full p-2.5 rounded-lg border border-gray-200 text-sm"
                    />
                </div>

                <div className="mb-4">
                    <label className="block mb-2 text-sm font-medium">
                        Statut
                    </label>
                    <div className={`p-2.5 rounded-lg text-sm font-medium ${
                        task.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                    }`}>
                        {task.status === 'completed' ? '✓ Complétée' : '○ À faire'}
                    </div>
                </div>

                {!isLoading && taskLists.length > 0 && (
                    <div className="mb-6">
                        <label className="block mb-2 text-sm font-medium">
                            Liste de tâches
                        </label>
                        <div className="flex flex-col gap-2">
                            {taskLists.map(list => (
                                <label
                                    key={list.id}
                                    className={`flex items-center gap-2 p-2.5 rounded-lg cursor-pointer ${
                                        selectedTaskList === list.id
                                            ? 'border-2 border-amber-500 bg-amber-50'
                                            : 'border border-gray-200 bg-white'
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="tasklist"
                                        checked={selectedTaskList === list.id}
                                        onChange={() => setSelectedTaskList(list.id)}
                                        className="cursor-pointer"
                                    />
                                    <span className="text-sm font-medium">
                                        {list.title}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex gap-3 justify-between">
                    <button
                        onClick={handleDelete}
                        className="px-5 py-2.5 rounded-lg border-none bg-red-500 text-white text-sm font-semibold cursor-pointer"
                    >
                        🗑️ Supprimer
                    </button>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-500 text-sm font-semibold cursor-pointer"
                        >
                            Annuler
                        </button>
                        <button
                            onClick={handleUpdate}
                            disabled={isUpdating}
                            className={`px-5 py-2.5 rounded-lg border-none text-white text-sm font-semibold ${
                                isUpdating ? 'bg-gray-400 cursor-not-allowed' : 'bg-amber-500 cursor-pointer'
                            }`}
                        >
                            {isUpdating ? 'Mise à jour...' : 'Enregistrer'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditTaskModal;
