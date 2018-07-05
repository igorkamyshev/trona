CREATE TABLE $EVOLUTIONS (
    id INTEGER NOT NULL,
    checksum VARCHAR(32) NOT NULL,
    down_script TEXT NOT NULL,
    primary key (id)
);
