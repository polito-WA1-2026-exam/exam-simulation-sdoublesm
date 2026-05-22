function Course(code, name, credits, maxStudents, preparatoryCourse, enrolled) {
    this.code = code;
    this.name = name;
    this.credits = credits;
    this.maxStudents = maxStudents;
    this.preparatoryCourse = preparatoryCourse;
    this.incompatible = [];
    this.enrolled = enrolled === undefined ? 0 : enrolled;
}

function Student(code, email, name, surname, planType) {
    this.studentId = studentId;
    this.email = email;
    this.name = name;
    this.surname = surname;
    this.planType = planType;
}

export {Course, Student}