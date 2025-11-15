import React, { useState } from 'react';
import { XIcon, TrashIcon, EditIcon } from '../icons';

const EditEventModal = ({ event, calendars, onClose, onUpdate, onDelete }) => {
    // Calculer l'heure de fin à partir de la durée
    const calculateEndTime = (startTime, duration) => {
        const [hours, minutes] = startTime.split(':').map(Number);
        const totalMinutes = hours * 60 + minutes + duration;
        const endHours = Math.floor(totalMinutes / 60) % 24;
        const endMinutes = totalMinutes % 60;
        return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
    };

    const [title, setTitle] = useState(event.title);
    const [selectedDate, setSelectedDate] = useState(event.date);
    const [startTime, setStartTime] = useState(event.startTime);
    const [endTime, setEndTime] = useState(event.endTime || calculateEndTime(event.startTime, event.duration || 60));
    const [selectedCalendar, setSelectedCalendar] = useState(event.calendarId);
    const [isUpdating, setIsUpdating] = useState(false);

    const handleUpdate = async () => {
        if (!title.trim()) {
            alert('Le titre est obligatoire');
            return;
        }

        // Valider que l'heure de fin est après l'heure de début
        const [startHours, startMinutes] = startTime.split(':').map(Number);
        const [endHours, endMinutes] = endTime.split(':').map(Number);
        const startTotalMinutes = startHours * 60 + startMinutes;
        const endTotalMinutes = endHours * 60 + endMinutes;

        if (endTotalMinutes <= startTotalMinutes) {
            alert('L\'heure de fin doit être après l\'heure de début');
            return;
        }

        setIsUpdating(true);
        try {
            await onUpdate({
                eventId: event.id,
                title,
                date: selectedDate,
                startTime,
                endTime,
                calendarId: selectedCalendar
            });
            onClose();
        } catch (err) {
            console.error('Error updating event:', err);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDelete = async () => {
        try {
            await onDelete({
                eventId: event.id,
                calendarId: event.calendarId
            });
            onClose();
        } catch (err) {
            console.error('Error deleting event:', err);
        }
    };

    // Formater la date pour l'input type="date" (YYYY-MM-DD)
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
                    <h2 className="m-0 text-xl font-semibold">Modifier l'événement</h2>
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
                        placeholder="Nom de l'événement"
                        className="w-full p-2.5 rounded-lg border border-gray-200 text-sm"
                    />
                </div>

                <div className="mb-4">
                    <label className="block mb-2 text-sm font-medium">
                        Date
                    </label>
                    <input
                        type="date"
                        value={formatDateForInput(selectedDate)}
                        onChange={handleDateChange}
                        className="w-full p-2.5 rounded-lg border border-gray-200 text-sm"
                    />
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div>
                        <label className="block mb-2 text-sm font-medium">
                            Heure de début
                        </label>
                        <input
                            type="time"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            className="w-full p-2.5 rounded-lg border border-gray-200 text-sm"
                        />
                    </div>
                    <div>
                        <label className="block mb-2 text-sm font-medium">
                            Heure de fin
                        </label>
                        <input
                            type="time"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            className="w-full p-2.5 rounded-lg border border-gray-200 text-sm"
                        />
                    </div>
                </div>

                <div className="mb-6">
                    <label className="block mb-2 text-sm font-medium">
                        Calendrier
                    </label>
                    <div className="flex flex-col gap-2">
                        {calendars.map(cal => (
                            <label
                                key={cal.id}
                                className={`flex items-center gap-2 p-2.5 rounded-lg cursor-pointer ${
                                    selectedCalendar === cal.id
                                        ? 'border-2 border-pink-500 bg-pink-50'
                                        : 'border border-gray-200 bg-white'
                                }`}
                            >
                                <input
                                    type="radio"
                                    name="calendar"
                                    checked={selectedCalendar === cal.id}
                                    onChange={() => setSelectedCalendar(cal.id)}
                                    className="cursor-pointer"
                                />
                                <div
                                    className="w-4 h-4 rounded-full"
                                    style={{ backgroundColor: cal.backgroundColor || '#3b82f6' }}
                                />
                                <span className="text-sm font-medium">
                                    {cal.summary}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="flex gap-3 justify-between">
                    <button
                        onClick={handleDelete}
                        disabled={isUpdating}
                        className={`px-5 py-2.5 rounded-lg border-none bg-red-500 text-white text-sm font-medium flex items-center gap-2 ${
                            isUpdating ? 'cursor-not-allowed' : 'cursor-pointer'
                        }`}
                    >
                        <TrashIcon />
                        Supprimer
                    </button>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            disabled={isUpdating}
                            className={`px-5 py-2.5 rounded-lg border border-gray-200 bg-white text-sm font-medium ${
                                isUpdating ? 'cursor-not-allowed' : 'cursor-pointer'
                            }`}
                        >
                            Annuler
                        </button>
                        <button
                            onClick={handleUpdate}
                            disabled={isUpdating}
                            className={`px-5 py-2.5 rounded-lg border-none text-white text-sm font-medium flex items-center gap-2 ${
                                isUpdating ? 'bg-gray-400 cursor-not-allowed' : 'bg-pink-500 cursor-pointer'
                            }`}
                        >
                            {isUpdating ? (
                                <>
                                    <div className="sync-spinner" />
                                    Modification...
                                </>
                            ) : (
                                <>
                                    <EditIcon />
                                    Modifier
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditEventModal;
