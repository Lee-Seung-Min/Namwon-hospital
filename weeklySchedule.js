// 가짜 환자 데이터 (09:00 ~ 18:00, 30분 단위)
const patients = {
    "김환자": { time: "09:00", dept: "내과", symptom: "감기", birth: "85.03.12", doctor: "김의사" },
    "이환자": { time: "09:30", dept: "정형외과", symptom: "무릎 통증", birth: "78.07.22", doctor: "이의사" },
    "박환자": { time: "10:00", dept: "피부과", symptom: "알레르기", birth: "92.11.05", doctor: "박의사" },
    "최환자": { time: "10:30", dept: "이비인후과", symptom: "목 통증", birth: "88.02.18", doctor: "최의사" },
    "정환자": { time: "11:00", dept: "소아과", symptom: "열", birth: "15.06.09", doctor: "정의사" },
    "오환자": { time: "11:30", dept: "내과", symptom: "두통", birth: "99.09.30", doctor: "김의사" },
    "윤환자": { time: "12:00", dept: "정신건강의학과", symptom: "불안", birth: "90.01.14", doctor: "윤의사" },
    "배환자": { time: "12:30", dept: "안과", symptom: "시력 저하", birth: "65.05.21", doctor: "배의사" },
    "임환자": { time: "13:00", dept: "치과", symptom: "충치", birth: "02.12.02", doctor: "임의사" },
    "장환자": { time: "13:30", dept: "정형외과", symptom: "허리 통증", birth: "75.08.11", doctor: "이의사" },
    "강환자": { time: "14:00", dept: "내과", symptom: "소화불량", birth: "83.04.07", doctor: "김의사" },
    "한환자": { time: "14:30", dept: "피부과", symptom: "아토피", birth: "10.10.19", doctor: "박의사" },
    "송환자": { time: "15:00", dept: "신경외과", symptom: "편두통", birth: "95.12.25", doctor: "송의사" },
    "허환자": { time: "15:30", dept: "외과", symptom: "위장 통증", birth: "87.03.03", doctor: "허의사" },
    "고환자": { time: "16:00", dept: "내과", symptom: "혈압 검사", birth: "59.09.15", doctor: "김의사" },
    "문환자": { time: "16:30", dept: "정형외과", symptom: "어깨 통증", birth: "72.01.29", doctor: "이의사" },
    "심환자": { time: "17:00", dept: "소아과", symptom: "기침", birth: "18.07.12", doctor: "정의사" },
    "류환자": { time: "17:30", dept: "피부과", symptom: "여드름", birth: "06.06.28", doctor: "박의사" },
    "노환자": { time: "18:00", dept: "내과", symptom: "체력 저하", birth: "48.02.14", doctor: "김의사" }
};

// 환자 상세보기
function showDetail(name) {
    const detail = patients[name];
    if (!detail) return;
    document.getElementById("appointment-detail").innerHTML = `
        <div class="bg-white p-4 rounded-lg border border-neutral-200">
            <div class="flex items-center justify-between mb-2">
                <span class="text-neutral-900">${name}</span>
                <span class="text-sm text-neutral-500">${detail.time}</span>
            </div>
            <div class="text-sm text-neutral-600 space-y-1 cursor-pointer" onclick="location.href='detailAppointment.html'">
                <div>${detail.birth}</div>
                <div>진료과: ${detail.dept}</div>
                <div>담당의: ${detail.doctor}</div>
                <div>증상: ${detail.symptom}</div>
            </div>
        </div>
    `;
}

// 시간표를 자동 생성 (09:00~18:00, 30분 단위)
// 시간표 생성
function renderTimetable() {
    const timetable = document.getElementById("timetable");
    let html = `<div class="grid grid-cols-8 min-w-[900px]">`;

    // 헤더
    const days = ["시간","월","화","수","목","금","토","일"];
    days.forEach(d => {
        html += `<div class="p-2 border-r border-b border-neutral-200 bg-neutral-100 text-center">${d}</div>`;
    });

    // 시간 슬롯
    const times = [];
    for (let h=9; h<=18; h++) {
        times.push(`${String(h).padStart(2,"0")}:00`);
        if (h !== 18) times.push(`${String(h).padStart(2,"0")}:30`);
    }

    times.forEach(t => {
        html += `<div class="p-2 border-r border-b border-neutral-200 text-sm text-neutral-500">${t}</div>`;
        for (let i=0; i<7; i++) {
            html += `<div class="p-2 border-r border-b border-neutral-200">`;

            // 이 시간에 해당하는 환자 찾기
            const patient = Object.entries(patients).find(([name, data]) => data.time === t);

            // 있으면 무작위 요일 배정
            if (patient) {
                const assignedDay = patient[1].day ?? Math.floor(Math.random() * 7); // 0~6
                patient[1].day = assignedDay; // 한번 정하면 유지

                if (i === assignedDay) {
                    html += `
                        <div class="text-xs bg-neutral-200 px-2 py-1 rounded cursor-pointer" onclick="showDetail('${patient[0]}')">
                            <div class="font-medium">${patient[0]}</div>
                            <div class="text-neutral-600">${patient[1].doctor}</div>
                        </div>
                    `;
                }
            }

            html += `</div>`;
        }
    });

    html += `</div>`;
    timetable.innerHTML = html;
}


// 초기 실행
renderTimetable();
