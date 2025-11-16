import { formatTimeGoogle } from '../../utils/dateUtils';
import { getTextColorForBackground } from '../../utils/colorUtils';

export default function DayEventsModal({ date, activities, phaseInfo, cycleDay, onClose, onEventClick }) {
  if (!date) return null;

  const dateStr = date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h2 className="text-2xl font-bold capitalize" style={{ color: phaseInfo.color }}>
                {dateStr}
              </h2>
              <div className="text-sm text-gray-500 mt-1">
                J{cycleDay} • {phaseInfo.shortName}
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold leading-none"
            >
              ×
            </button>
          </div>
        </div>

        {/* Events list */}
        <div className="space-y-2">
          {activities.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Aucun événement ce jour</p>
          ) : (
            activities.map((activity, idx) => (
              <div
                key={idx}
                onClick={() => {
                  onEventClick(activity);
                  onClose();
                }}
                className="p-3 rounded-md cursor-pointer hover:opacity-90 transition-opacity"
                style={{
                  backgroundColor: activity.color,
                  color: getTextColorForBackground(activity.color)
                }}
              >
                <div className="flex items-center gap-2">
                  {activity.isTask && (
                    <input
                      type="checkbox"
                      checked={activity.status === 'completed'}
                      readOnly
                      className="w-4 h-4"
                    />
                  )}
                  <div className="flex-1">
                    <div className="font-medium">
                      {activity.isTask ? (
                        <>✓ {activity.title}</>
                      ) : (
                        <>
                          <span className="font-light">{formatTimeGoogle(activity.startTime)}</span>
                          {' '}
                          <span className="font-semibold">{activity.title}</span>
                        </>
                      )}
                    </div>
                    {activity.isTask && activity.taskListTitle && (
                      <div className="text-sm opacity-80 mt-0.5">
                        {activity.taskListTitle}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
