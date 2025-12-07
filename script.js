/* --- DATABASE INIT --- */
const initialData = {
    feeStructure: {
        dept: { CSE: 50000, ECE: 50000, MECH: 45000, CIVIL: 45000, EEE: 48000 },
        hostel: 40000,
        bus: 20000
    },
    students: [
        { roll: "21CSE101", name: "Alice Johnson", dept: "CSE", cat: "Hosteler", trans: "N/A", cgpa: 9.2, due: 0, password: "123", alerts: [] },
        { roll: "21ECE205", name: "Bob Smith", dept: "ECE", cat: "Day Scholar", trans: "Bus", cgpa: 8.5, due: 20000, password: "123", alerts: [] },
        { roll: "21MEC302", name: "Charlie Brown", dept: "MECH", cat: "Day Scholar", trans: "Own", cgpa: 7.8, due: 0, password: "123", alerts: [] },
        { roll: "21CIV404", name: "David Lee", dept: "CIVIL", cat: "Hosteler", trans: "N/A", cgpa: 6.5, due: 90000, password: "123", alerts: [] },
        { roll: "21EEE505", name: "Eva Green", dept: "EEE", cat: "Day Scholar", trans: "Bus", cgpa: 8.9, due: 5000, password: "123", alerts: [] }
    ],
    faculty: [
        { user: "prof_cse", pass: "123", dept: "CSE" },
        { user: "prof_ece", pass: "123", dept: "ECE" }
    ],
    appeals: [
        { id: 1, roll: "21CSE101", msg: "Recheck Math Midterm", status: "PENDING" }
    ],
    logs: [
        { time: new Date().toLocaleString(), action: "System Initialized" }
    ]
};

function loadDB() {
    if (!localStorage.getItem('unitrack_db_final_v6')) {
        localStorage.setItem('unitrack_db_final_v6', JSON.stringify(initialData));
    }
    return JSON.parse(localStorage.getItem('unitrack_db_final_v6'));
}

function saveDB(db) {
    localStorage.setItem('unitrack_db_final_v6', JSON.stringify(db));
}

function logAction(action) {
    const db = loadDB();
    db.logs.unshift({ time: new Date().toLocaleString(), action: action });
    saveDB(db);
}

/* --- AUTH STATE --- */
let currentUser = null; 
let activeTab = 'admin';

function switchRole(role) {
    activeTab = role;
    document.querySelectorAll('.role-btn').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
    
    // Auto-fill & Theme
    document.body.className = `theme-${role}`;
    const u = document.getElementById('loginUser');
    const p = document.getElementById('loginPass');
    if (role === 'admin') { u.value = 'admin'; p.value = 'admin123'; }
    else if (role === 'faculty') { u.value = 'prof_cse'; p.value = '123'; }
    else if (role === 'student') { u.value = '21CSE101'; p.value = '123'; }
}

function handleLogin(e) {
    e.preventDefault();
    const u = document.getElementById('loginUser').value.trim();
    const p = document.getElementById('loginPass').value.trim();
    const db = loadDB();
    const err = document.getElementById('loginError');

    if (activeTab === 'admin') {
        if (u === 'admin' && p === 'admin123') {
            currentUser = { role: 'admin', name: "Administrator" };
            enterApp();
        } else err.innerText = "Invalid Admin Credentials";
    } else if (activeTab === 'faculty') {
        const fac = db.faculty.find(f => f.user === u && f.pass === p);
        if (fac) {
            currentUser = { role: 'faculty', ...fac, name: "Prof. " + fac.dept };
            enterApp();
        } else err.innerText = "Invalid Faculty Credentials";
    } else if (activeTab === 'student') {
        const stu = db.students.find(s => s.roll === u && s.password === p);
        if (stu) {
            currentUser = { role: 'student', ...stu };
            enterApp();
        } else err.innerText = "Invalid Student Credentials";
    }
}

function enterApp() {
    document.getElementById('auth-container').classList.add('hidden');
    document.getElementById('main-app').classList.remove('hidden');
    document.getElementById('userNameDisplay').innerText = currentUser.name;
    document.getElementById('userRoleDisplay').innerText = currentUser.role.toUpperCase();
    document.getElementById('userDeptDisplay').innerText = currentUser.dept || (currentUser.role === 'admin' ? 'System' : currentUser.roll);
    document.getElementById('userAvatar').innerText = currentUser.name[0];
    
    renderSidebar();
    if(currentUser.role === 'admin') renderAdminDashboard();
    else if(currentUser.role === 'faculty') renderFacultyDashboard();
    else renderStudentDashboard();
}

function logout() { location.reload(); }
function showToast(msg) { const t = document.getElementById('toast'); t.innerText = msg; t.classList.remove('hidden'); setTimeout(() => t.classList.add('hidden'), 3000); }
function openModal(id) { document.getElementById(id).classList.remove('hidden'); }
function closeModal(id) { document.getElementById(id).classList.add('hidden'); }

/* --- NAVIGATION --- */
const Icons = {
    dash: '📊', chart: '📈', users: '👥', plus: '➕', money: '💰', fac: '👨‍🏫', log: '📝', db: '💾', star: '⭐', mail: '📩'
};

function renderSidebar() {
    const nav = document.getElementById('sidebarNav');
    const bottomNav = document.getElementById('sidebarBottomNav');
    nav.innerHTML = ''; bottomNav.innerHTML = '';

    const menuItems = {
        admin: [
            { icon: Icons.dash, text: 'Overview', action: renderAdminDashboard, section: 'top' },
            { icon: Icons.chart, text: 'Analysis', action: renderAdminAnalysisHub, section: 'top' },
            { icon: Icons.users, text: 'All Students', action: renderAllStudents, section: 'top' },
            { icon: Icons.plus, text: 'Add Student', action: renderAddStudent, section: 'top' },
            { icon: Icons.money, text: 'Finances', action: renderAdminFinance, section: 'top' },
            { icon: Icons.fac, text: 'Manage Faculty', action: renderManageFaculty, section: 'top' },
            { icon: Icons.log, text: 'Action Log', action: renderActionLogs, section: 'bottom' },
            { icon: Icons.db, text: 'Data Backup', action: renderBackup, section: 'bottom' }
        ],
        faculty: [
            { icon: Icons.dash, text: 'Class Gradebook', action: renderFacultyDashboard, section: 'top' },
            { icon: Icons.star, text: 'Class Analysis', action: renderFacultyClassAnalysis, section: 'top' },
            { icon: Icons.mail, text: 'Appeals Inbox', action: renderFacultyAppeals, section: 'top' }
        ],
        student: [
            { icon: Icons.users, text: 'My Profile', action: renderStudentDashboard, section: 'top' },
            { icon: Icons.money, text: 'Fee Status', action: renderStudentFees, section: 'top' },
            { icon: Icons.mail, text: 'Academic Appeals', action: renderStudentAppeals, section: 'top' }
        ]
    };

    menuItems[currentUser.role].forEach((item, index) => {
        const btn = document.createElement('button');
        btn.className = 'nav-item' + (index === 0 && item.section === 'top' ? ' active' : '');
        btn.innerHTML = `<span>${item.icon}</span> ${item.text}`;
        btn.onclick = () => {
            document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            item.action();
        };
        (item.section === 'bottom' ? bottomNav : nav).appendChild(btn);
    });
}

/* ================= ADMIN FEATURES ================= */
function renderAdminDashboard() {
    const db = loadDB();
    const total = db.students.length;
    const hostelers = db.students.filter(s => s.cat === 'Hosteler').length;
    const highDue = db.students.filter(s => s.due > 50000).length;
    
    document.getElementById('pageTitle').innerText = "Overview";
    document.getElementById('contentArea').innerHTML = `
        <div class="stats-grid">
            <div class="stat-card"><div class="stat-label">Total Enrollment</div><div class="stat-val">${total}</div></div>
            <div class="stat-card"><div class="stat-label">Hostel Residents</div><div class="stat-val" style="color:var(--primary)">${hostelers}</div></div>
            <div class="stat-card"><div class="stat-label">High Defaulters</div><div class="stat-val" style="color:var(--danger)">${highDue}</div></div>
        </div>
        <div style="background:white; padding:24px; border-radius:16px; border:1px solid var(--border)">
            <h3>Welcome Administrator</h3>
            <p class="text-muted" style="margin-top:5px">Select a module from the sidebar to begin managing the university resources.</p>
        </div>
    `;
}

function renderAdminAnalysisHub() {
    document.getElementById('pageTitle').innerText = "Analysis Hub";
    document.getElementById('contentArea').innerHTML = `
        <div class="analysis-hub">
            <div class="hub-card" onclick="renderAdminFinancials()"><div class="hub-icon">💰</div><div class="hub-title">Financial Analysis</div><div class="hub-desc">Revenue & Defaulters</div></div>
            <div class="hub-card" onclick="renderAdminAcademics()"><div class="hub-icon">🎓</div><div class="hub-title">Academic Analysis</div><div class="hub-desc">Department Performance</div></div>
            <div class="hub-card" onclick="renderAdminLogistics()"><div class="hub-icon">🚌</div><div class="hub-title">Logistical Analysis</div><div class="hub-desc">Hostel & Transport Stats</div></div>
        </div>`;
}

function renderAdminFinancials() {
    const db = loadDB();
    let totalDue = 0;
    const highDefaulters = db.students.filter(s => parseFloat(s.due) > 50000);
    db.students.forEach(s => totalDue += parseFloat(s.due));

    let rows = highDefaulters.map(s => `<tr><td>${s.roll}</td><td>${s.name}</td><td><span class="badge bg-red">$${s.due}</span></td><td><button class="btn-primary btn-sm" onclick="sendAlert('${s.roll}')">Alert</button></td></tr>`).join('');

    document.getElementById('contentArea').innerHTML = `
        <button class="btn-secondary" onclick="renderAdminAnalysisHub()" style="margin-bottom:20px">← Back</button>
        <div class="stats-grid">
            <div class="stat-card"><div class="stat-label">Total Outstanding</div><div class="stat-val" style="color:var(--danger)">$${totalDue}</div></div>
            <div class="stat-card"><div class="stat-label">Defaulters >50k</div><div class="stat-val">${highDefaulters.length}</div></div>
        </div>
        <h3>High Value Defaulters</h3>
        <div class="data-table-container"><table><thead><tr><th>Roll</th><th>Name</th><th>Due</th><th>Action</th></tr></thead><tbody>${rows || '<tr><td colspan="4">No high defaulters.</td></tr>'}</tbody></table></div>`;
}

function sendAlert(roll) {
    const db = loadDB();
    const s = db.students.find(x => x.roll === roll);
    if (!s.alerts) s.alerts = [];
    s.alerts.push({ msg: "Urgent: Please clear your pending dues > 50k", date: new Date().toLocaleDateString() });
    saveDB(db); logAction(`Alert sent to ${roll}`); showToast("Alert Sent");
}

function renderAdminAcademics() {
    const db = loadDB();
    const deptStats = {};
    db.students.forEach(s => {
        if(!deptStats[s.dept]) deptStats[s.dept] = { sum: 0, count: 0, max: 0, topper: 'None' };
        if(s.cgpa > 0) {
            deptStats[s.dept].sum += parseFloat(s.cgpa);
            deptStats[s.dept].count++;
            if(parseFloat(s.cgpa) > deptStats[s.dept].max) { deptStats[s.dept].max = s.cgpa; deptStats[s.dept].topper = s.name; }
        }
    });
    let rows = "";
    for(const d in deptStats) {
        const stats = deptStats[d];
        const avg = stats.count ? (stats.sum / stats.count).toFixed(2) : 0;
        rows += `<tr><td>${d}</td><td>${stats.count}</td><td>${stats.topper} (${stats.max})</td><td><strong>${avg}</strong></td></tr>`;
    }
    document.getElementById('contentArea').innerHTML = `<button class="btn-secondary" onclick="renderAdminAnalysisHub()" style="margin-bottom:20px">← Back</button><h3>Department Statistics</h3><div class="data-table-container"><table><thead><tr><th>Department</th><th>Graded</th><th>Topper</th><th>Avg CGPA</th></tr></thead><tbody>${rows}</tbody></table></div>`;
}

// LOGISTICS (Detailed Lists)
function renderAdminLogistics() {
    const db = loadDB();
    const hostelers = db.students.filter(s => s.cat === 'Hosteler');
    const bus = db.students.filter(s => s.trans === 'Bus');
    const own = db.students.filter(s => s.trans === 'Own');

    // Helper to generate lists
    const genList = (arr) => arr.map(s => `<div class="student-list-item">${s.name} (${s.roll})</div>`).join('') || '<div class="student-list-item" style="color:#999">Empty</div>';

    document.getElementById('contentArea').innerHTML = `
        <button class="btn-secondary" onclick="renderAdminAnalysisHub()" style="margin-bottom:20px">← Back</button>
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-label">Hostel Residents (${hostelers.length})</div>
                <div class="student-list-box">${genList(hostelers)}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Bus Users (${bus.length})</div>
                <div class="student-list-box">${genList(bus)}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Own Transport (${own.length})</div>
                <div class="student-list-box">${genList(own)}</div>
            </div>
        </div>
    `;
}

// FINANCE CONTROL (Full Split & Sort)
function renderAdminFinance() {
    const db = loadDB();
    const f = db.feeStructure;
    let feeGrid = "";
    for(let d in f.dept) feeGrid += `<div class="fee-box"><small>${d}</small><div>$${f.dept[d]}</div></div>`;
    feeGrid += `<div class="fee-box"><small>Hostel</small><div>$${f.hostel}</div></div><div class="fee-box"><small>Bus</small><div>$${f.bus}</div></div>`;

    document.getElementById('pageTitle').innerText = "Finance Control";
    document.getElementById('contentArea').innerHTML = `
        <div class="stat-card" style="margin-bottom:30px">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px"><h3>Current Fee Structure</h3><button class="btn-secondary" onclick="openFeeSettings()">⚙️ Edit Base Fees</button></div>
            <div class="fee-grid" style="display:grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap:10px">${feeGrid}</div>
        </div>
        <div class="controls-row">
            <input type="text" id="finSearch" placeholder="Search Student..." onkeyup="updateFinanceTable()">
            <select class="sort-dropdown" id="finSort" onchange="updateFinanceTable()">
                <option value="none">Sort By...</option>
                <option value="asc">Due: Low to High</option>
                <option value="desc">Due: High to Low</option>
            </select>
        </div>
        <div class="data-table-container"><table><thead><tr><th>Roll</th><th>Name</th><th>Total Fee</th><th>Paid (Acad)</th><th>Paid (Log)</th><th>Due</th><th>Action</th></tr></thead><tbody id="finTableBody"></tbody></table></div>
    `;
    updateFinanceTable();
}

function updateFinanceTable() {
    const db = loadDB();
    const f = db.feeStructure;
    const filter = document.getElementById('finSearch').value.toLowerCase();
    const sort = document.getElementById('finSort').value;
    
    let data = db.students.filter(s => s.name.toLowerCase().includes(filter) || s.roll.toLowerCase().includes(filter));
    if(sort === 'asc') data.sort((a,b) => a.due - b.due);
    if(sort === 'desc') data.sort((a,b) => b.due - a.due);

    const rows = data.map(s => {
        let acadFee = f.dept[s.dept] || 50000;
        let logFee = s.cat === 'Hosteler' ? f.hostel : (s.trans === 'Bus' ? f.bus : 0);
        let total = acadFee + logFee;
        let paid = total - s.due;
        let paidAcad = paid > acadFee ? acadFee : paid;
        let paidLog = paid > acadFee ? (paid - acadFee) : 0;
        
        return `<tr><td>${s.roll}</td><td>${s.name}</td><td>$${total}</td><td>$${paidAcad}</td><td>$${paidLog}</td><td><span class="badge ${s.due>0?'bg-red':'bg-green'}">$${s.due}</span></td><td><button class="btn-primary btn-sm" onclick="openFinanceModal('${s.roll}')">Manage</button></td></tr>`;
    }).join('');
    document.getElementById('finTableBody').innerHTML = rows;
}

function openFinanceModal(roll) {
    const db = loadDB();
    const s = db.students.find(x => x.roll === roll);
    document.getElementById('finActionName').innerText = `Action for ${s.name}`;
    document.getElementById('finActionRoll').value = roll;
    openModal('modalFinanceAction');
}

function submitFinanceAction(type) {
    const roll = document.getElementById('finActionRoll').value;
    const amt = parseFloat(document.getElementById('finActionAmount').value);
    if (!amt || amt < 0) return alert("Invalid Amount");
    const db = loadDB();
    const s = db.students.find(x => x.roll === roll);
    if (type === 'pay') s.due -= amt; else s.due += amt;
    saveDB(db); logAction(`Finance: ${type} $${amt} for ${roll}`); closeModal('modalFinanceAction'); updateFinanceTable(); showToast("Updated");
}

function openFeeSettings() {
    const db = loadDB();
    const f = db.feeStructure;
    document.getElementById('feeCSE').value = f.dept.CSE;
    document.getElementById('feeECE').value = f.dept.ECE;
    document.getElementById('feeMECH').value = f.dept.MECH;
    document.getElementById('feeCIVIL').value = f.dept.CIVIL;
    document.getElementById('feeEEE').value = f.dept.EEE;
    document.getElementById('feeHostel').value = f.hostel;
    document.getElementById('feeBus').value = f.bus;
    openModal('modalFeeSettings');
}

function saveFeeSettings() {
    const db = loadDB();
    db.feeStructure.dept.CSE = parseFloat(document.getElementById('feeCSE').value);
    db.feeStructure.dept.ECE = parseFloat(document.getElementById('feeECE').value);
    db.feeStructure.dept.MECH = parseFloat(document.getElementById('feeMECH').value);
    db.feeStructure.dept.CIVIL = parseFloat(document.getElementById('feeCIVIL').value);
    db.feeStructure.dept.EEE = parseFloat(document.getElementById('feeEEE').value);
    db.feeStructure.hostel = parseFloat(document.getElementById('feeHostel').value);
    db.feeStructure.bus = parseFloat(document.getElementById('feeBus').value);
    saveDB(db); closeModal('modalFeeSettings'); 
    renderAdminFinance(); // Refresh grid immediately
    showToast("Fees Updated");
}

// ALL STUDENTS (SORT BUTTON)
function renderAllStudents() {
    document.getElementById('pageTitle').innerText = "Student Directory";
    document.getElementById('contentArea').innerHTML = `
        <div class="controls-row">
            <input type="text" id="stuSearch" placeholder="Search name or roll..." onkeyup="updateStudentTable()">
            <select class="sort-dropdown" id="stuSort" onchange="updateStudentTable()">
                <option value="roll">Sort: Roll No</option>
                <option value="name">Sort: Name</option>
                <option value="cgpa">Sort: CGPA</option>
                <option value="due">Sort: Dues</option>
            </select>
        </div>
        <div class="data-table-container"><table><thead><tr><th>Roll</th><th>Name</th><th>Dept</th><th>CGPA</th><th>Dues</th><th>Action</th></tr></thead><tbody id="stuTableBody"></tbody></table></div>
    `;
    updateStudentTable();
}

function updateStudentTable() {
    const db = loadDB();
    const filter = document.getElementById('stuSearch').value.toLowerCase();
    const sort = document.getElementById('stuSort').value;
    let data = db.students.filter(s => s.name.toLowerCase().includes(filter) || s.roll.toLowerCase().includes(filter));
    
    data.sort((a, b) => {
        if(sort === 'roll') return a.roll.localeCompare(b.roll);
        if(sort === 'name') return a.name.localeCompare(b.name);
        if(sort === 'cgpa') return b.cgpa - a.cgpa;
        if(sort === 'due') return b.due - a.due;
    });

    const rows = data.map(s => `<tr><td>${s.roll}</td><td><strong>${s.name}</strong></td><td><span class="badge bg-blue">${s.dept}</span></td><td>${s.cgpa}</td><td>${s.due > 0 ? `<span class="badge bg-red">$${s.due}</span>` : `<span class="badge bg-green">Paid</span>`}</td><td><button class="btn-secondary btn-sm" onclick="openEditStudent('${s.roll}')">Edit</button><button class="btn-danger btn-sm" onclick="deleteStudent('${s.roll}')" style="margin-left:5px">Del</button></td></tr>`).join('');
    document.getElementById('stuTableBody').innerHTML = rows;
}

// ... (Rest of Admin Functions: openEditStudent, submitStudentEdit, deleteStudent, renderAddStudent, handleAddStudent, renderManageFaculty, saveFacultyFromModal, deleteFaculty, renderActionLogs, renderBackup, downloadBackup - Same as previous) ...

function openEditStudent(roll) {
    const db = loadDB();
    const s = db.students.find(x => x.roll === roll);
    document.getElementById('editStuRoll').value = s.roll;
    document.getElementById('editStuName').value = s.name;
    document.getElementById('editStuPass').value = s.password;
    openModal('modalStudent');
}

function submitStudentEdit() {
    const roll = document.getElementById('editStuRoll').value;
    const db = loadDB();
    const s = db.students.find(x => x.roll === roll);
    s.name = document.getElementById('editStuName').value;
    s.password = document.getElementById('editStuPass').value;
    saveDB(db);
    logAction(`Admin edited student ${roll}`);
    closeModal('modalStudent');
    renderAllStudents();
    showToast("Changes Saved");
}

function deleteStudent(roll) {
    if(!confirm("Permanently delete this record?")) return;
    const db = loadDB();
    db.students = db.students.filter(s => s.roll !== roll);
    saveDB(db);
    renderAllStudents();
    showToast("Record Deleted");
}

function renderAddStudent() {
    document.getElementById('pageTitle').innerText = "New Admission";
    document.getElementById('contentArea').innerHTML = `
        <div class="stat-card" style="max-width:700px; margin:0 auto">
            <form onsubmit="handleAddStudent(event)">
                <div class="form-grid">
                    <div class="input-group"><label>Roll No</label><input id="newRoll" required placeholder="e.g. 21CSE105"></div>
                    <div class="input-group"><label>Full Name</label><input id="newName" required></div>
                    <div class="input-group"><label>Department</label><select id="newDept"><option>CSE</option><option>ECE</option><option>MECH</option><option>CIVIL</option><option>EEE</option></select></div>
                    <div class="input-group"><label>Category</label><select id="newCat" onchange="toggleTransport()"><option>Hosteler</option><option>Day Scholar</option></select></div>
                    <div class="input-group hidden" id="transDiv"><label>Transport</label><select id="newTrans"><option>Bus</option><option>Own</option></select></div>
                </div>
                <button type="submit" class="btn-primary full-width">Admit Student</button>
            </form>
        </div>`;
}

function toggleTransport() {
    const cat = document.getElementById('newCat').value;
    const div = document.getElementById('transDiv');
    if(cat === 'Day Scholar') div.classList.remove('hidden'); else div.classList.add('hidden');
}

function handleAddStudent(e) {
    e.preventDefault();
    const db = loadDB();
    const fees = db.feeStructure;
    const dept = document.getElementById('newDept').value;
    const cat = document.getElementById('newCat').value;
    const trans = document.getElementById('newTrans').value;
    
    let total = fees.dept[dept];
    if(cat === 'Hosteler') total += fees.hostel;
    else if(trans === 'Bus') total += fees.bus;

    const s = {
        roll: document.getElementById('newRoll').value, name: document.getElementById('newName').value,
        dept: dept, cat: cat, trans: cat==='Hosteler'?'N/A':trans,
        cgpa: 0, due: total, password: "123", alerts: []
    };
    if(db.students.find(x => x.roll === s.roll)) return alert("Roll Number Exists!");
    db.students.push(s); saveDB(db); showToast("Student Admitted"); renderAllStudents();
}

function renderManageFaculty() {
    const db = loadDB();
    document.getElementById('pageTitle').innerText = "Faculty Management";
    const rows = db.faculty.map(f => `<tr><td>${f.user}</td><td><span class="badge bg-blue">${f.dept}</span></td><td>${f.pass}</td><td><button class="btn-danger btn-sm" onclick="deleteFaculty('${f.user}')">Remove</button></td></tr>`).join('');
    document.getElementById('contentArea').innerHTML = `<button class="btn-primary" onclick="openModal('modalFaculty')" style="margin-bottom:20px">+ Add Faculty</button><div class="data-table-container"><table><thead><tr><th>Username</th><th>Department</th><th>Password</th><th>Action</th></tr></thead><tbody>${rows}</tbody></table></div>`;
}

function saveFacultyFromModal() {
    const user = document.getElementById('modFacUser').value;
    const dept = document.getElementById('modFacDept').value;
    const pass = document.getElementById('modFacPass').value;
    if(!user) return;
    const db = loadDB();
    if(db.faculty.find(f => f.user === user)) return alert("Username exists");
    db.faculty.push({ user, pass, dept });
    saveDB(db);
    closeModal('modalFaculty');
    renderManageFaculty();
    showToast("Faculty Created");
}

function deleteFaculty(user) {
    if(!confirm("Remove faculty?")) return;
    const db = loadDB();
    db.faculty = db.faculty.filter(f => f.user !== user);
    saveDB(db);
    renderManageFaculty();
}

function renderActionLogs() {
    const db = loadDB();
    document.getElementById('pageTitle').innerText = "System Audit Logs";
    const logs = db.logs.map(l => `<div class="log-item"><div class="log-time">[${l.time}]</div><div class="log-action">${l.action}</div></div>`).join('');
    document.getElementById('contentArea').innerHTML = `<div class="log-container">${logs}</div>`;
}

function renderBackup() {
    document.getElementById('pageTitle').innerText = "Data Management";
    document.getElementById('contentArea').innerHTML = `<div class="stat-card" style="text-align:center; max-width:500px; margin:0 auto"><h3>Backup Database</h3><p class="text-muted" style="margin:10px 0 20px">Download JSON backup.</p><button class="btn-primary full-width" onclick="downloadBackup()">Download</button></div>`;
}

function downloadBackup() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(localStorage.getItem('unitrack_db_final_v5'));
    const anchor = document.createElement('a');
    anchor.setAttribute("href", dataStr);
    anchor.setAttribute("download", "unitrack_backup.json");
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
}

/* ================= FACULTY & STUDENT ================= */
function renderFacultyDashboard() {
    const db = loadDB();
    const myStudents = db.students.filter(s => s.dept === currentUser.dept);
    document.getElementById('pageTitle').innerText = `Class: ${currentUser.dept}`;
    let rows = myStudents.map(s => `<tr><td>${s.roll}</td><td>${s.name}</td><td>${s.cgpa}</td><td><button class="btn-primary btn-sm" onclick="openUpdateMark('${s.roll}', '${s.name}')">Update</button></td></tr>`).join('');
    document.getElementById('contentArea').innerHTML = `<div class="data-table-container"><table><thead><tr><th>Roll</th><th>Name</th><th>CGPA</th><th>Action</th></tr></thead><tbody>${rows}</tbody></table></div>`;
}

function openUpdateMark(roll, name) {
    document.getElementById('markRoll').value = roll;
    document.getElementById('markStudentName').innerText = name;
    openModal('modalMarks');
}

function submitMarkUpdate() {
    const val = parseFloat(document.getElementById('newMark').value);
    if(val < 0 || val > 10 || isNaN(val)) return alert("CGPA must be between 0 and 10");
    const db = loadDB();
    const s = db.students.find(x => x.roll === document.getElementById('markRoll').value);
    s.cgpa = val;
    saveDB(db);
    logAction(`Faculty updated ${s.roll} CGPA`);
    closeModal('modalMarks');
    renderFacultyDashboard();
    showToast("Grades Updated");
}

function renderFacultyClassAnalysis() {
    const db = loadDB();
    const myStudents = db.students.filter(s => s.dept === currentUser.dept);
    const scores = myStudents.map(s => parseFloat(s.cgpa)).filter(n => n > 0);
    const avg = scores.length ? (scores.reduce((a,b)=>a+b,0)/scores.length).toFixed(2) : 0;
    const max = Math.max(...scores);
    const topper = myStudents.find(s => parseFloat(s.cgpa) == max && max > 0);
    const weak = myStudents.filter(s => parseFloat(s.cgpa) < 7.0 && s.cgpa > 0);
    let weakList = weak.map(s => `<li>${s.name} (${s.cgpa})</li>`).join('');

    document.getElementById('pageTitle').innerText = `Analysis: ${currentUser.dept}`;
    document.getElementById('contentArea').innerHTML = `<div class="stats-grid"><div class="stat-card"><div class="stat-label">Class Average</div><div class="stat-val">${avg}</div></div><div class="stat-card"><div class="stat-label">Topper</div><div class="stat-val" style="color:var(--success)">${topper ? topper.name : 'N/A'}</div></div></div><div class="stat-card" style="margin-top:20px"><h4 style="color:var(--danger)">Needs Improvement (< 7.0)</h4><ul>${weakList || '<li>No students below 7.0</li>'}</ul></div>`;
}

function renderFacultyAppeals() {
    const db = loadDB();
    const appeals = db.appeals.filter(a => a.status === 'PENDING');
    document.getElementById('pageTitle').innerText = "Appeal Inbox";
    const html = appeals.map(a => {
        const studentName = db.students.find(s => s.roll === a.roll)?.name || "Unknown";
        return `<div class="appeal-item"><div><div class="appeal-header"><strong>${studentName}</strong> (${a.roll})</div><div class="appeal-body">${a.msg}</div></div><div class="appeal-actions"><button class="btn-primary btn-sm" style="background:var(--success)" onclick="resolveAppeal(${a.id}, 'ACCEPTED')">Accept</button><button class="btn-danger btn-sm" onclick="resolveAppeal(${a.id}, 'REJECTED')">Reject</button></div></div>`;
    }).join('');
    document.getElementById('contentArea').innerHTML = html || "<p class='text-muted'>No pending appeals.</p>";
}

function resolveAppeal(id, status) {
    const db = loadDB();
    const a = db.appeals.find(x => x.id === id);
    a.status = status;
    saveDB(db);
    renderFacultyAppeals();
    showToast(`Appeal ${status}`);
}

/* ================= STUDENT FEATURES ================= */
function renderStudentDashboard() {
    const db = loadDB();
    const me = db.students.find(s => s.roll === currentUser.roll);
    let alertHtml = "";
    if(me.alerts && me.alerts.length > 0) alertHtml = me.alerts.map(a => `<div style="background:#fee2e2; color:#991b1b; padding:12px; border-radius:8px; margin-top:15px">🔔 ${a.msg}</div>`).join('');

    document.getElementById('pageTitle').innerText = "My Profile";
    document.getElementById('contentArea').innerHTML = `
        <div class="stat-card" style="max-width:500px; margin:0 auto; text-align:center">
            <div class="avatar" style="width:80px; height:80px; font-size:2rem; margin:0 auto 15px">${me.name[0]}</div>
            <h2>${me.name}</h2>
            <div style="margin-top:15px; text-align:left; background:#f8fafc; padding:15px; border-radius:8px">
                <p><strong>Roll:</strong> ${me.roll}</p><p><strong>Dept:</strong> ${me.dept}</p>
                <p><strong>Status:</strong> ${me.cat}</p><p><strong>Transport:</strong> ${me.trans}</p>
                <p style="margin-top:10px"><strong>CGPA:</strong> <span style="color:var(--primary); font-weight:700">${me.cgpa}</span></p>
            </div>
            <button class="btn-secondary full-width" style="margin-top:20px" onclick="openModal('modalChangePass')">Change Password</button>
            ${alertHtml}
        </div>`;
}

function submitChangePass() {
    const curr = document.getElementById('currPass').value;
    const newP = document.getElementById('newPass').value;
    const db = loadDB();
    const me = db.students.find(s => s.roll === currentUser.roll);
    if(me.password !== curr) return alert("Current Password Wrong");
    me.password = newP;
    saveDB(db);
    closeModal('modalChangePass');
    showToast("Password Changed");
}

function renderStudentFees() {
    const db = loadDB();
    const me = db.students.find(s => s.roll === currentUser.roll);
    const f = db.feeStructure;
    let acadFee = f.dept[me.dept];
    let logFee = me.cat === 'Hosteler' ? f.hostel : (me.trans === 'Bus' ? f.bus : 0);
    
    document.getElementById('pageTitle').innerText = "Fee Status";
    document.getElementById('contentArea').innerHTML = `
        <div class="stat-card" style="max-width:500px; margin:0 auto;">
            <div class="fee-grid"><div class="fee-box"><small>Academic Fee</small><div>$${acadFee}</div></div><div class="fee-box"><small>Logistics Fee</small><div>$${logFee}</div></div></div>
            <hr style="margin:20px 0; border:0; border-top:1px solid var(--border)">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;"><h3>Total Due</h3><h2 style="color:${me.due > 0 ? 'var(--danger)' : 'var(--success)'}">$${me.due}</h2></div>
            ${me.due > 0 ? `<button class="btn-primary full-width" onclick="openStudentPay('${me.due}')">Pay Now</button>` : `<div class="badge bg-green" style="width:100%; text-align:center; padding:12px; font-size:1rem">Fully Paid</div>`}
        </div>`;
}

function openStudentPay(due) {
    document.getElementById('stuPayTotal').innerText = '$'+due;
    document.getElementById('stuPayAmount').value = '';
    openModal('modalStudentPay');
}

function submitStudentPay() {
    const amt = parseFloat(document.getElementById('stuPayAmount').value);
    const db = loadDB();
    const me = db.students.find(s => s.roll === currentUser.roll);
    if(!amt || amt <= 0 || amt > me.due) return alert("Invalid Amount");
    me.due -= amt;
    saveDB(db);
    logAction(`Student ${me.roll} paid $${amt}`);
    closeModal('modalStudentPay');
    renderStudentFees();
    showToast("Payment Successful");
}

function renderStudentAppeals() {
    const db = loadDB();
    const myApps = db.appeals.filter(a => a.roll === currentUser.roll);
    document.getElementById('pageTitle').innerText = "My Appeals";
    const rows = myApps.map(a => `<div class="appeal-item"><div class="appeal-body">${a.msg}</div><span class="badge bg-blue">${a.status}</span></div>`).join('');
    document.getElementById('contentArea').innerHTML = `<div style="margin-bottom:20px"><input id="appealMsg" class="input-group" placeholder="Type request..." style="width:100%; padding:10px; margin-bottom:10px"><button class="btn-primary" onclick="submitAppeal()">Submit</button></div><h3>History</h3>${rows}`;
}

function submitAppeal() {
    const msg = document.getElementById('appealMsg').value;
    if(!msg) return;
    const db = loadDB();
    db.appeals.push({ id: Date.now(), roll: currentUser.roll, msg: msg, status: 'PENDING' });
    saveDB(db);
    renderStudentAppeals();
    showToast("Appeal Sent");
}