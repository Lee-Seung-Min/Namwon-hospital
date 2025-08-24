// 전체 선택 함수
function selectAllSlots() {
    const activeDay = getActiveDay();
    if (!activeDay) return;

    const checkboxes = document.querySelectorAll(`#${activeDay}-slots input[type="checkbox"]:not(:disabled)`);
    checkboxes.forEach((checkbox) => {
        checkbox.checked = true;
    });
}

// 전체 해제 함수
function unselectAllSlots() {
    const activeDay = getActiveDay();
    if (!activeDay) return;

    const checkboxes = document.querySelectorAll(`#${activeDay}-slots input[type="checkbox"]`);
    checkboxes.forEach((checkbox) => {
        checkbox.checked = false;
    });
}

// 현재 활성화된 요일 탭 가져오기
function getActiveDay() {
    const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
    for (const day of days) {
        const slotsContainer = document.getElementById(`${day}-slots`);
        if (slotsContainer && !slotsContainer.classList.contains("hidden")) {
            return day;
        }
    }
    return null;
}
