import { motion } from '../../lib/motion';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';

const Table = ({ 
  headers = [],
  data = [],
  sortable = false,
  onSort = null,
  sortConfig = null, // { key: string, direction: 'asc' | 'desc' }
  className = '',
}) => {
  const handleSort = (key) => {
    if (!sortable || !onSort) return;
    onSort(key);
  };

  const getSortIcon = (key) => {
    if (!sortable) return null;
    
    if (sortConfig?.key === key) {
      return sortConfig.direction === 'asc' 
        ? <ChevronUp className="w-4 h-4" />
        : <ChevronDown className="w-4 h-4" />;
    }
    
    return <ChevronsUpDown className="w-4 h-4 opacity-30" />;
  };

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full">
        <thead>
          <tr className="border-b border-neutral-200">
            {headers.map((header, index) => (
              <th
                key={index}
                onClick={() => sortable && handleSort(header.key || header)}
                className={`
                  px-6 py-4 text-left text-sm font-semibold text-neutral-700
                  ${sortable ? 'cursor-pointer hover:bg-neutral-50 select-none' : ''}
                `}
              >
                <div className="flex items-center gap-2">
                  <span>{typeof header === 'object' ? header.label : header}</span>
                  {sortable && getSortIcon(header.key || header)}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <motion.tr
              key={rowIndex}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: rowIndex * 0.05 }}
              className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors"
            >
              {Object.entries(row).map(([cellKey, value], cellIndex) => (
                <td 
                  key={cellKey || cellIndex}
                  className="px-6 py-4 text-sm text-neutral-700"
                >
                  {value}
                </td>
              ))}
            </motion.tr>
          ))}
        </tbody>
      </table>

      {data.length === 0 && (
        <div className="text-center py-12 text-neutral-500">
          <p>No data available</p>
        </div>
      )}
    </div>
  );
};

export default Table;
