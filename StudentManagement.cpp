/*
    Project: UniTrack ERP - Complete Student Management System
    Features:
    - Department-Specific Access for Faculty.
    - Smart "Update Marks" (Shows Class List first).
    - Full RBAC (Admin, Faculty, Student) & File Persistence.
*/

#include <iostream>
#include <fstream>
#include <vector>
#include <string>
#include <iomanip>
#include <limits>

using namespace std;

// --- DATA MODELS ---
struct Student {
    string rollNo;
    string name;
    string password;
    string dept;
    string category;
    string transport;
    float cgpa;
    double totalDue;
};

struct Faculty {
    string username;
    string password;
    string dept;
};

struct Appeal {
    int id;
    string rollNo;
    string message;
    string status;
};

// --- CONFIGURATION ---
const string FILE_STUDENTS = "unitrack_students.txt";
const string FILE_FACULTY = "unitrack_faculty.txt";
const string FILE_APPEALS = "unitrack_appeals.txt";
const string ADMIN_USER = "admin";
const string ADMIN_PASS = "admin123";

// --- UTILITY ---
void printLine() {
    cout << "--------------------------------------------------------" << endl;
}

void cleanInput() {
    if (cin.peek() == '\n') cin.ignore();
}

void pause() {
    cout << "\n[PRESS ENTER]";
    cin.get();
}

string selectDepartment() {
    int ch;
    while(true) {
        cout << "\nSelect Department:\n1. CSE\n2. ECE\n3. MECH\n4. CIVIL\n5. EEE\nChoice: ";
        cin >> ch;
        if(ch==1) return "CSE";
        if(ch==2) return "ECE";
        if(ch==3) return "MECH";
        if(ch==4) return "CIVIL";
        if(ch==5) return "EEE";
        cout << "Invalid. Try again.\n";
    }
}

// --- DATABASE HANDLER ---
class Database {
public:
    static vector<Student> loadStudents() {
        vector<Student> db;
        ifstream inFile(FILE_STUDENTS);
        if (!inFile) return db;
        Student s;
        while (inFile >> s.rollNo >> s.password >> s.dept >> s.category >> s.transport >> s.cgpa >> s.totalDue) {
            getline(inFile >> ws, s.name); 
            db.push_back(s);
        }
        return db;
    }

    static void saveStudents(const vector<Student>& db) {
        ofstream outFile(FILE_STUDENTS);
        for (const auto& s : db) {
            outFile << s.rollNo << " " << s.password << " " << s.dept << " " 
                    << s.category << " " << s.transport << " " << s.cgpa << " " << s.totalDue << " " 
                    << s.name << endl;
        }
    }

    static vector<Faculty> loadFaculty() {
        vector<Faculty> db;
        ifstream inFile(FILE_FACULTY);
        if (!inFile) return db;
        Faculty f;
        while (inFile >> f.username >> f.password >> f.dept) {
            db.push_back(f);
        }
        return db;
    }

    static void saveFaculty(const vector<Faculty>& db) {
        ofstream outFile(FILE_FACULTY);
        for (const auto& f : db) {
            outFile << f.username << " " << f.password << " " << f.dept << endl;
        }
    }

    static vector<Appeal> loadAppeals() {
        vector<Appeal> appeals;
        ifstream inFile(FILE_APPEALS);
        if (!inFile) return appeals;
        Appeal a;
        while (inFile >> a.id >> a.rollNo >> a.status) {
            getline(inFile >> ws, a.message);
            appeals.push_back(a);
        }
        return appeals;
    }

    static void saveAppeals(const vector<Appeal>& appeals) {
        ofstream outFile(FILE_APPEALS);
        for (const auto& a : appeals) {
            outFile << a.id << " " << a.rollNo << " " << a.status << " " << a.message << endl;
        }
    }

    static void addAppeal(string roll, string msg) {
        vector<Appeal> all = loadAppeals();
        int newId = all.empty() ? 1 : all.back().id + 1;
        ofstream outFile(FILE_APPEALS, ios::app);
        outFile << newId << " " << roll << " " << "PENDING" << " " << msg << endl;
    }
};

// --- MODULE 1: ADMIN ---
class AdminModule {
public:
    bool login() {
        string u, p;
        cout << "\n[ADMIN LOGIN]\nUsername: "; cin >> u;
        cout << "Password: "; cin >> p;
        return (u == ADMIN_USER && p == ADMIN_PASS);
    }

    void menu() {
        while (true) {
            cout << "\n=== ADMIN DASHBOARD ===" << endl;
            cout << "1. Add Student" << endl;
            cout << "2. Add Faculty" << endl;
            cout << "3. View All Students" << endl;
            cout << "4. Search Student" << endl;
            cout << "5. Statistics & Analysis" << endl;
            cout << "6. Manage Finances" << endl;
            cout << "7. Delete Student" << endl;
            cout << "8. Logout" << endl;
            cout << "Choice: ";
            
            int ch; 
            if (!(cin >> ch)) { cin.clear(); cleanInput(); continue; }
            cleanInput();

            if (ch == 1) addStudent();
            else if (ch == 2) addFaculty();
            else if (ch == 3) viewAll();
            else if (ch == 4) searchStudent();
            else if (ch == 5) analysisMenu();
            else if (ch == 6) manageFees();
            else if (ch == 7) deleteStudent();
            else if (ch == 8) break;
        }
    }

    void addStudent() {
        vector<Student> db = Database::loadStudents();
        Student s;
        cout << "\n--- NEW ADMISSION ---" << endl;
        cout << "Roll No: "; cin >> s.rollNo;
        for(const auto& x : db) if(x.rollNo == s.rollNo) { cout << "Error: Roll Exists!\n"; return; }
        
        cleanInput();
        cout << "Name: "; getline(cin, s.name);
        cout << "Password: "; cin >> s.password;
        s.dept = selectDepartment();

        cout << "Category (1.Hosteler 2.Day Scholar): ";
        int c; cin >> c;
        
        double hostelFee = 0, busFee = 0;
        if (c == 1) {
            s.category = "Hosteler"; s.transport = "N/A"; hostelFee = 40000;
        } else {
            s.category = "DayScholar";
            cout << "Transport (1.Bus 2.Own): ";
            int t; cin >> t;
            if(t == 1) { s.transport = "Bus"; busFee = 20000; }
            else s.transport = "Own";
        }

        s.totalDue = 50000 + hostelFee + busFee;
        s.cgpa = 0.0;

        db.push_back(s);
        Database::saveStudents(db);
        cout << ">> Admitted to " << s.dept << ". Fee: $" << s.totalDue << endl;
    }

    void addFaculty() {
        vector<Faculty> db = Database::loadFaculty();
        Faculty f;
        cout << "\n--- RECRUIT FACULTY ---" << endl;
        cout << "Username: "; cin >> f.username;
        for(const auto& x : db) if(x.username == f.username) { cout << "Error: Username Taken!\n"; return; }
        
        cout << "Password: "; cin >> f.password;
        cout << "Assign Department:";
        f.dept = selectDepartment();

        db.push_back(f);
        Database::saveFaculty(db);
        cout << ">> Faculty Registered for " << f.dept << " Department." << endl;
    }

    void viewAll() {
        vector<Student> db = Database::loadStudents();
        printLine();
        cout << left << setw(12) << "ROLL" << setw(15) << "NAME" << setw(8) << "DEPT" << setw(10) << "DUE" << endl;
        printLine();
        for (const auto& s : db) {
            cout << left << setw(12) << s.rollNo << setw(15) << s.name << setw(8) << s.dept << setw(10) << s.totalDue << endl;
        }
    }

    void searchStudent() {
        string roll; cout << "Search Roll: "; cin >> roll;
        vector<Student> db = Database::loadStudents();
        for(const auto& s : db) {
            if(s.rollNo == roll) {
                cout << "\n>> Found: " << s.name << " (" << s.dept << ")\n   CGPA: " << s.cgpa << " | Due: " << s.totalDue << endl;
                return;
            }
        }
        cout << "Not found.\n";
    }

    void analysisMenu() {
        cout << "\n1. Financial\n2. Academic\nChoice: "; int ch; cin >> ch;
        vector<Student> db = Database::loadStudents();
        if (ch == 1) {
            double totalDue = 0; int highDue = 0;
            for(const auto& s : db) { totalDue += s.totalDue; if(s.totalDue > 50000) highDue++; }
            cout << "Total Pending: $" << totalDue << " | High Defaulters: " << highDue << endl;
        } else if (ch == 2) {
            double sum = 0; int n = 0;
            for(const auto& s : db) if(s.cgpa > 0) { sum += s.cgpa; n++; }
            cout << "Avg CGPA: " << (n > 0 ? sum/n : 0.0) << endl;
        }
    }

    void manageFees() {
        string roll; cout << "Enter Roll: "; cin >> roll;
        vector<Student> db = Database::loadStudents();
        for(auto& s : db) {
            if(s.rollNo == roll) {
                cout << "Current Due: " << s.totalDue << "\n1.Add Fine 2.Pay: ";
                int op; cin >> op; double amt; cout << "Amount: "; cin >> amt;
                if(op==1) s.totalDue += amt; else s.totalDue -= amt;
                Database::saveStudents(db);
                cout << "Updated Balance: " << s.totalDue << endl;
                return;
            }
        }
        cout << "Not found.\n";
    }

    void deleteStudent() {
        string roll; cout << "Delete Roll: "; cin >> roll;
        vector<Student> db = Database::loadStudents();
        vector<Student> newDb;
        bool found = false;
        for(const auto& s : db) { if(s.rollNo != roll) newDb.push_back(s); else found = true; }
        if(found) { Database::saveStudents(newDb); cout << "Deleted.\n"; } else cout << "Not Found.\n";
    }
};

// --- MODULE 2: FACULTY ---
class FacultyModule {
    Faculty currentFaculty;
public:
    bool login() {
        string u, p;
        cout << "\n[FACULTY LOGIN]\nUsername: "; cin >> u;
        cout << "Password: "; cin >> p;
        
        vector<Faculty> db = Database::loadFaculty();
        for(const auto& f : db) {
            if(f.username == u && f.password == p) {
                currentFaculty = f;
                return true;
            }
        }
        return false;
    }

    void menu() {
        while (true) {
            cout << "\n=== FACULTY PORTAL: " << currentFaculty.dept << " ===" << endl;
            cout << "1. Update Marks" << endl;
            cout << "2. Class Analysis" << endl;
            cout << "3. Logout" << endl;
            cout << "Choice: ";
            int ch; 
            if(!(cin >> ch)) { cin.clear(); cleanInput(); continue; }
            cleanInput();

            if (ch == 1) updateMarks();
            else if (ch == 2) viewPerformance();
            else if (ch == 3) break;
        }
    }

    void updateMarks() {
        vector<Student> db = Database::loadStudents();
        
        // Step 1: List all students in this faculty's department
        cout << "\n--- STUDENTS IN " << currentFaculty.dept << " ---" << endl;
        bool foundAny = false;
        for(const auto& s : db) {
            if(s.dept == currentFaculty.dept) {
                cout << left << setw(12) << s.rollNo << setw(20) << s.name << " (Current CGPA: " << s.cgpa << ")" << endl;
                foundAny = true;
            }
        }
        
        if(!foundAny) {
            cout << "No students found in your department." << endl;
            pause(); return;
        }

        // Step 2: Ask for Roll Number
        string roll; 
        cout << "\nSelect Roll No to Grade: "; 
        cin >> roll;

        bool found = false;
        for(auto& s : db) {
            if(s.rollNo == roll) {
                // SECURITY CHECK
                if (s.dept != currentFaculty.dept) {
                    cout << "[!] ACCESS DENIED: Student belongs to " << s.dept << ".\n";
                    pause(); return;
                }
                
                cout << "Updating " << s.name << ". Enter New CGPA: ";
                cin >> s.cgpa;
                Database::saveStudents(db);
                cout << ">> Grades Saved.\n";
                found = true;
                break;
            }
        }
        if(!found) cout << "Student not found in list.\n";
        pause();
    }

    void viewPerformance() {
        vector<Student> db = Database::loadStudents();
        double sum = 0; int count = 0;
        printLine();
        cout << left << setw(12) << "ROLL" << setw(20) << "NAME" << "CGPA\n";
        printLine();
        for(const auto& s : db) {
            if (s.dept == currentFaculty.dept) {
                cout << left << setw(12) << s.rollNo << setw(20) << s.name << s.cgpa << endl;
                if(s.cgpa > 0) { sum += s.cgpa; count++; }
            }
        }
        printLine();
        cout << currentFaculty.dept << " Avg: " << (count > 0 ? (sum/count) : 0.0) << endl;
        pause();
    }
};

// --- MODULE 3: STUDENT ---
class StudentModule {
    Student currentUser;
public:
    bool login(string roll, string pass) {
        vector<Student> db = Database::loadStudents();
        for(const auto& s : db) {
            if(s.rollNo == roll && s.password == pass) {
                currentUser = s;
                return true;
            }
        }
        return false;
    }

    void menu() {
        while (true) {
            vector<Student> db = Database::loadStudents();
            for(auto& s : db) if(s.rollNo == currentUser.rollNo) currentUser = s;

            cout << "\n=== STUDENT DASHBOARD ===" << endl;
            cout << "1. My Profile" << endl;
            cout << "2. Fee Status & Payment" << endl;
            cout << "3. Submit Appeal" << endl;
            cout << "4. Logout" << endl;
            cout << "Choice: ";
            int ch; 
            if(!(cin >> ch)) { cin.clear(); cleanInput(); continue; }
            cleanInput();

            if (ch == 1) {
                printLine();
                cout << " Name: " << currentUser.name << endl;
                cout << " Roll: " << currentUser.rollNo << endl;
                cout << " Dept: " << currentUser.dept << endl;
                cout << " CGPA: " << currentUser.cgpa << endl;
                printLine();
                pause();
            }
            else if (ch == 2) {
                cout << "Pending Due: $" << currentUser.totalDue << endl;
                if(currentUser.totalDue > 0) {
                    cout << "1. Pay Now  2. Back: ";
                    int op; cin >> op;
                    if(op == 1) {
                        double amt; cout << "Amount: "; cin >> amt;
                        for(auto& s : db) if(s.rollNo == currentUser.rollNo) s.totalDue -= amt;
                        Database::saveStudents(db);
                        cout << ">> Payment Successful.\n";
                    }
                } else cout << "No dues.\n";
                pause();
            }
            else if (ch == 3) {
                string msg; cout << "Enter Message: "; getline(cin, msg);
                Database::addAppeal(currentUser.rollNo, msg);
                cout << ">> Sent to Faculty.\n";
                pause();
            }
            else if (ch == 4) break;
        }
    }
};

// --- MAIN ---
int main() {
    while (true) {
        cout << "\n===================================" << endl;
        cout << "      UNITRACK ERP SYSTEM          " << endl;
        cout << "===================================" << endl;
        cout << "1. ADMIN Login" << endl;
        cout << "2. FACULTY Login" << endl;
        cout << "3. STUDENT Login" << endl;
        cout << "4. Exit" << endl;
        cout << "Select: ";
        
        int ch; 
        if(!(cin >> ch)) { cin.clear(); cleanInput(); continue; }

        if (ch == 1) {
            AdminModule am;
            if(am.login()) am.menu(); else { cout << "Invalid Admin Credentials.\n"; pause(); }
        }
        else if (ch == 2) {
            FacultyModule fm;
            if(fm.login()) fm.menu(); else { cout << "Invalid Faculty Credentials.\n"; pause(); }
        }
        else if (ch == 3) {
            string r, p; cout << "Roll: "; cin >> r; cout << "Pass: "; cin >> p;
            StudentModule sm;
            if(sm.login(r, p)) sm.menu(); else { cout << "Login Failed.\n"; pause(); }
        }
        else if (ch == 4) return 0;
    }
}