

CREATE TABLE waiters
(
    id serial  NOT NULL,
    name text NOT NULL,
    CONSTRAINT waiters_pkey PRIMARY KEY (id)
);


CREATE TABLE weekdays
(
    id integer NOT NULL,
    weekdays text NOT NULL,
    CONSTRAINT weekdays_pkey PRIMARY KEY (id)
);

CREATE TABLE shifts
(
    waiter_id integer,
    weekday_id integer,
    CONSTRAINT shifts_waiter_id_fkey FOREIGN KEY (waiter_id)
        REFERENCES waiters (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT shifts_weekday_id_fkey FOREIGN KEY (weekday_id)
        REFERENCES weekdays (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
);


insert into weekdays (id,weekday) values (0,'Monday');
insert into weekdays (id,weekday) values (1,'Tuesday');
insert into weekdays (id,weekday) values (2,'Wednesday');
insert into weekdays (id,weekday) values (3,'Thursday');
insert into weekdays (id,weekday) values (4,'Friday');
insert into weekdays (id,weekday) values (5,'Saturday');
insert into weekdays (id,weekday) values (6,'Sunday');


insert into waiters (name) values ('Kim');
insert into waiters (name) values ('Jim');
insert into waiters (name) values ('Rick');
insert into waiters (name) values ('Morty');
insert into waiters (name) values ('Sama');
insert into waiters (name) values ('Bart');