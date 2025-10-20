-- Active: 1759733023739@@127.0.0.1@3306

DROP TABLE student;
CREATE TABLE student(  
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    firstName TEXT,
    lastName TEXT,
    middleName TEXT,
    groupId INTEGER,
    contacts TEXT,
    FOREIGN KEY (groupId) REFERENCES class(id)
);
