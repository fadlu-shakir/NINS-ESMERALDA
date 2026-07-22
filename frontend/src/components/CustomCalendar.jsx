import { useState } from 'react';

const CustomCalendar = ({ checkInDate, checkOutDate, onDateChange, bookedDates = [], minDate = new Date() }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date(checkInDate || minDate || new Date()));
  const [hoverDate, setHoverDate] = useState(null);

  const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const formatDate = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const getDayStatus = (date) => {
    const dStr = formatDate(date);
    for (const booking of bookedDates) {
      if (booking.check_in === dStr) return 'check-in';
      if (booking.check_out === dStr) return 'check-out';
      if (dStr > booking.check_in && dStr < booking.check_out) return 'reserved';
    }
    return 'available';
  };

  const getSelectionStatus = (date) => {
    const dStr = formatDate(date);
    if (checkInDate === dStr) {
       if (checkOutDate) return 'selection-check-in has-next';
       if (hoverDate && hoverDate > checkInDate) return 'selection-check-in has-hover-next';
       return 'selection-check-in isolated';
    }
    if (checkOutDate === dStr) return 'selection-check-out';
    if (checkInDate && checkOutDate && dStr > checkInDate && dStr < checkOutDate) return 'selection-between';
    
    if (checkInDate && !checkOutDate && hoverDate) {
        if (dStr > checkInDate && dStr < hoverDate) return 'selection-between-hover';
        if (dStr === hoverDate && dStr > checkInDate) return 'selection-check-out-hover';
    }
    
    return '';
  };

  const isPast = (date) => date < today;

  const handlePrevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));

  const renderMonth = (monthOffset) => {
    const targetMonthDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + monthOffset, 1);
    const year = targetMonthDate.getFullYear();
    const month = targetMonthDate.getMonth();
    
    const totalDays = daysInMonth(year, month);
    const firstDay = firstDayOfMonth(year, month);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    for (let d = 1; d <= totalDays; d++) {
      const date = new Date(year, month, d);
      const status = getDayStatus(date);
      const past = isPast(date);
      const selectionStatus = getSelectionStatus(date);
      
      const isDisabled = past || status === 'reserved' || status === 'check-in' || (minDate && date < new Date(new Date(minDate).setHours(0,0,0,0)));

      days.push(
        <div 
          key={d} 
          className={`calendar-day-wrapper ${selectionStatus}`}
        >
          <div 
            className={`calendar-day ${status} ${isDisabled ? 'disabled' : 'available'}`}
            onClick={() => !isDisabled && onDateChange(date)}
            onMouseEnter={() => !isDisabled && setHoverDate(formatDate(date))}
            onMouseLeave={() => setHoverDate(null)}
          >
            {d}
          </div>
        </div>
      );
    }
    
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    
    return (
      <div className="calendar-pane">
        <div className="calendar-pane-header mb-4 text-center fw-bold text-dark" style={{ fontSize: '1.15rem' }}>
          {monthNames[month]} {year}
        </div>
        <div className="calendar-weekdays d-grid mb-2" style={{ gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center' }}>
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <small key={d} className="text-muted fw-bold" style={{fontSize: '0.75rem'}}>{d}</small>)}
        </div>
        <div className="calendar-grid d-grid" style={{ gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', gap: '4px 0' }}>
          {days}
        </div>
      </div>
    );
  };

  return (
    <div className="premium-calendar-container position-relative">
      <div className="custom-calendar card shadow-sm border rounded-4 overflow-hidden mx-auto" style={{ borderColor: '#eef2f6', maxWidth: '450px' }}>
        
        {/* Navigation */}
        <div className="calendar-nav d-flex justify-content-between position-absolute w-100 px-4 pt-4" style={{ zIndex: 10, top: 0, left: 0 }}>
          <button className="btn btn-nav shadow-sm rounded-circle" onClick={(e) => { e.preventDefault(); handlePrevMonth(); }}><i className="fas fa-chevron-left"></i></button>
          <button className="btn btn-nav shadow-sm rounded-circle" onClick={(e) => { e.preventDefault(); handleNextMonth(); }}><i className="fas fa-chevron-right"></i></button>
        </div>

        <div className="calendar-body p-4 pt-5">
          {renderMonth(0)}
        </div>
        
        <div className="calendar-footer p-3 small bg-light border-top d-flex flex-column gap-3 align-items-center">
          <div className="d-flex gap-3 justify-content-center w-100 text-muted">
            <span><span className="dot" style={{backgroundColor: '#cbd5e1'}}></span> Booked</span>
            <span><span className="dot" style={{backgroundColor: 'var(--color-primary)'}}></span> Check-in / Out</span>
            <span><span className="dot" style={{backgroundColor: 'rgba(var(--color-accent-rgb), 0.5)'}}></span> Selected</span>
          </div>
          {(checkInDate || checkOutDate) && (
            <button 
              className="btn btn-sm btn-outline-dark rounded-pill px-4 fw-semibold w-100"
              onClick={(e) => {
                e.preventDefault();
                onDateChange(null);
              }}
            >
              Clear Selection
            </button>
          )}
        </div>
      </div>

      <style>{`
        .premium-calendar-container {
          user-select: none;
        }
        .btn-nav {
          background: white;
          color: #333;
          width: 38px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #eaeaea;
          transition: all 0.2s ease;
        }
        .btn-nav:hover {
          background: #f8f9fa;
          transform: scale(1.05);
        }
        .calendar-day-wrapper {
          position: relative;
          padding: 2px 0;
        }
        .calendar-day-wrapper.selection-between {
          background-color: rgba(var(--color-accent-rgb), 0.15);
        }
        .calendar-day-wrapper.selection-between-hover {
          background-color: rgba(var(--color-accent-rgb), 0.08);
        }
        .calendar-day-wrapper.selection-check-in.has-next {
          background: linear-gradient(to right, transparent 50%, rgba(var(--color-accent-rgb), 0.15) 50%);
        }
        .calendar-day-wrapper.selection-check-in.has-hover-next {
          background: linear-gradient(to right, transparent 50%, rgba(var(--color-accent-rgb), 0.08) 50%);
        }
        .calendar-day-wrapper.selection-check-out {
          background: linear-gradient(to left, transparent 50%, rgba(var(--color-accent-rgb), 0.15) 50%);
        }
        .calendar-day-wrapper.selection-check-out-hover {
          background: linear-gradient(to left, transparent 50%, rgba(var(--color-accent-rgb), 0.08) 50%);
        }

        .calendar-day {
          width: 40px;
          height: 40px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          border-radius: 50%;
          transition: all 0.2s;
          font-size: 0.9rem;
          font-weight: 500;
          position: relative;
          z-index: 2;
        }
        .calendar-day.available:hover {
          border: 2px solid #333;
        }
        
        .calendar-day-wrapper.selection-check-in .calendar-day,
        .calendar-day-wrapper.selection-check-in.has-next .calendar-day,
        .calendar-day-wrapper.selection-check-in.has-hover-next .calendar-day,
        .calendar-day-wrapper.selection-check-in.isolated .calendar-day {
          background-color: var(--color-primary) !important;
          color: white !important;
          box-shadow: 0 4px 10px rgba(28, 25, 23, 0.3);
          transform: scale(1.05);
        }
        .calendar-day-wrapper.selection-check-out .calendar-day,
        .calendar-day-wrapper.selection-check-out-hover .calendar-day {
          background-color: var(--color-primary) !important;
          color: white !important;
          box-shadow: 0 4px 10px rgba(28, 25, 23, 0.3);
          transform: scale(1.05);
        }
        
        .calendar-day-wrapper.selection-between .calendar-day,
        .calendar-day-wrapper.selection-between-hover .calendar-day {
          color: var(--color-primary);
          font-weight: 600;
        }

        .calendar-day.check-in,
        .calendar-day.reserved {
          background-color: transparent !important;
          color: #cbd5e1 !important;
          text-decoration: line-through;
          cursor: not-allowed;
        }
        .calendar-day.check-out {
          background-color: transparent !important;
          color: #cbd5e1 !important;
          border: 1px dashed #cbd5e1;
          cursor: not-allowed;
        }
        .calendar-day.disabled:not(.reserved):not(.check-in):not(.check-out) {
          color: #cbd5e1;
          cursor: not-allowed;
          text-decoration: line-through;
        }
        
        /* Render booked dots instead of crossing out the whole day if you want, or keep it crossed out */
        
        .dot {
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          margin-right: 6px;
        }
      `}</style>
    </div>
  );
};

export default CustomCalendar;
