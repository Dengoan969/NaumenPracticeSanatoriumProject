import React, { useState, useEffect } from 'react';
import shiftService from '../services/shift.service';
import '../styles/ShiftsPage.css';

const ShiftsPage = () => {
    const [shifts, setShifts] = useState([]);
    const [activeShifts, setActiveShifts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [showOnlyActive, setShowOnlyActive] = useState(false);
    const shiftsPerPage = 6;

    useEffect(() => {
        const fetchShifts = async () => {
            try {
                const [allResponse, activeResponse] = await Promise.all([
                    shiftService.getAllShifts(),
                    shiftService.getActiveShifts()
                ]);
                setShifts(allResponse.data);
                setActiveShifts(activeResponse.data.map(shift => shift.id));

                if (activeResponse.data.length > 0) {
                    const firstActiveShiftId = activeResponse.data[0].id;
                    const activeShiftIndex = allResponse.data.findIndex(shift => shift.id === firstActiveShiftId);
                    if (activeShiftIndex >= 0) {
                        const pageWithActiveShift = Math.ceil((activeShiftIndex + 1) / shiftsPerPage);
                        setCurrentPage(pageWithActiveShift);
                    }
                }
            } catch (error) {
                console.error('Error fetching shifts:', error);
            }
        };

        fetchShifts();
    }, []);

    const formatDate = (dateString) => {
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('ru-RU', options);
    };

    const filteredShifts = showOnlyActive
        ? shifts.filter(shift => activeShifts.includes(shift.id))
        : shifts;

    const indexOfLastShift = currentPage * shiftsPerPage;
    const indexOfFirstShift = indexOfLastShift - shiftsPerPage;
    const currentShifts = filteredShifts.slice(indexOfFirstShift, indexOfLastShift);
    const totalPages = Math.ceil(filteredShifts.length / shiftsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const toggleShowOnlyActive = () => {
        setShowOnlyActive(!showOnlyActive);
        setCurrentPage(1);
    };

    return (
        <div className="sp-shifts-page-container">
            <div className="sp-shifts-header">
                <div className="sp-shifts-title">Смены в санатории</div>
                <button
                    onClick={toggleShowOnlyActive}
                    className={`sp-toggle-active-btn ${showOnlyActive ? 'active' : ''}`}
                >
                    {showOnlyActive ? 'Показать все' : 'Только активные'}
                </button>
            </div>

            <div className="sp-shifts-content-wrapper">
                {currentShifts.length > 0 ? (
                    <>
                        <div className="sp-shifts-list">
                            {currentShifts.map(shift => (
                                <div
                                    key={shift.id}
                                    className={`sp-shift-card ${activeShifts.includes(shift.id) ? 'active' : ''}`}
                                >
                                    <div className="sp-shift-card-header">
                                        <h3 className="sp-shift-name">{shift.name}</h3>
                                        {activeShifts.includes(shift.id) && (
                                            <span className="sp-active-badge">Активная</span>
                                        )}
                                    </div>
                                    <div className="sp-shift-dates">
                                        <span>{formatDate(shift.startDate)}</span>
                                        <span> — </span>
                                        <span>{formatDate(shift.endDate)}</span>
                                    </div>
                                    <p className="sp-shift-description">{shift.description}</p>
                                </div>
                            ))}
                        </div>

                        {filteredShifts.length > shiftsPerPage && (
                            <div className="sp-pagination">
                                <button
                                    onClick={() => paginate(Math.max(1, currentPage - 1))}
                                    disabled={currentPage === 1}
                                    className="sp-page-nav"
                                >
                                    &lt;
                                </button>

                                {Array.from({ length: Math.min(5, totalPages) }).map((_, index) => {
                                    let pageNumber;
                                    if (totalPages <= 5) {
                                        pageNumber = index + 1;
                                    } else if (currentPage <= 3) {
                                        pageNumber = index + 1;
                                    } else if (currentPage >= totalPages - 2) {
                                        pageNumber = totalPages - 4 + index;
                                    } else {
                                        pageNumber = currentPage - 2 + index;
                                    }

                                    return (
                                        <button
                                            key={index}
                                            onClick={() => paginate(pageNumber)}
                                            className={`sp-page-number ${currentPage === pageNumber ? 'active' : ''}`}
                                        >
                                            {pageNumber}
                                        </button>
                                    );
                                })}

                                <button
                                    onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                                    disabled={currentPage === totalPages}
                                    className="sp-page-nav"
                                >
                                    &gt;
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="sp-no-shifts-message">
                        Нет смен для отображения
                    </div>
                )}
            </div>
        </div>
    );
};

export default ShiftsPage;
