<<<<<<< HEAD
-- Active: 1759733023739@@127.0.0.1@3306
-- Active: 1759733023739@@127.0.0.1@3306-- Active: 1759733023739@@127.0.0.1@3306
=======
>>>>>>> 330b348f03856cc6f74ad8ca7deb92a108cf7b4e

DROP TABLE student;
CREATE TABLE student(  
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    firstName TEXT,
    lastName TEXT,
    middleName TEXT,
    groupId INTEGER,
    FOREIGN KEY (groupId) REFERENCES class(id)
);
