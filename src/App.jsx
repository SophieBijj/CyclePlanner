import React, { useState, useEffect, useCallback } from 'react';
import MonthView from './views/MonthView';
import CycleView from './views/CycleView';
import GoogleCalendarSync from './components/sidebar/GoogleCalendarSync';
import GoogleTasks from './components/sidebar/GoogleTasks';
import TasksSidebar from './components/sidebar/TasksSidebar';
import Toast from './components/Toast';
import ConfigModal from './components/modals/ConfigModal';
import CreateEventModal from './components/modals/CreateEventModal';
import CreateTaskModal from './components/modals/CreateTaskModal';
import EditEventModal from './components/modals/EditEventModal';
import EditTaskModal from './components/modals/EditTaskModal';
import DayEventsModal from './components/modals/DayEventsModal';
import { SyncIcon, SettingsIcon } from './components/icons';
import { getPhaseInfo, getAverageCycleLength } from './utils/cycleUtils';
import { fetchSunTimesRange } from './utils/sunUtils';
import { DEFAULT_CYCLE_CONFIG } from './config/constants';

export default function App() {
  // État principal
  const [currentView, setCurrentView] = useState(() => {
    const saved = localStorage.getItem('currentView');
    return saved || 'cycle';
  });
  const [cycleConfig, setCycleConfig] = useState(() => {
    const saved = localStorage.getItem('cycleConfig');
    console.log('🔍 Loading cycleConfig from localStorage:', saved);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const loadedDate = new Date(parsed.cycleStartDate);
        console.log('📅 Parsed date:', loadedDate, 'ISO:', parsed.cycleStartDate);
        console.log('📅 Date details - Day:', loadedDate.getDate(), 'Month:', loadedDate.getMonth() + 1, 'Year:', loadedDate.getFullYear());
        return {
          ...parsed,
          cycleStartDate: loadedDate
        };
      } catch (e) {
        console.error('❌ Error parsing cycleConfig:', e);
        return { ...DEFAULT_CYCLE_CONFIG, cycleStartDate: new Date() };
      }
    }
    console.log('⚠️ No saved config, using default');
    return { ...DEFAULT_CYCLE_CONFIG, cycleStartDate: new Date() };
  });

  const [cycleHistory, setCycleHistory] = useState(() => {
    const saved = localStorage.getItem('cycleHistory');
    return saved ? JSON.parse(saved) : [];
  });

  // Compteur pour forcer le re-render des vues
  const [viewVersion, setViewVersion] = useState(0);

  const [activities, setActivities] = useState({});
  const [googleCalendars, setGoogleCalendars] = useState([]);
  const [sunData, setSunData] = useState({});
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showTasksSidebar, setShowTasksSidebar] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showCreateEventModal, setShowCreateEventModal] = useState(false);
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [showEditEventModal, setShowEditEventModal] = useState(false);
  const [showEditTaskModal, setShowEditTaskModal] = useState(false);
  const [showDayEventsModal, setShowDayEventsModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedDayForEvents, setSelectedDayForEvents] = useState(null);
  const [toast, setToast] = useState(null);
  const [syncFunc, setSyncFunc] = useState(null);

  // Sauvegarder la config du cycle
  useEffect(() => {
    localStorage.setItem('cycleConfig', JSON.stringify({
      cycleLength: cycleConfig.cycleLength,
      cycleStartDate: cycleConfig.cycleStartDate.toISOString()
    }));
    localStorage.setItem('cycleHistory', JSON.stringify(cycleHistory));
  }, [cycleConfig, cycleHistory]);

  // Sauvegarder la vue actuelle
  useEffect(() => {
    localStorage.setItem('currentView', currentView);
  }, [currentView]);

  // Charger les données du soleil (optimisé: une seule requête pour tous les jours)
  useEffect(() => {
    const loadSunData = async () => {
      const today = new Date();
      const startDate = new Date(today);
      const endDate = new Date(today);
      endDate.setDate(endDate.getDate() + 15); // API forecast : limite à 16 jours

      const data = await fetchSunTimesRange(startDate, endDate);
      setSunData(data);
    };
    loadSunData();
  }, []);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const handleSync = useCallback((events, calendarMap) => {
    const newActivities = {};

    events.forEach(event => {
      let date;
      let startTime = '';
      let endTime = '';

      if (event.start.dateTime) {
        const eventDate = new Date(event.start.dateTime);
        date = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
        startTime = eventDate.toTimeString().substring(0, 5);

        const eventEndDate = new Date(event.end.dateTime);
        endTime = eventEndDate.toTimeString().substring(0, 5);
      } else if (event.start.date) {
        date = new Date(event.start.date + 'T00:00:00');
        startTime = '';
        endTime = '';
      }

      const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

      if (!newActivities[dateKey]) {
        newActivities[dateKey] = [];
      }

      const color = calendarMap[event.calendarId] || '#3b82f6';

      newActivities[dateKey].push({
        id: event.id,
        title: event.summary || 'Sans titre',
        date: date,
        startTime: startTime,
        endTime: endTime,
        color: color,
        calendarId: event.calendarId,
        isTask: event.isTask || false,
        taskListId: event.taskListId,
        taskListTitle: event.taskListTitle,
        status: event.status,
        hasNoDueDate: event.hasNoDueDate || false
      });
    });

    setActivities(newActivities);
    setToast({ message: 'Synchronisation réussie !', type: 'success' });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const handleError = useCallback((msg) => {
    showToast(msg, 'error');
  }, [showToast]);

  const handleSyncRequest = useCallback((func) => {
    setSyncFunc(() => func);
  }, []);

  const handleCreateEvent = async ({ title, date, startTime, endTime, calendarId }) => {
    try {
      const startDateTime = new Date(date);
      const [startHour, startMin] = startTime.split(':');
      startDateTime.setHours(parseInt(startHour), parseInt(startMin));

      const endDateTime = new Date(date);
      const [endHour, endMin] = endTime.split(':');
      endDateTime.setHours(parseInt(endHour), parseInt(endMin));

      const event = {
        summary: title,
        start: { dateTime: startDateTime.toISOString(), timeZone: 'America/Montreal' },
        end: { dateTime: endDateTime.toISOString(), timeZone: 'America/Montreal' }
      };

      await window.gapi.client.calendar.events.insert({
        calendarId: calendarId,
        resource: event
      });

      if (syncFunc) await syncFunc();
      showToast('Événement créé !', 'success');
    } catch (err) {
      console.error('Error creating event:', err);
      showToast('Erreur lors de la création', 'error');
    }
  };

  const handleUpdateEvent = async ({ eventId, title, date, startTime, endTime, calendarId }) => {
    try {
      const startDateTime = new Date(date);
      const [startHour, startMin] = startTime.split(':');
      startDateTime.setHours(parseInt(startHour), parseInt(startMin));

      const endDateTime = new Date(date);
      const [endHour, endMin] = endTime.split(':');
      endDateTime.setHours(parseInt(endHour), parseInt(endMin));

      const event = {
        summary: title,
        start: { dateTime: startDateTime.toISOString(), timeZone: 'America/Montreal' },
        end: { dateTime: endDateTime.toISOString(), timeZone: 'America/Montreal' }
      };

      await window.gapi.client.calendar.events.patch({
        calendarId: selectedEvent.calendarId,
        eventId: eventId,
        resource: event
      });

      if (syncFunc) await syncFunc();
      showToast('Événement modifié !', 'success');
    } catch (err) {
      console.error('Error updating event:', err);
      showToast('Erreur lors de la modification', 'error');
    }
  };

  const handleDeleteEvent = async ({ eventId, calendarId }) => {
    try {
      await window.gapi.client.calendar.events.delete({
        calendarId: calendarId,
        eventId: eventId
      });

      if (syncFunc) await syncFunc();
      showToast('Événement supprimé !', 'success');
    } catch (err) {
      console.error('Error deleting event:', err);
      showToast('Erreur lors de la suppression', 'error');
    }
  };

  const getCycleDayForDate = (date) => {
    if (!cycleConfig.cycleStartDate) return 1;
    const avgLength = cycleHistory.length > 0 ? getAverageCycleLength(cycleHistory) : cycleConfig.cycleLength;
    const diffMs = date - cycleConfig.cycleStartDate;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    return ((diffDays % avgLength) + avgLength) % avgLength || avgLength;
  };

  const getPhaseForDate = (date) => {
    const cycleDay = getCycleDayForDate(date);
    const avgLength = cycleHistory.length > 0 ? getAverageCycleLength(cycleHistory) : cycleConfig.cycleLength;
    return getPhaseInfo(cycleDay, avgLength);
  };

  const handleDayEventsClick = (date, activities) => {
    setSelectedDayForEvents({ date, activities });
    setShowDayEventsModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-2">
        <div className="flex justify-between items-center">
          {/* Left side: Lunarium + Month navigation */}
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold" style={{
              background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Lunarium 🌸
            </h1>

            {/* Month navigation */}
            <div className="flex items-center gap-4">
              <div className="flex gap-1">
                <button
                  onClick={() => {
                    const newMonth = new Date(currentMonth);
                    newMonth.setMonth(newMonth.getMonth() - 1);
                    setCurrentMonth(newMonth);
                  }}
                  className="text-3xl text-gray-500 hover:bg-gray-100 px-2 py-1 rounded transition-colors"
                >
                  ‹
                </button>
                <button
                  onClick={() => {
                    const newMonth = new Date(currentMonth);
                    newMonth.setMonth(newMonth.getMonth() + 1);
                    setCurrentMonth(newMonth);
                  }}
                  className="text-3xl text-gray-500 hover:bg-gray-100 px-2 py-1 rounded transition-colors"
                >
                  ›
                </button>
              </div>
              <span className="text-2xl font-semibold text-gray-800 min-w-[220px] capitalize">
                {currentMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
              </span>
            </div>
          </div>

          {/* Right side: View selector + Buttons */}
          <div className="flex gap-2 items-center">
            <select
              value={currentView}
              onChange={(e) => setCurrentView(e.target.value)}
              className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 cursor-pointer outline-none"
            >
              <option value="month">📅 Mois</option>
              <option value="cycle">🔄 Cycle</option>
            </select>
            <button
              onClick={() => setShowTasksSidebar(!showTasksSidebar)}
              className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors flex items-center gap-2 text-sm font-medium"
            >
              ✓ Tâches
            </button>
            <button
              onClick={() => setShowConfigModal(true)}
              className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-1 text-xl"
              title="Configuration du cycle"
            >
              <SettingsIcon />
            </button>
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex" style={{ height: 'calc(100vh - 70px)' }}>
        {/* Left Sidebar */}
        <div className="w-[280px] bg-gray-50 border-r border-gray-200 p-4 overflow-y-auto">
          <GoogleCalendarSync
            onSync={handleSync}
            onError={handleError}
            onCalendarsLoaded={setGoogleCalendars}
            onSyncRequest={handleSyncRequest}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          {currentView === 'cycle' ? (
            <CycleView
              key={`cycle-${viewVersion}`}
              cycleConfig={cycleConfig}
              activities={activities}
              sunData={sunData}
              showTasksSidebar={showTasksSidebar}
              onCreateEvent={(date) => {
                setSelectedDate(date);
                setShowCreateEventModal(true);
              }}
              onEditEvent={(event) => {
                if (event.isTask) {
                  setSelectedTask(event);
                  setShowEditTaskModal(true);
                } else {
                  setSelectedEvent(event);
                  setShowEditEventModal(true);
                }
              }}
              onTaskToggle={async (task, completed) => {
                try {
                  await window.gapi.client.tasks.tasks.patch({
                    tasklist: task.taskListId,
                    task: task.id,
                    status: completed ? 'completed' : 'needsAction',
                    completed: completed ? new Date().toISOString() : null
                  });
                  if (syncFunc) await syncFunc();
                } catch (err) {
                  console.error('Error toggling task:', err);
                }
              }}
              showToast={showToast}
            />
          ) : (
            <div className="pt-0 pb-1 px-4">
              <MonthView
                key={`month-${viewVersion}`}
                currentMonth={currentMonth}
                onMonthChange={setCurrentMonth}
                activities={activities}
                getPhaseForDate={getPhaseForDate}
                getCycleDayForDate={getCycleDayForDate}
                onDayClick={(date) => {
                  setSelectedDate(date);
                  setShowCreateEventModal(true);
                }}
                onEventClick={(event) => {
                  if (event.isTask) {
                    setSelectedTask(event);
                    setShowEditTaskModal(true);
                  } else {
                    setSelectedEvent(event);
                    setShowEditEventModal(true);
                  }
                }}
                onDayEventsClick={handleDayEventsClick}
                googleCalendars={googleCalendars}
              />
            </div>
          )}
        </div>

        {/* Tasks Sidebar */}
        <TasksSidebar
          activities={activities}
          isOpen={showTasksSidebar}
          onClose={() => setShowTasksSidebar(false)}
          onCreateTask={() => setShowCreateTaskModal(true)}
          onTaskClick={(task) => {
            setSelectedTask(task);
            setShowEditTaskModal(true);
          }}
          onTaskToggle={async (task, completed) => {
            try {
              await window.gapi.client.tasks.tasks.patch({
                tasklist: task.taskListId,
                task: task.id,
                status: completed ? 'completed' : 'needsAction'
              });
              if (syncFunc) await syncFunc();
            } catch (err) {
              console.error('Error toggling task:', err);
            }
          }}
        />
      </div>

      {/* Modals */}
      {showConfigModal && (
        <ConfigModal
          config={cycleConfig}
          cycleHistory={cycleHistory}
          onSave={(newConfig) => {
            // Mettre à jour le state - le localStorage sera sauvegardé par le useEffect
            setCycleConfig({
              cycleStartDate: newConfig.cycleStartDate,
              cycleLength: newConfig.cycleLength
            });
            setCycleHistory(newConfig.cycleHistory);
            // Forcer le re-render des vues en incrémentant le compteur
            setViewVersion(v => v + 1);
            setShowConfigModal(false);
            showToast('Configuration sauvegardée !', 'success');
          }}
          onClose={() => setShowConfigModal(false)}
        />
      )}

      {showCreateEventModal && (
        <CreateEventModal
          date={selectedDate}
          calendars={googleCalendars}
          onClose={() => setShowCreateEventModal(false)}
          onCreate={handleCreateEvent}
        />
      )}

      {showCreateTaskModal && (
        <CreateTaskModal
          onClose={() => setShowCreateTaskModal(false)}
          onSync={() => syncFunc && syncFunc()}
        />
      )}

      {showEditEventModal && selectedEvent && (
        <EditEventModal
          event={selectedEvent}
          calendars={googleCalendars}
          onClose={() => setShowEditEventModal(false)}
          onUpdate={handleUpdateEvent}
          onDelete={handleDeleteEvent}
        />
      )}

      {showEditTaskModal && selectedTask && (
        <EditTaskModal
          task={selectedTask}
          onClose={() => setShowEditTaskModal(false)}
          onSync={() => syncFunc && syncFunc()}
        />
      )}

      {showDayEventsModal && selectedDayForEvents && (
        <DayEventsModal
          date={selectedDayForEvents.date}
          activities={selectedDayForEvents.activities}
          phaseInfo={getPhaseForDate(selectedDayForEvents.date)}
          cycleDay={getCycleDayForDate(selectedDayForEvents.date)}
          onClose={() => setShowDayEventsModal(false)}
          onEventClick={(event) => {
            if (event.isTask) {
              setSelectedTask(event);
              setShowEditTaskModal(true);
            } else {
              setSelectedEvent(event);
              setShowEditEventModal(true);
            }
          }}
        />
      )}

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}
