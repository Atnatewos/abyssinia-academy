/**
 * @fileoverview Tabs Component
 * Tabbed interface for switching between content sections
 * Path: apps/web/components/shared/Tabs.jsx
 */

/**
 * Tabs - Horizontal tab navigation
 * @param {object} props
 * @param {Array<{id: string, label: string, count?: number}>} props.tabs - Tab definitions
 * @param {string} props.activeTab - Currently active tab ID
 * @param {Function} props.onChange - Tab change handler
 * @param {string} [props.className] - Additional CSS classes
 */
const Tabs = ({ tabs, activeTab, onChange, className = '' }) => {
  return (
    <div className={`flex items-center gap-4 border-b border-slate-700/30 pb-2 ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`text-xs font-bold pb-2 transition border-b-2 ${
            activeTab === tab.id
              ? 'border-amber-500 text-amber-500'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-amber-500'
          }`}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span className="ml-1.5 text-slate-400">({tab.count})</span>
          )}
        </button>
      ))}
    </div>
  );
};

export default Tabs;