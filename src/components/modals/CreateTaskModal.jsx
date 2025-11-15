import React, { useState, useEffect } from 'react';

const CreateTaskModal = ({ onClose, onSync }) => {
    const [title, setTitle] = useState('');
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTaskList, setSelectedTaskList] = useState('');
    const [taskLists, setTaskLists] = useState([]);
    const [isCreating, setIsCreating] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadTaskLists();
    }, []);

    const loadTaskLists = async () => {
        try {
            const response = await window.gapi.client.tasks.tasklists.list();
            const lists = response.result.items || [];
            setTaskLists(lists);
            if (lists.length > 0) {
                setSelectedTaskList(lists[0].id);
            }
            setIsLoading(false);
        } catch (err) {
            console.error('Error loading task lists:', err);
            setIsLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!title.trim()) {
            alert('Le titre est obligatoire');
            return;
        }

        setIsCreating(true);
        try {
            const taskData = {
                title: title,
                status: 'needsAction'
            };

            // Ajouter la date d'échéance si sélectionnée
            if (selectedDate) {
                taskData.due = new Date(selectedDate).toISOString();
            }

            await window.gapi.client.tasks.tasks.insert({
                tasklist: selectedTaskList,
                resource: taskData
            });

            // Resynchroniser
            if (onSync) {
                await onSync();
            }

            onClose();
        } catch (err) {
            console.error('Error creating task:', err);
            alert('Erreur lors de la création de la tâche');
        } finally {
            setIsCreating(false);
        }
    };

    const formatDateForInput = (d) => {
        if (!d) return '';
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const handleDateChange = (e) => {
        if (e.target.value) {
            const newDate = new Date(e.target.value + 'T00:00:00');
            setSelectedDate(newDate);
        } else {
            setSelectedDate(null);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[2000]">
            <div className="bg-white rounded-xl p-6 max-w-[500px] w-[90%] shadow-xl">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="m-0 text-xl font-semibold text-amber-500">✓ Nouvelle tâche</h2>
                    <button onClick={onClose} className="cursor-pointer border-none bg-transparent text-2xl">×</button>
                </div>

                <div className="mb-4">
                    <label className="block mb-2 text-sm font-medium">Titre</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Nom de la tâche"
                        className="w-full p-2.5 rounded-lg border border-gray-200 text-sm"
                        autoFocus
                    />
                </div>

                <div className="mb-4">
                    <label className="block mb-2 text-sm font-medium">
                        Date d'échéance (optionnel)
                    </label>
                    <input
                        type="date"
                        value={selectedDate ? formatDateForInput(selectedDate) : ''}
                        onChange={handleDateChange}
                        className="w-full p-2.5 rounded-lg border border-gray-200 text-sm"
                    />
                </div>

                <div className="mb-6">
                    <label className="block mb-2 text-sm font-medium">Liste</label>
                    <select
                        value={selectedTaskList}
                        onChange={(e) => setSelectedTaskList(e.target.value)}
                        disabled={isLoading}
                        className="w-full p-2.5 rounded-lg border border-gray-200 text-sm"
                    >
                        {taskLists.map(list => (
                            <option key={list.id} value={list.id}>{list.title}</option>
                        ))}
                    </select>
                </div>

                <div className="flex gap-3 justify-end">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-lg border border-gray-200 bg-white cursor-pointer text-sm"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={handleCreate}
                        disabled={isCreating || isLoading}
                        className={`px-5 py-2.5 rounded-lg border-none bg-amber-500 text-white text-sm font-medium ${
                            isCreating || isLoading ? 'cursor-not-allowed' : 'cursor-pointer'
                        }`}
                    >
                        {isCreating ? 'Création...' : 'Créer'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateTaskModal;
