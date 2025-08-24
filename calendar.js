
/* ===== 상태 ===== */
const state = {
    viewDate: new Date(2025, 0, 1),   // 초기 표시 월 (연,0-11,1)
    selectedDate: "2025-01-15",       // 오른쪽 패널 기준 날짜(상단 date input과 연동)
    keyword: "",                      // 환자명 검색
    appointments: [
        // 데모 데이터
        { name: "김환자", date: "2025-01-01", time: "09:00", note: "동부 경로당", birth: "85.03.12", doctor: "김의사", status: "진료완료" },
        { name: "이환자", date: "2025-01-01", time: "14:00", note: "남부 경로당", birth: "78.07.22", doctor: "이의사", status: "진료 대기"},
        { name: "박환자", date: "2025-01-16", time: "10:30", note: "중앙 경로당", birth: "92.11.05", doctor: "박의사", status: "진료 대기"},
        { name: "최환자", date: "2025-01-02", time: "08:30", note: "서부 경로당", birth: "80.08.15", doctor: "최의사", status: "진료완료"},
        { name: "정환자", date: "2025-01-02", time: "13:00", note: "동부 경로당", birth: "70.02.20", doctor: "정의사", status: "진료 대기"},
        { name: "강환자", date: "2025-01-02", time: "15:00", note: "남부 경로당", birth: "88.09.10", doctor: "김의사", status: "예약 완료"},
        { name: "윤환자", date: "2025-01-03", time: "10:00", note: "중앙 경로당", birth: "95.05.30", doctor: "윤의사", status: "예약 확정"},
        { name: "최환자", date: "2025-01-03", time: "11:00", note: "서부 경로당", birth: "88.02.18", doctor: "최의사" },
        { name: "정환자", date: "2025-01-03", time: "15:30", note: "동부 경로당", birth: "15.06.09", doctor: "정의사" },
        { name: "강환자", date: "2025-01-03", time: "16:00", note: "남부 경로당", birth: "83.04.07", doctor: "김의사" },
        { name: "윤환자", date: "2025-01-05", time: "09:30", note: "중앙 경로당", birth: "90.01.14", doctor: "윤의사" },
        { name: "조환자", date: "2025-01-06", time: "08:00", note: "동부 경로당", birth: "65.05.21", doctor: "배의사" },
        { name: "한환자", date: "2025-01-06", time: "13:00", note: "서부 경로당", birth: "10.10.19", doctor: "박의사" },
        { name: "송환자", date: "2025-01-08", time: "10:00", note: "동부 경로당", birth: "95.12.25", doctor: "송의사" },
        { name: "임환자", date: "2025-01-09", time: "14:30", note: "서부 경로당", birth: "02.12.02", doctor: "임의사" },
        { name: "신환자", date: "2025-01-09", time: "16:30", note: "동부 경로당", birth: "87.03.03", doctor: "허의사" },
        { name: "오환자", date: "2025-01-10", time: "11:30", note: "남부 경로당", birth: "99.09.30", doctor: "김의사" },
        // 오늘/이번주/이번달 통계 확인용
        // { name:"오늘예약", date: fmtDate(new Date()), time:"09:00", note:"" },
    ],
};

/* ===== 유틸 ===== */
const pad2 = n => (n < 10 ? "0" + n : "" + n);
const fmtDate = d => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const parseDate = s => { const [Y, M, D] = s.split("-").map(Number); return new Date(Y, (M - 1), D); };
const yymm = d => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;

/* ===== DOM 캐시 ===== */
const calendarSection = document.querySelector('#calendar-section');
const container = document.querySelector('#calendar-container');
const headerBtns = container.querySelectorAll('.p-2.hover\\:bg-neutral-100');
const prevBtn = headerBtns[0];
const nextBtn = headerBtns[1];
const monthLabel = container.querySelector('h3');

const grids = container.querySelectorAll('.grid.grid-cols-7');
const weekHeaderGrid = grids[0];
let datesGrid = grids[1]; // 이 그리드를 JS가 갈아끼움

const searchInput = calendarSection.querySelector('input[type="text"][placeholder="환자명으로 검색"]');
const selectedDateInput = calendarSection.querySelector('input[type="date"]');
const newApptBtn = calendarSection.querySelector('button.bg-neutral-900');

const todayPanel = document.querySelector('#appointment-sidebar .space-y-3');
const quickStatsBox = document.querySelector('#appointment-sidebar .mt-6');

/* ===== 모달 만들기 (Tailwind로 즉석 생성) ===== */
const modal = document.createElement('div');
modal.className = "fixed inset-0 bg-black bg-opacity-50 hidden items-center justify-center z-50";
modal.innerHTML = `
  <div class="bg-white rounded-lg p-6 w-full max-w-md mx-4">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg text-neutral-900">새 예약</h3>
      <button id="modalClose" class="text-neutral-400 hover:text-neutral-600">
        <i class="fa-solid fa-times"></i>
      </button>
    </div>
    <div class="space-y-4">
      <div>
        <label class="block text-sm text-neutral-700 mb-1">환자명</label>
        <input id="mName" type="text" class="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-500" placeholder="홍길동">
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-sm text-neutral-700 mb-1">날짜</label>
          <input id="mDate" type="date" class="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-500">
        </div>
        <div>
          <label class="block text-sm text-neutral-700 mb-1">시간</label>
          <input id="mTime" type="time" class="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-500">
        </div>
      </div>
      <div>
        <label class="block text-sm text-neutral-700 mb-1">메모</label>
        <textarea id="mNote" rows="3" class="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-500" placeholder="증상/메모"></textarea>
      </div>
    </div>
    <div class="flex justify-end space-x-3 mt-6">
      <button id="modalCancel" class="px-4 py-2 text-neutral-700 border border-neutral-300 rounded-md hover:bg-neutral-50">취소</button>
      <button id="modalSave" class="px-4 py-2 bg-neutral-900 text-white rounded-md hover:bg-neutral-800">저장</button>
    </div>
  </div>
`;
document.body.appendChild(modal);
const $ = sel => modal.querySelector(sel);

/* ===== 렌더: 달력(42셀) ===== */
function renderCalendar() {
    const yyyy = state.viewDate.getFullYear();
    const mm = state.viewDate.getMonth();   // 0-11
    monthLabel.textContent = `${yyyy}년 ${mm + 1}월`;

    const first = new Date(yyyy, mm, 1);
    const firstDow = first.getDay(); // 0=일
    const daysInMonth = new Date(yyyy, mm + 1, 0).getDate();
    const prevMonthDays = new Date(yyyy, mm, 0).getDate();

    const leading = firstDow;
    const totalCells = 42;
    const trailing = totalCells - (leading + daysInMonth);

    // 필터 적용된 예약을 날짜별로 맵핑
    const filtered = state.appointments
        .filter(a => state.keyword ? a.name.includes(state.keyword.trim()) : true)
        .reduce((acc, a) => {
            (acc[a.date] ||= []).push(a);
            return acc;
        }, {});
    Object.values(filtered).forEach(list => list.sort((a, b) => a.time.localeCompare(b.time)));

    // 날짜 그리드 재구성
    const wrapper = document.createElement('div');
    wrapper.className = "grid grid-cols-7";

    const cellHTML = (dateObj, isDim) => {
        const dateStr = fmtDate(dateObj);
        const isSelected = dateStr === state.selectedDate;
        const appts = filtered[dateStr] || [];
        const border = "border-r border-b border-neutral-200";
        const dimCls = isDim ? "text-neutral-400" : "text-neutral-900";
        const bgSel = isSelected ? " ring-2 ring-primary-500 rounded-sm" : "";
        const apptItems = appts.slice(0, 4).map(a =>
            `<div class="text-xs bg-neutral-200 px-2 py-1 rounded">
                <div class="flex justify-between">
                    <span>${a.time} ${a.name}</span>
                    <span class="text-neutral-600">${a.doctor}</span>
                </div>
             </div>`
        ).join("");
        const more = appts.length > 4 ? `<div class="text-[10px] text-neutral-500 mt-1">+${appts.length - 4} more</div>` : "";

        return `
      <div class="h-32 p-2 ${border} align-top cursor-pointer${bgSel}" data-date="${dateStr}">
        <div class="${dimCls}">${dateObj.getDate()}</div>
        <div class="mt-1 space-y-1">${apptItems}${more}</div>
      </div>
    `;
    };

    // 앞쪽(이전 달)
    for (let i = 0; i < leading; i++) {
        const d = new Date(yyyy, mm - 1, prevMonthDays - (leading - 1 - i));
        wrapper.insertAdjacentHTML('beforeend', cellHTML(d, true));
    }
    // 이번 달
    for (let d = 1; d <= daysInMonth; d++) {
        wrapper.insertAdjacentHTML('beforeend', cellHTML(new Date(yyyy, mm, d), false));
    }
    // 뒤쪽(다음 달)
    for (let i = 1; i <= trailing; i++) {
        wrapper.insertAdjacentHTML('beforeend', cellHTML(new Date(yyyy, mm + 1, i), true));
    }

    // 기존 datesGrid 교체
    datesGrid.replaceWith(wrapper);
    datesGrid = wrapper;

    // 날짜 클릭 -> 선택/예약 빠른 추가
    datesGrid.querySelectorAll('[data-date]').forEach(cell => {
        cell.addEventListener('click', () => {
            const d = cell.getAttribute('data-date');
            state.selectedDate = d;
            selectedDateInput.value = d;
            // 같은 월이 아니면 그 월로 이동
            const dObj = parseDate(d);
            if (yymm(dObj) !== yymm(state.viewDate)) {
                state.viewDate = new Date(dObj.getFullYear(), dObj.getMonth(), 1);
                renderCalendar();
            } else {
                // 선택 표시만 갱신
                renderCalendar();
            }
            renderSidebar();
        });
    });
}

/* ===== 렌더: 오른쪽 패널(오늘의 예약/통계) ===== */
function renderSidebar() {
    // 오늘의 예약 = 선택 날짜(state.selectedDate)의 예약
    const sel = state.selectedDate;
    const list = state.appointments
        .filter(a => a.date === sel)
        .filter(a => state.keyword ? a.name.includes(state.keyword.trim()) : true)
        .sort((a, b) => a.time.localeCompare(b.time));

    todayPanel.innerHTML = list.length
        ? list.map(a => `
      <div class="bg-white p-4 rounded-lg border border-neutral-200 cursor-pointer" onclick="location.href='detailAppointment.html'">
        <div class="flex items-center justify-between mb-2">
          <span class="text-neutral-900">${a.name}</span>
          <div>
          ${a.status ? `<span class="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">${a.status}</span>` : ''}
          <span class="text-sm text-neutral-500">${a.time}</span>
          </div>
          
        </div>
        <div class="text-sm text-neutral-600 space-y-1">
          
          <div>${a.birth}</div>
          <div>담당의: ${a.doctor}</div>
          ${a.note ? `<div>${a.note}</div>` : ''}
        </div>
      </div>
    `).join('')
        : `<div class="text-sm text-neutral-500">예약이 없습니다.</div>`;

    // 빠른 통계 (오늘/이번주/이번달) — 오늘 기준
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // 일요일
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const inRange = (d, s, e) => {
        const t = parseDate(d);
        // 날짜만 비교
        t.setHours(0, 0, 0, 0);
        s = new Date(s); s.setHours(0, 0, 0, 0);
        e = new Date(e); e.setHours(0, 0, 0, 0);
        return t >= s && t <= e;
    };

    const todayCount = state.appointments.filter(a => a.date === fmtDate(today)).length;
    const weekCount = state.appointments.filter(a => inRange(a.date, startOfWeek, endOfWeek)).length;
    const monthCount = state.appointments.filter(a => inRange(a.date, monthStart, monthEnd)).length;

    const statsRows = quickStatsBox.querySelectorAll('.text-sm .flex');
    // 기존 마크업을 통째로 교체
    quickStatsBox.innerHTML = `
    <h4 class="text-lg text-neutral-900 mb-3">예약 일정</h4>
  `;
}

/* ===== 이벤트 바인딩 ===== */
prevBtn.addEventListener('click', () => {
    state.viewDate = new Date(state.viewDate.getFullYear(), state.viewDate.getMonth() - 1, 1);
    renderCalendar(); // 월 이동
});
nextBtn.addEventListener('click', () => {
    state.viewDate = new Date(state.viewDate.getFullYear(), state.viewDate.getMonth() + 1, 1);
    renderCalendar();
});

searchInput.addEventListener('input', (e) => {
    state.keyword = e.target.value || "";
    renderCalendar();
    renderSidebar();
});

selectedDateInput.addEventListener('change', (e) => {
    const d = e.target.value;
    if (!d) return;
    state.selectedDate = d;

    const dObj = parseDate(d);
    // 선택 날짜의 달로 이동
    state.viewDate = new Date(dObj.getFullYear(), dObj.getMonth(), 1);
    renderCalendar();
    renderSidebar();
});

newApptBtn.addEventListener('click', () => openModal(state.selectedDate));

/* ===== 모달 로직 ===== */
function openModal(prefillDate) {
    $('#mName').value = '';
    $('#mDate').value = prefillDate || fmtDate(new Date());
    $('#mTime').value = '';
    $('#mNote').value = '';
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    setTimeout(() => $('#mName').focus(), 0);
}
function closeModal() {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}
$('#modalClose').addEventListener('click', closeModal);
$('#modalCancel').addEventListener('click', closeModal);
$('#modalSave').addEventListener('click', () => {
    const name = $('#mName').value.trim();
    const date = $('#mDate').value;
    const time = $('#mTime').value;
    const note = $('#mNote').value.trim();
    if (!name || !date || !time) {
        alert('환자명/날짜/시간을 입력해주세요.');
        return;
    }
    state.appointments.push({ name, date, time, note, birth: "", doctor: "" }); // 새 예약 시 기본값 추가
    // 선택 날짜가 비어있으면 방금 추가한 날짜로 맞춰줌
    state.selectedDate = date;
    selectedDateInput.value = date;
    state.viewDate = new Date(parseDate(date).getFullYear(), parseDate(date).getMonth(), 1);
    closeModal();
    renderCalendar();
    renderSidebar();
});

/* ===== 초기화 ===== */
(function init() {
    // 상단 date input 초기값을 state와 동기화
    if (selectedDateInput) selectedDateInput.value = state.selectedDate;
    renderCalendar();
    renderSidebar();
})();
