import { useState, useEffect } from 'react';

export default function GoogleTasks({ isSignedIn, onTasksLoaded }) {
  const [taskLists, setTaskLists] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedListId, setSelectedListId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDate, setNewTaskDate] = useState('');
  const [showNewTask, setShowNewTask] = useState(false);

  useEffect(() => {
    if (isSignedIn && window.gapi?.client) {
      loadTaskLists();
    }
  }, [isSignedIn]);

  useEffect(() => {
    if (selectedListId) {
      loadTasks(selectedListId);
    }
  }, [selectedListId]);

  const loadTaskLists = async () => {
    try {
      const response = await window.gapi.client.request({
        path: 'https://tasks.googleapis.com/tasks/v1/users/@me/lists'
      });
      const lists = response.result.items || [];
      setTaskLists(lists);
      if (lists.length > 0 && !selectedListId) {
        setSelectedListId(lists[0].id);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des listes de tâches:', error);
    }
  };

  const loadAllTasks = async () => {
    try {
      const allTasks = [];
      for (const list of taskLists) {
        const response = await window.gapi.client.request({
          path: `https://tasks.googleapis.com/tasks/v1/lists/${list.id}/tasks`,
          params: { showCompleted: false, showHidden: false }
        });
        const listTasks = (response.result.items || []).map(task => ({
          ...task,
          listId: list.id,
          listTitle: list.title
        }));
        allTasks.push(...listTasks);
      }
      if (onTasksLoaded) {
        onTasksLoaded(allTasks);
      }
    } catch (error) {
      console.error('Erreur lors du chargement de toutes les tâches:', error);
    }
  };

  const loadTasks = async (listId) => {
    setIsLoading(true);
    try {
      const response = await window.gapi.client.request({
        path: `https://tasks.googleapis.com/tasks/v1/lists/${listId}/tasks`,
        params: { showCompleted: true, showHidden: false }
      });
      setTasks(response.result.items || []);
      loadAllTasks();
    } catch (error) {
      console.error('Erreur lors du chargement des tâches:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addTask = async () => {
    if (!newTaskTitle.trim() || !selectedListId) return;

    try {
      const taskData = {
        title: newTaskTitle
      };

      if (newTaskDate) {
        const dueDate = new Date(newTaskDate);
        dueDate.setHours(12, 0, 0, 0);
        taskData.due = dueDate.toISOString();
      }

      await window.gapi.client.request({
        path: `https://tasks.googleapis.com/tasks/v1/lists/${selectedListId}/tasks`,
        method: 'POST',
        body: taskData
      });
      setNewTaskTitle('');
      setNewTaskDate('');
      setShowNewTask(false);
      loadTasks(selectedListId);
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la tâche:', error);
    }
  };

  const toggleTask = async (taskId, currentStatus) => {
    try {
      await window.gapi.client.request({
        path: `https://tasks.googleapis.com/tasks/v1/lists/${selectedListId}/tasks/${taskId}`,
        method: 'PATCH',
        body: {
          status: currentStatus === 'completed' ? 'needsAction' : 'completed'
        }
      });
      loadTasks(selectedListId);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la tâche:', error);
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await window.gapi.client.request({
        path: `https://tasks.googleapis.com/tasks/v1/lists/${selectedListId}/tasks/${taskId}`,
        method: 'DELETE'
      });
      loadTasks(selectedListId);
    } catch (error) {
      console.error('Erreur lors de la suppression de la tâche:', error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  if (!isSignedIn) {
    return null;
  }

  return (
    <div className="p-3 bg-white rounded-lg mb-3 shadow-sm">
      <div className="mb-3">
        <h3 className="m-0 mb-2 text-sm font-semibold">✓ Mes tâches</h3>

        {taskLists.length > 0 && (
          <select
            value={selectedListId || ''}
            onChange={(e) => setSelectedListId(e.target.value)}
            className="w-full px-2 py-1.5 rounded-md border border-gray-200 text-xs mb-2"
          >
            {taskLists.map(list => (
              <option key={list.id} value={list.id}>
                {list.title}
              </option>
            ))}
          </select>
        )}

        <button
          onClick={() => setShowNewTask(!showNewTask)}
          className="w-full px-3 py-1.5 bg-gray-100 border border-gray-200 rounded-md cursor-pointer text-xs font-medium text-gray-600 hover:bg-gray-200 transition-colors"
        >
          + Ajouter une tâche
        </button>

        {showNewTask && (
          <div className="mt-2 flex flex-col gap-1.5">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTask()}
              placeholder="Titre de la tâche"
              className="px-2 py-1.5 rounded-md border border-gray-200 text-xs"
              autoFocus
            />
            <input
              type="date"
              value={newTaskDate}
              onChange={(e) => setNewTaskDate(e.target.value)}
              className="px-2 py-1.5 rounded-md border border-gray-200 text-xs"
            />
            <div className="flex gap-1">
              <button
                onClick={() => {
                  setShowNewTask(false);
                  setNewTaskTitle('');
                  setNewTaskDate('');
                }}
                className="flex-1 px-3 py-1.5 bg-gray-100 text-gray-600 rounded-md cursor-pointer text-xs font-medium hover:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={addTask}
                className="flex-1 px-3 py-1.5 bg-pink-500 text-white rounded-md cursor-pointer text-xs font-medium hover:bg-pink-600 transition-colors"
              >
                Ajouter
              </button>
            </div>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="text-center py-3 text-gray-400 text-xs">
          Chargement...
        </div>
      ) : (
        <div className="max-h-[300px] overflow-y-auto flex flex-col gap-1">
          {tasks.length === 0 ? (
            <div className="text-center py-3 text-gray-400 text-xs">
              Aucune tâche
            </div>
          ) : (
            tasks.map(task => (
              <div
                key={task.id}
                className="flex items-start gap-2 px-2 py-1.5 rounded-md bg-gray-50 border border-gray-100"
              >
                <input
                  type="checkbox"
                  checked={task.status === 'completed'}
                  onChange={() => toggleTask(task.id, task.status)}
                  className="cursor-pointer flex-shrink-0 mt-0.5"
                />
                <div className="flex-1">
                  <div className={`text-xs leading-tight mb-0.5 ${task.status === 'completed' ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                    {task.title}
                  </div>
                  {task.due && (
                    <div className="text-[10px] text-gray-400">
                      📅 {formatDate(task.due)}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="px-1.5 py-0.5 bg-transparent text-red-500 rounded cursor-pointer text-[10px] flex-shrink-0 hover:bg-red-50 transition-colors"
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
