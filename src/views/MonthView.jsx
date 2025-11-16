import { useRef } from 'react';
import { formatTimeGoogle } from '../utils/dateUtils';

export default function MonthView({
  currentMonth,
  onMonthChange,
  activities,
  getPhaseForDate,
  getCycleDayForDate,
  onDayClick,
  onEventClick,
  googleCalendars
}) {
  const lastScrollTime = useRef(0);

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const startingDayOfWeek = firstDayOfMonth.getDay();

  const prevMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() - 1);
    onMonthChange(newMonth);
  };

  const nextMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + 1);
    onMonthChange(newMonth);
  };

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Créer les jours du calendrier avec les jours du mois précédent/suivant
  const calendarDays = [];

  // Jours du mois précédent
  const prevMonthLastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 0);
  const prevMonthDays = prevMonthLastDay.getDate();
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, prevMonthDays - i);
    calendarDays.push({ date, isCurrentMonth: false });
  }

  // Jours du mois actuel
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    calendarDays.push({ date, isCurrentMonth: true });
  }

  // Calculer le nombre de lignes nécessaires (4, 5 ou 6 semaines)
  const weeksNeeded = Math.ceil(calendarDays.length / 7);

  // Jours du mois suivant pour compléter la dernière semaine uniquement
  const remainingCells = (weeksNeeded * 7) - calendarDays.length;
  for (let day = 1; day <= remainingCells; day++) {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, day);
    calendarDays.push({ date, isCurrentMonth: false });
  }

  return (
    <div
      className="w-full h-full flex flex-col"
      onWheel={(e) => {
        // Navigation horizontale avec la molette/trackpad - 1 scroll = 1 mois
        const now = Date.now();
        if (now - lastScrollTime.current < 500) return; // Éviter les changements multiples

        if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 30) {
          e.preventDefault(); // Empêcher le navigateur de faire "back"
          lastScrollTime.current = now;
          if (e.deltaX > 0) {
            nextMonth();
          } else {
            prevMonth();
          }
        }
      }}
    >
      {/* Calendrier */}
      <div
        className="grid gap-px flex-1 overflow-hidden rounded-lg"
        style={{
          gridTemplateColumns: 'repeat(7, 1fr)',
          gridTemplateRows: `repeat(${weeksNeeded}, 1fr)`,
        }}
      >
        {/* Cellules du calendrier */}
        {calendarDays.map((dayInfo, index) => {
          const weekdayNames = ['DIM', 'LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM'];
          const showWeekdayHeader = index < 7;
          const { date, isCurrentMonth } = dayInfo;
          const phaseInfo = getPhaseForDate(date);
          const dateKey = formatDate(date);
          // Filtrer les tâches sans échéance pour la vue calendrier
          const dayActivities = (activities[dateKey] || [])
            .filter(act => !act.hasNoDueDate)
            .sort((a, b) => {
              // Tâches à la fin
              if (a.isTask && !b.isTask) return 1;
              if (!a.isTask && b.isTask) return -1;
              // Trier les événements par heure de début
              if (!a.isTask && !b.isTask) {
                return (a.startTime || '').localeCompare(b.startTime || '');
              }
              return 0;
            });
          const isToday = formatDate(date) === formatDate(new Date());

          // Calculer le jour du cycle avec la fonction fournie
          const cycleDay = getCycleDayForDate ? getCycleDayForDate(date) : 1;

          // Calculer le nombre max d'événements selon le nombre de rows
          // 4 semaines → 6 lignes, 5 semaines → 5 lignes, 6 semaines → 4 lignes
          const maxEvents = weeksNeeded === 4 ? 6 : (weeksNeeded === 5 ? 5 : 4);

          return (
            <div
              key={dateKey}
              onClick={() => onDayClick(date)}
              className="p-0.5 rounded-md cursor-pointer transition-all overflow-hidden flex flex-col hover:scale-[1.02] hover:shadow-md"
              style={{
                backgroundColor: phaseInfo.color + (isCurrentMonth ? '15' : '08'),
                border: isToday ? `2px solid ${phaseInfo.color}` : '1px solid #e5e7eb',
                opacity: isCurrentMonth ? 1 : 0.4,
                padding: showWeekdayHeader ? '3px' : '2px 3px',
              }}
            >
              {showWeekdayHeader && (
                <div className="text-center text-[11px] font-semibold text-gray-600 mb-px">
                  {weekdayNames[index]}
                </div>
              )}
              <div className="flex justify-center items-center mb-0.5 flex-shrink-0 relative">
                <span
                  className={`text-[17px] ${isToday ? 'font-bold' : 'font-medium'}`}
                  style={{
                    color: isToday ? phaseInfo.color : (isCurrentMonth ? '#374151' : '#9ca3af')
                  }}
                >
                  {date.getDate()}
                </span>
                <span
                  className="text-xs font-semibold px-1 py-0.5 rounded absolute right-0"
                  style={{
                    color: phaseInfo.text,
                    backgroundColor: phaseInfo.color + '30',
                  }}
                >
                  J{cycleDay}
                </span>
              </div>

              {/* Événements */}
              <div
                className="flex flex-col gap-0 overflow-hidden min-h-0"
                style={{ flex: maxEvents }}
              >
                {dayActivities.slice(0, maxEvents).map((activity, idx) => (
                  <div
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onEventClick) {
                        onEventClick(activity);
                      }
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f3f4f6';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                    style={{
                      fontSize: '14px',
                      padding: '1px 3px',
                      borderRadius: '3px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      cursor: 'pointer',
                      transition: 'background-color 0.15s ease',
                      position: 'relative',
                      color: '#1f2937',
                      lineHeight: '1.2',
                      flex: 1
                    }}
                  >
                    {/* Point de couleur */}
                    <div style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      backgroundColor: activity.color,
                      flexShrink: 0
                    }} />

                    {/* Heure formatée + Titre */}
                    <span style={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      fontWeight: '400'
                    }}>
                      {activity.isTask ? (
                        <>✓ {activity.title}</>
                      ) : (
                        <>{formatTimeGoogle(activity.startTime)} {activity.title}</>
                      )}
                    </span>
                  </div>
                ))}
                {dayActivities.length > maxEvents && (
                  <div className="text-[10px] text-gray-600 font-medium px-0.5 py-0.5">
                    +{dayActivities.length - maxEvents} autres
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
