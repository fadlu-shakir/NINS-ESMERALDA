import { useState } from 'react';

const CustomCalendar = ({ selectedDate, onDateChange, bookedDates = [], minDate = new Date() }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate || minDate || new Date()));

  const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

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
    
    // Priority: Check-in > Check-out > Reserved
    for (const booking of bookedDates) {
      if (booking.check_in === dStr) return 'check-in';
      if (booking.check_out === dStr) return 'check-out';
      if (dStr > booking.check_in && dStr < booking.check_out) return 'reserved';
    }

    return 'available';
  };

  const isSelected = (date) => {
    if (!selectedDate) return false;
    return selectedDate === formatDate(date);
  };

  const isPast = (date) => date < today;

  const handlePrevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

  const renderDays = () => {
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
      const selected = isSelected(date);
      
      const isDisabled = past || status === 'reserved' || status === 'check-in' || (minDate && date < new Date(new Date(minDate).setHours(0,0,0,0)));

      days.push(
        <div 
          key={d} 
          className={`calendar-day ${status} ${selected ? 'selected' : ''} ${isDisabled ? 'disabled' : 'available'}`}
          onClick={() => !isDisabled && onDateChange(date)}
        >
          {d}
        </div>
      );
    }
    return days;
  };

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  return (
    <div className="custom-calendar card shadow-sm border-0">
      <div className="calendar-header d-flex justify-content-between align-items-center p-2 bg-light border-bottom">
        <button className="btn btn-sm btn-link text-dark" onClick={handlePrevMonth}>&lt;</button>
        <span className="fw-bold">{monthNames[month]} {year}</span>
        <button className="btn btn-sm btn-link text-dark" onClick={handleNextMonth}>&gt;</button>
      </div>
      <div className="calendar-body p-3">
        <div className="calendar-weekdays d-grid mb-2" style={{ gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center' }}>
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <small key={d} className="text-muted fw-bold">{d}</small>)}
        </div>
        <div className="calendar-grid d-grid" style={{ gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', gap: '5px' }}>
          {renderDays()}
        </div>
      </div>
      <div className="calendar-footer p-2 small border-top bg-light">
        <div className="row g-2 text-center">
          <div className="col-6"><span><span className="dot" style={{backgroundColor: '#ef4444'}}></span> Check-in</span></div>
          <div className="col-6"><span><span className="dot" style={{backgroundColor: '#eab308'}}></span> Check-out</span></div>
          <div className="col-6"><span><span className="dot" style={{backgroundColor: '#991b1b'}}></span> Reserved</span></div>
          <div className="col-6"><span><span className="dot" style={{backgroundColor: '#c5a880'}}></span> Selected</span></div>
        </div>
      </div>
      <style>{`
        .calendar-day {
          padding: 8px 0;
          cursor: pointer;
          border-radius: 4px;
          transition: all 0.2s;
          font-size: 0.85rem;
          font-weight: 500;
        }
        .calendar-day.available:hover {
          background-color: #f1f5f9;
        }
        .calendar-day.selected {
          background-color: #c5a880 !important;
          color: white !important;
          box-shadow: 0 0 10px rgba(197, 168, 128, 0.5);
        }
        .calendar-day.check-in {
          background-color: #fee2e2 !important;
          color: #ef4444 !important;
          border: 1px solid #fecaca;
          cursor: not-allowed;
        }
        .calendar-day.check-out {
          background-color: #fef9c3 !important;
          color: #a16207 !important;
          border: 1px solid #fef08a;
        }
        .calendar-day.reserved {
          background-color: #991b1b !important;
          color: white !important;
          cursor: not-allowed;
        }
        .calendar-day.disabled:not(.reserved):not(.check-in):not(.check-out) {
          color: #cbd5e1;
          cursor: not-allowed;
        }
        .dot {
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          margin-right: 4px;
        }
      `}</style>
    </div>
  );
};

export default CustomCalendar;
