import React, { useState } from 'react';
import { PlusIcon, EditIcon } from '../components/icons';
import { getMoonInfo } from '../utils/moonUtils';
import { getPhaseInfo } from '../utils/cycleUtils';
import { formatTimeGoogle } from '../utils/dateUtils';
import { getTextColorForBackground } from '../utils/colorUtils';

const CycleView = ({
    cycleConfig,
    activities,
    sunData,
    onCreateEvent,
    onEditEvent,
    showTasksSidebar,
    onTaskToggle,
    showToast
}) => {
    const [selectedCircleDay, setSelectedCircleDay] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date());

    // ===== HELPER FUNCTIONS =====

    const getCycleDay = (date) => {
        if (!cycleConfig.cycleStartDate || isNaN(cycleConfig.cycleStartDate.getTime())) {
            return 1;
        }
        const diffMs = date - cycleConfig.cycleStartDate;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        return ((diffDays % cycleConfig.cycleLength) + cycleConfig.cycleLength) % cycleConfig.cycleLength || cycleConfig.cycleLength;
    };

    const getDateForCycleDay = (cycleDay) => {
        try {
            const today = new Date();
            const currentCycleDay = getCycleDay(today);
            let daysDiff = cycleDay - currentCycleDay;

            const result = new Date();
            result.setDate(result.getDate() + daysDiff);
            result.setHours(0, 0, 0, 0);

            return result;
        } catch (error) {
            console.error('Error in getDateForCycleDay:', error);
            return new Date();
        }
    };

    const formatDate = (date) => {
        if (!date || isNaN(date.getTime())) {
            const today = new Date();
            return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        }
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const getSunTimes = (date) => {
        const dateStr = date.toISOString().split('T')[0];
        return sunData[dateStr] || { sunrise: '...', sunset: '...', sunriseDecimal: 7.5, sunsetDecimal: 17 };
    };

    // ===== RENDER =====

    // Calculer la largeur disponible en tenant compte des sidebars
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const leftSidebarWidth = isMobile ? 0 : 280;
    const rightSidebarWidth = (showTasksSidebar && !isMobile) ? 350 : 0;
    const totalSidebarWidth = leftSidebarWidth + rightSidebarWidth;
    const availableWidth = (typeof window !== 'undefined' ? window.innerWidth : 1200) - totalSidebarWidth - 100;
    const svgSize = Math.min(availableWidth, 800);
    const centerX = svgSize / 2;
    const centerY = svgSize / 2;
    const outerRadius = svgSize * 0.38;
    const innerRadius = svgSize * 0.31;
    const middleRadius = (outerRadius + innerRadius) / 2;
    const anglePerDay = (2 * Math.PI) / cycleConfig.cycleLength;

    const today = new Date();
    const currentCycleDay = getCycleDay(today);
    const displayDay = selectedCircleDay || currentCycleDay;

    // Rotation pour mettre le jour actuel en haut
    const rotationOffset = -((currentCycleDay - 0.5) * anglePerDay);
    const rotationDegrees = rotationOffset * 180 / Math.PI;

    return (
        <div className="flex flex-col items-center h-full justify-center">
            <svg width={svgSize} height={svgSize} viewBox={`0 0 ${svgSize} ${svgSize}`}>
                {/* Définitions des gradients pour les transitions */}
                <defs>
                    {/* Gradient pour le premier jour de fertilité: jaune → bleu (inversé) */}
                    <linearGradient id="gradient-fertility-start" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" style={{ stopColor: '#fdfb93', stopOpacity: 1 }} />
                        <stop offset="50%" style={{ stopColor: '#c4e5e8', stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: '#AACBE0', stopOpacity: 1 }} />
                    </linearGradient>
                    {/* Gradient pour le dernier jour de fertilité: rose → jaune (inversé) */}
                    <linearGradient id="gradient-fertility-end" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" style={{ stopColor: '#CF90C1', stopOpacity: 1 }} />
                        <stop offset="50%" style={{ stopColor: '#e6c5aa', stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: '#fdfb93', stopOpacity: 1 }} />
                    </linearGradient>
                </defs>

                {/* Flèche fixe en haut */}
                <polygon
                    points={`${centerX},${centerY - outerRadius - 10} ${centerX - 12},${centerY - outerRadius - 25} ${centerX + 12},${centerY - outerRadius - 25}`}
                    fill="#4b5563"
                    stroke="#374151"
                    strokeWidth="1.5"
                    style={{ filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))' }}
                />

                {/* Segments rotatifs */}
                <g transform={`rotate(${rotationDegrees} ${centerX} ${centerY})`}>
                {Array.from({ length: cycleConfig.cycleLength }, (_, i) => {
                    const cycleDay = i + 1;
                    const phaseInfo = getPhaseInfo(cycleDay, cycleConfig.cycleLength);
                    const date = getDateForCycleDay(cycleDay);
                    const isToday = cycleDay === currentCycleDay;
                    const isSelected = cycleDay === displayDay;

                    const startAngle = -Math.PI / 2 + i * anglePerDay;
                    const endAngle = startAngle + anglePerDay;

                    const x1 = centerX + outerRadius * Math.cos(startAngle);
                    const y1 = centerY + outerRadius * Math.sin(startAngle);
                    const x2 = centerX + outerRadius * Math.cos(endAngle);
                    const y2 = centerY + outerRadius * Math.sin(endAngle);
                    const x3 = centerX + innerRadius * Math.cos(endAngle);
                    const y3 = centerY + innerRadius * Math.sin(endAngle);
                    const x4 = centerX + innerRadius * Math.cos(startAngle);
                    const y4 = centerY + innerRadius * Math.sin(startAngle);

                    const pathData = `M ${x1} ${y1} A ${outerRadius} ${outerRadius} 0 0 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 0 0 ${x4} ${y4} Z`;

                    return (
                        <path
                            key={cycleDay}
                            d={pathData}
                            fill={phaseInfo.color}
                            stroke={isToday ? '#2563eb' : (isSelected ? '#374151' : phaseInfo.border)}
                            strokeWidth={isToday ? 4 : (isSelected ? 3 : 1)}
                            className="cycle-segment cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => {
                                setSelectedCircleDay(cycleDay);
                                setSelectedDate(date);
                            }}
                        />
                    );
                })}
                </g>

                {/* Textes fixes */}
                {Array.from({ length: cycleConfig.cycleLength }, (_, i) => {
                    const cycleDay = i + 1;
                    const phaseInfo = getPhaseInfo(cycleDay, cycleConfig.cycleLength);
                    const date = getDateForCycleDay(cycleDay);
                    const moonInfo = getMoonInfo(date);

                    const baseAngle = -Math.PI / 2 + i * anglePerDay + anglePerDay / 2;
                    const adjustedAngle = baseAngle + rotationOffset;

                    const textX = centerX + middleRadius * Math.cos(adjustedAngle);
                    const textY = centerY + middleRadius * Math.sin(adjustedAngle);

                    return (
                        <g key={`text-${cycleDay}`}>
                            <text
                                x={textX}
                                y={textY - 10}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                style={{ fontSize: '10px', pointerEvents: 'none' }}
                            >
                                {moonInfo.emoji}
                            </text>
                            <text
                                x={textX}
                                y={textY + 1}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                style={{ fontSize: '9px', fontWeight: '700', fill: phaseInfo.text, pointerEvents: 'none' }}
                            >
                                J{cycleDay}
                            </text>
                            <text
                                x={textX}
                                y={textY + 11}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                style={{ fontSize: '8px', fontWeight: '500', fill: phaseInfo.text, pointerEvents: 'none' }}
                            >
                                {date.getDate()}/{date.getMonth() + 1}
                            </text>
                        </g>
                    );
                })}

                {/* Centre blanc */}
                <circle
                    cx={centerX}
                    cy={centerY}
                    r={innerRadius * 0.95}
                    fill="white"
                    stroke="#e5e7eb"
                    strokeWidth="2"
                />

                {/* Contenu central */}
                <foreignObject
                    x={centerX - innerRadius * 0.85}
                    y={centerY - innerRadius * 0.85}
                    width={innerRadius * 1.7}
                    height={innerRadius * 1.7}
                >
                    <div className="w-full h-full flex flex-col items-center justify-center p-4 overflow-auto">
                        {(() => {
                            const date = getDateForCycleDay(displayDay);
                            const phaseInfo = getPhaseInfo(displayDay, cycleConfig.cycleLength);
                            const sunTimes = getSunTimes(date);
                            const moonInfo = getMoonInfo(date);
                            const dayActivities = (activities[formatDate(date)] || []).filter(act => !act.hasNoDueDate);

                            return (
                                <>
                                    <div className="text-center mb-3 md:mb-4">
                                        <div
                                            className="text-base md:text-lg font-bold mb-1"
                                            style={{ color: phaseInfo.text }}
                                        >
                                            J{displayDay} • {phaseInfo.shortName}
                                        </div>
                                        <div className="text-[10px] md:text-[11px] text-gray-500">
                                            {date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
                                        </div>
                                        <div className="text-[9px] md:text-[10px] text-gray-400 mt-1">
                                            {moonInfo.emoji} {moonInfo.name}
                                        </div>
                                        <div className="text-[8px] md:text-[9px] text-gray-400 mt-0.5">
                                            ☀️ {sunTimes.sunrise} → {sunTimes.sunset}
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => onCreateEvent(date)}
                                        className="w-full py-2 md:py-3 mb-2 md:mb-4 bg-pink-500 text-white rounded-md border-0 cursor-pointer text-[10px] md:text-[11px] font-semibold flex items-center justify-center gap-1 hover:bg-pink-600 transition-colors"
                                    >
                                        <PlusIcon />
                                        Ajouter événement
                                    </button>

                                    {dayActivities.length > 0 && (
                                        <div
                                            className="event-list-scroll w-full max-h-[250px] md:max-h-[200px] overflow-y-auto pr-1"
                                            style={{ WebkitOverflowScrolling: 'touch' }}
                                        >
                                            {dayActivities.map(act => (
                                                <div
                                                    key={act.id}
                                                    onClick={(e) => {
                                                        if (act.isTask && e.target.type === 'checkbox') {
                                                            return;
                                                        }
                                                        onEditEvent(act);
                                                    }}
                                                    className="p-1.5 md:p-2 rounded-md text-[9px] md:text-[10px] font-semibold mb-1 cursor-pointer flex justify-between items-center transition-opacity hover:opacity-90"
                                                    style={{
                                                        backgroundColor: act.color,
                                                        color: getTextColorForBackground(act.color),
                                                        textDecoration: act.isTask && act.status === 'completed' ? 'line-through' : 'none',
                                                        opacity: act.isTask && act.status === 'completed' ? 0.7 : 1
                                                    }}
                                                >
                                                    <div className="flex items-center gap-1.5 flex-1">
                                                        {act.isTask && (
                                                            <input
                                                                type="checkbox"
                                                                checked={act.status === 'completed'}
                                                                onChange={async (e) => {
                                                                    e.stopPropagation();
                                                                    const newStatus = e.target.checked ? 'completed' : 'needsAction';
                                                                    try {
                                                                        await window.gapi.client.tasks.tasks.patch({
                                                                            tasklist: act.taskListId,
                                                                            task: act.id,
                                                                            status: newStatus,
                                                                            completed: e.target.checked ? new Date().toISOString() : null
                                                                        });

                                                                        onTaskToggle(act, e.target.checked);
                                                                        showToast(e.target.checked ? 'Tâche complétée ✓' : 'Tâche réactivée', 'success');
                                                                    } catch (err) {
                                                                        console.error('Error updating task:', err);
                                                                        showToast('Erreur lors de la mise à jour', 'error');
                                                                    }
                                                                }}
                                                                onClick={(e) => e.stopPropagation()}
                                                                className="cursor-pointer w-3.5 h-3.5 m-0"
                                                            />
                                                        )}
                                                        <span className="flex-1">
                                                            {act.isTask ? act.title : `${formatTimeGoogle(act.startTime)} • ${act.title}`}
                                                            {act.isTask && act.taskListTitle && (
                                                                <span className="opacity-80 text-[8px] ml-1">
                                                                    ({act.taskListTitle})
                                                                </span>
                                                            )}
                                                        </span>
                                                    </div>
                                                    <EditIcon />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            );
                        })()}
                    </div>
                </foreignObject>
            </svg>
        </div>
    );
};

export default CycleView;
