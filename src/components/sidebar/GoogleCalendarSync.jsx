import { useState, useEffect, useRef } from 'react';
import { GOOGLE_CLIENT_ID, GOOGLE_API_KEY, SCOPES } from '../../config/constants';
import { GoogleIcon, SyncIcon } from '../icons';

export default function GoogleCalendarSync({ onSync, onError, onCalendarsLoaded, onSyncRequest }) {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [calendars, setCalendars] = useState([]);
  const [selectedCalendars, setSelectedCalendars] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const gapiInited = useRef(false);
  const gisInited = useRef(false);
  const tokenClient = useRef(null);

  // Exposer handleSync au parent via callback
  useEffect(() => {
    if (onSyncRequest && isSignedIn && selectedCalendars.length > 0) {
      onSyncRequest(() => handleSync);
    }
  }, [isSignedIn, selectedCalendars, onSyncRequest]);

  useEffect(() => {
    let gapiTimeout, gisTimeout;

    const checkAndLoad = () => {
      if (typeof window.gapi !== 'undefined') {
        gapiLoaded();
        clearTimeout(gapiTimeout);
      } else {
        gapiTimeout = setTimeout(checkAndLoad, 200);
      }
    };

    const checkAndLoadGis = () => {
      if (typeof window.google !== 'undefined' && window.google.accounts) {
        gisLoaded();
        clearTimeout(gisTimeout);
      } else {
        gisTimeout = setTimeout(checkAndLoadGis, 200);
      }
    };

    setTimeout(() => {
      checkAndLoad();
      checkAndLoadGis();
    }, 500);

    setTimeout(() => {
      if (!gapiInited.current || !gisInited.current) {
        setIsLoading(false);
        onError?.('Impossible de charger Google Calendar. Veuillez recharger la page.');
      }
    }, 10000);

    return () => {
      clearTimeout(gapiTimeout);
      clearTimeout(gisTimeout);
    };
  }, [onError]);

  const gapiLoaded = () => {
    if (typeof window.gapi !== 'undefined') {
      window.gapi.load('client', initializeGapiClient);
    }
  };

  const initializeGapiClient = async () => {
    try {
      await window.gapi.client.init({
        apiKey: GOOGLE_API_KEY,
        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
      });

      gapiInited.current = true;
      maybeEnableButtons();
    } catch (err) {
      console.error('Error initializing GAPI:', err);
      onError?.('Erreur d\'initialisation Google API');
    }
  };

  const loadTasksAPI = async () => {
    try {
      if (!window.tasksApiLoaded) {
        await window.gapi.client.load('tasks', 'v1');
        window.tasksApiLoaded = true;
        console.log('Tasks API loaded successfully');
      }
    } catch (err) {
      console.error('Error loading Tasks API:', err);
    }
  };

  const gisLoaded = () => {
    if (typeof window.google !== 'undefined') {
      tokenClient.current = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: SCOPES,
        callback: async (response) => {
          if (response.error) {
            console.error('Auth error:', response.error);
            onError?.('Erreur d\'authentification Google');
            return;
          }

          if (response.access_token) {
            const expiresAt = Date.now() + (response.expires_in * 1000);
            localStorage.setItem('googleAccessToken', JSON.stringify({
              access_token: response.access_token,
              expires_at: expiresAt
            }));

            window.gapi.client.setToken({
              access_token: response.access_token
            });

            await loadTasksAPI();
          }

          setIsSignedIn(true);
          await loadCalendars();
        },
      });
      gisInited.current = true;
      maybeEnableButtons();
    }
  };

  const maybeEnableButtons = () => {
    if (gapiInited.current && gisInited.current) {
      setIsLoading(false);

      const savedToken = localStorage.getItem('googleAccessToken');
      if (savedToken) {
        try {
          const tokenData = JSON.parse(savedToken);

          if (tokenData.expires_at && Date.now() < tokenData.expires_at) {
            console.log('Restoring saved token...');
            window.gapi.client.setToken({
              access_token: tokenData.access_token
            });
          } else {
            console.log('Saved token expired, clearing...');
            localStorage.removeItem('googleAccessToken');
          }
        } catch (e) {
          console.error('Error restoring token:', e);
          localStorage.removeItem('googleAccessToken');
        }
      }

      const token = window.gapi.client.getToken();
      if (token !== null) {
        console.log('Already signed in, loading calendars...');
        setIsSignedIn(true);

        loadTasksAPI().then(() => {
          loadCalendars();
        });
      }
    }
  };

  const handleAuthClick = () => {
    if (!tokenClient.current) {
      onError?.('Initialisation en cours, veuillez réessayer dans quelques secondes');
      return;
    }

    if (typeof window.gapi === 'undefined' || !window.gapi.client) {
      onError?.('Google API en cours de chargement, veuillez réessayer');
      return;
    }

    if (window.gapi.client.getToken() === null) {
      tokenClient.current.requestAccessToken({ prompt: 'consent' });
    } else {
      tokenClient.current.requestAccessToken({ prompt: '' });
    }
  };

  const handleSignoutClick = () => {
    if (typeof window.gapi === 'undefined' || !window.gapi.client) return;

    const token = window.gapi.client.getToken();
    if (token !== null) {
      window.google.accounts.oauth2.revoke(token.access_token);
      window.gapi.client.setToken('');

      localStorage.removeItem('googleAccessToken');

      setIsSignedIn(false);
      setCalendars([]);
      setSelectedCalendars([]);
    }
  };

  const loadCalendars = async () => {
    if (typeof window.gapi === 'undefined' || !window.gapi.client) return;

    try {
      const response = await window.gapi.client.calendar.calendarList.list();
      const cals = response.result.items || [];

      const tasksCalendar = {
        id: '__TASKS__',
        summary: '✓ Tâches',
        backgroundColor: '#F59E0B',
        foregroundColor: '#000000',
        isTasksCalendar: true
      };

      const allCalendars = [...cals, tasksCalendar];
      setCalendars(allCalendars);
      onCalendarsLoaded?.(allCalendars);

      const savedCalendars = localStorage.getItem('selectedCalendars');
      if (savedCalendars) {
        try {
          const saved = JSON.parse(savedCalendars);
          let validSaved = saved.filter(id => allCalendars.some(cal => cal.id === id));

          if (validSaved.length > 0 && !validSaved.includes('__TASKS__')) {
            console.log('Migration: adding __TASKS__ to saved calendars');
            validSaved.push('__TASKS__');
            localStorage.setItem('selectedCalendars', JSON.stringify(validSaved));
          }

          if (validSaved.length > 0) {
            console.log('Restoring selected calendars:', validSaved);
            setSelectedCalendars(validSaved);

            setTimeout(() => {
              console.log('Auto-syncing with restored calendars...');
              handleSync(validSaved);
            }, 1000);

            return;
          }
        } catch (e) {
          console.error('Error parsing saved calendars:', e);
        }
      }

      const primary = cals.find(cal => cal.primary);
      if (primary) {
        const defaultSelection = [primary.id, '__TASKS__'];
        setSelectedCalendars(defaultSelection);
        localStorage.setItem('selectedCalendars', JSON.stringify(defaultSelection));

        setTimeout(() => {
          console.log('Auto-syncing with default calendars...');
          handleSync(defaultSelection);
        }, 1000);
      }
    } catch (err) {
      console.error('Error loading calendars:', err);
      onError?.('Erreur de chargement des calendriers');
    }
  };

  const handleSync = async (calendarsToSync = null) => {
    const calendarIds = calendarsToSync || selectedCalendars;

    if (calendarIds.length === 0) {
      console.log('Cannot sync: no calendars selected');
      return;
    }
    if (typeof window.gapi === 'undefined' || !window.gapi.client) {
      onError?.('Google API non disponible');
      return;
    }

    const token = window.gapi.client.getToken();
    if (!token) {
      console.log('Cannot sync: no valid token');
      return;
    }

    setIsSyncing(true);
    try {
      const now = new Date();
      const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);
      const sixMonthsAhead = new Date(now.getFullYear(), now.getMonth() + 6, 31);

      const allEvents = [];
      const calendarMap = {};

      const regularCalendars = calendarIds.filter(id => id !== '__TASKS__');
      const includesTasks = calendarIds.includes('__TASKS__');

      for (const calendarId of regularCalendars) {
        const calInfo = calendars.find(c => c.id === calendarId);
        if (calInfo) {
          calendarMap[calendarId] = calInfo.backgroundColor || '#3b82f6';
          console.log(`Calendar ${calendarId} color: ${calendarMap[calendarId]}`);
        } else {
          calendarMap[calendarId] = '#3b82f6';
        }

        const response = await window.gapi.client.calendar.events.list({
          calendarId: calendarId,
          timeMin: sixMonthsAgo.toISOString(),
          timeMax: sixMonthsAhead.toISOString(),
          singleEvents: true,
          orderBy: 'startTime',
          maxResults: 2500
        });

        const events = response.result.items || [];
        allEvents.push(...events.map(e => ({ ...e, calendarId })));
      }

      if (includesTasks) {
        calendarMap['__TASKS__'] = '#F59E0B';

        try {
          if (!window.gapi.client.tasks) {
            await loadTasksAPI();
          }

          if (!window.gapi.client.tasks) {
            throw new Error('Tasks API unavailable - please check API permissions');
          }

          const taskListsResponse = await window.gapi.client.tasks.tasklists.list();
          const taskLists = taskListsResponse.result.items || [];

          for (const taskList of taskLists) {
            const tasksResponse = await window.gapi.client.tasks.tasks.list({
              tasklist: taskList.id,
              showCompleted: true,
              showHidden: false
            });

            const tasks = tasksResponse.result.items || [];

            for (const task of tasks) {
              let displayDate;
              if (task.due) {
                displayDate = new Date(task.due);
              } else {
                displayDate = new Date(now);
                displayDate.setHours(0, 0, 0, 0);
              }

              if (displayDate >= sixMonthsAgo && displayDate <= sixMonthsAhead) {
                const dateString = displayDate.toISOString().split('T')[0];

                allEvents.push({
                  id: task.id,
                  summary: task.title || 'Sans titre',
                  description: task.notes || '',
                  start: {
                    date: dateString,
                    dateTime: null
                  },
                  end: {
                    date: dateString,
                    dateTime: null
                  },
                  calendarId: '__TASKS__',
                  isTask: true,
                  taskListId: taskList.id,
                  taskListTitle: taskList.title,
                  status: task.status,
                  hasNoDueDate: !task.due,
                  completed: task.completed || null
                });
              }
            }
          }
        } catch (taskErr) {
          console.error('Error fetching tasks:', taskErr);
          if (taskErr.message && taskErr.message.includes('unavailable')) {
            onError?.('⚠️ API Tasks non disponible. Événements synchronisés, mais les tâches ne sont pas chargées.');
          } else {
            onError?.('⚠️ Erreur lors du chargement des tâches. Événements synchronisés.');
          }
        }
      }

      console.log('CalendarMap:', calendarMap);
      onSync?.(allEvents, calendarMap);
    } catch (err) {
      console.error('Error syncing:', err);
      onError?.('Erreur de synchronisation');
    } finally {
      setIsSyncing(false);
    }
  };

  const toggleCalendar = (calendarId) => {
    const newSelected = selectedCalendars.includes(calendarId)
      ? selectedCalendars.filter(id => id !== calendarId)
      : [...selectedCalendars, calendarId];

    setSelectedCalendars(newSelected);
    localStorage.setItem('selectedCalendars', JSON.stringify(newSelected));
  };

  return (
    <div className="p-3 bg-white rounded-lg mb-3 shadow-sm">
      <div className="flex flex-col gap-3">
        <h3 className="m-0 text-sm font-semibold flex items-center gap-1.5">
          <GoogleIcon />
          Calendriers
        </h3>
        {!isSignedIn ? (
          <button
            onClick={handleAuthClick}
            disabled={isLoading}
            className={`px-3 py-2 ${isLoading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'} text-white rounded-md font-medium cursor-pointer border-0 flex items-center justify-center gap-1.5 text-xs w-full transition-colors`}
          >
            <GoogleIcon />
            {isLoading ? 'Chargement...' : 'Se connecter'}
          </button>
        ) : (
          <div className="flex flex-col gap-1.5">
            <button
              onClick={() => handleSync()}
              disabled={isSyncing || selectedCalendars.length === 0}
              className={`px-3 py-2 ${isSyncing || selectedCalendars.length === 0 ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'} text-white rounded-md font-medium cursor-pointer border-0 flex items-center justify-center gap-1.5 text-xs w-full transition-colors`}
            >
              <SyncIcon />
              {isSyncing ? 'Synchro...' : 'Synchroniser'}
            </button>
            <button
              onClick={handleSignoutClick}
              className="px-3 py-1.5 bg-transparent text-red-500 rounded-md font-medium cursor-pointer border border-red-200 text-xs w-full hover:bg-red-50 transition-colors"
            >
              Déconnecter
            </button>
          </div>
        )}
      </div>

      {isSignedIn && calendars.length > 0 && (
        <div className="mt-3">
          <p className="text-xs text-gray-600 mb-2 font-medium">
            Mes calendriers :
          </p>
          <div className="flex flex-col gap-1.5">
            {calendars.map(cal => (
              <label
                key={cal.id}
                className={`flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer ${selectedCalendars.includes(cal.id) ? 'bg-green-50' : ''} hover:bg-gray-50 transition-colors`}
              >
                <input
                  type="checkbox"
                  checked={selectedCalendars.includes(cal.id)}
                  onChange={() => toggleCalendar(cal.id)}
                  className="cursor-pointer flex-shrink-0"
                />
                <div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: cal.backgroundColor || '#3b82f6' }}
                />
                <span className="text-xs leading-tight overflow-hidden overflow-ellipsis">
                  {cal.summary}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
