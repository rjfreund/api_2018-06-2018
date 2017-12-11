--
-- PostgreSQL database dump
--

-- Dumped from database version 9.6beta1
-- Dumped by pg_dump version 9.6beta1

-- Started on 2016-09-08 14:55:54

SET statement_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;

--
-- TOC entry 4 (class 2615 OID 33009)
-- Name: task-tracker; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA "task-tracker";


ALTER SCHEMA "task-tracker" OWNER TO postgres;

SET search_path = "task-tracker", pg_catalog;

--
-- TOC entry 201 (class 1255 OID 33010)
-- Name: update_modified_column(); Type: FUNCTION; Schema: task-tracker; Owner: postgres
--

CREATE FUNCTION update_modified_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW."modified-date" = (now() at time zone 'utc');
    RETURN NEW;	
END;
$$;


ALTER FUNCTION "task-tracker".update_modified_column() OWNER TO postgres;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- TOC entry 186 (class 1259 OID 33011)
-- Name: categories; Type: TABLE; Schema: task-tracker; Owner: adminz9bkxe1
--

CREATE TABLE categories (
    id integer NOT NULL,
    name text NOT NULL,
    creation_date timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    modified_date timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


ALTER TABLE categories OWNER TO adminz9bkxe1;

--
-- TOC entry 187 (class 1259 OID 33019)
-- Name: categories_id_seq; Type: SEQUENCE; Schema: task-tracker; Owner: adminz9bkxe1
--

CREATE SEQUENCE categories_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE categories_id_seq OWNER TO adminz9bkxe1;

--
-- TOC entry 2206 (class 0 OID 0)
-- Dependencies: 187
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: task-tracker; Owner: adminz9bkxe1
--

ALTER SEQUENCE categories_id_seq OWNED BY categories.id;


--
-- TOC entry 188 (class 1259 OID 33021)
-- Name: prerequisite_tasks; Type: TABLE; Schema: task-tracker; Owner: adminz9bkxe1
--

CREATE TABLE prerequisite_tasks (
    task_id integer NOT NULL,
    prerequisite_task_id integer NOT NULL
);


ALTER TABLE prerequisite_tasks OWNER TO adminz9bkxe1;

--
-- TOC entry 189 (class 1259 OID 33024)
-- Name: prerequisite-tasks_prerequisite-task-id_seq; Type: SEQUENCE; Schema: task-tracker; Owner: adminz9bkxe1
--

CREATE SEQUENCE "prerequisite-tasks_prerequisite-task-id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "prerequisite-tasks_prerequisite-task-id_seq" OWNER TO adminz9bkxe1;

--
-- TOC entry 2207 (class 0 OID 0)
-- Dependencies: 189
-- Name: prerequisite-tasks_prerequisite-task-id_seq; Type: SEQUENCE OWNED BY; Schema: task-tracker; Owner: adminz9bkxe1
--

ALTER SEQUENCE "prerequisite-tasks_prerequisite-task-id_seq" OWNED BY prerequisite_tasks.prerequisite_task_id;


--
-- TOC entry 190 (class 1259 OID 33026)
-- Name: prerequisite-tasks_task-id_seq; Type: SEQUENCE; Schema: task-tracker; Owner: adminz9bkxe1
--

CREATE SEQUENCE "prerequisite-tasks_task-id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "prerequisite-tasks_task-id_seq" OWNER TO adminz9bkxe1;

--
-- TOC entry 2208 (class 0 OID 0)
-- Dependencies: 190
-- Name: prerequisite-tasks_task-id_seq; Type: SEQUENCE OWNED BY; Schema: task-tracker; Owner: adminz9bkxe1
--

ALTER SEQUENCE "prerequisite-tasks_task-id_seq" OWNED BY prerequisite_tasks.task_id;


--
-- TOC entry 191 (class 1259 OID 33028)
-- Name: task_reminders; Type: TABLE; Schema: task-tracker; Owner: adminz9bkxe1
--

CREATE TABLE task_reminders (
    id integer NOT NULL,
    name text NOT NULL,
    datetime time with time zone,
    task_id integer NOT NULL,
    creation_date timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    modified_date timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


ALTER TABLE task_reminders OWNER TO adminz9bkxe1;

--
-- TOC entry 192 (class 1259 OID 33036)
-- Name: reminders_id_seq; Type: SEQUENCE; Schema: task-tracker; Owner: adminz9bkxe1
--

CREATE SEQUENCE reminders_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE reminders_id_seq OWNER TO adminz9bkxe1;

--
-- TOC entry 2209 (class 0 OID 0)
-- Dependencies: 192
-- Name: reminders_id_seq; Type: SEQUENCE OWNED BY; Schema: task-tracker; Owner: adminz9bkxe1
--

ALTER SEQUENCE reminders_id_seq OWNED BY task_reminders.id;


--
-- TOC entry 198 (class 1259 OID 41195)
-- Name: task_attempts; Type: TABLE; Schema: task-tracker; Owner: adminz9bkxe1
--

CREATE TABLE task_attempts (
    id integer NOT NULL,
    task_id integer NOT NULL,
    start_date timestamp with time zone,
    end_date timestamp with time zone,
    is_complete boolean DEFAULT false NOT NULL,
    creation_date timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    modified_date timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    name text,
    location text,
    user_id integer NOT NULL
);


ALTER TABLE task_attempts OWNER TO adminz9bkxe1;

--
-- TOC entry 197 (class 1259 OID 41193)
-- Name: task-attempts_id_seq; Type: SEQUENCE; Schema: task-tracker; Owner: adminz9bkxe1
--

CREATE SEQUENCE "task-attempts_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "task-attempts_id_seq" OWNER TO adminz9bkxe1;

--
-- TOC entry 2210 (class 0 OID 0)
-- Dependencies: 197
-- Name: task-attempts_id_seq; Type: SEQUENCE OWNED BY; Schema: task-tracker; Owner: adminz9bkxe1
--

ALTER SEQUENCE "task-attempts_id_seq" OWNED BY task_attempts.id;


--
-- TOC entry 193 (class 1259 OID 33038)
-- Name: tasks; Type: TABLE; Schema: task-tracker; Owner: adminz9bkxe1
--

CREATE TABLE tasks (
    id integer NOT NULL,
    name text NOT NULL,
    details text,
    parent_task_id integer,
    category_id integer,
    is_complete boolean DEFAULT false NOT NULL,
    creation_date timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    modified_date timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id integer NOT NULL,
    location text,
    assigned_date timestamp with time zone,
    due_date timestamp with time zone,
    is_skipped boolean DEFAULT false NOT NULL,
    depth integer,
    completion_date timestamp with time zone
);


ALTER TABLE tasks OWNER TO adminz9bkxe1;

--
-- TOC entry 194 (class 1259 OID 33046)
-- Name: tasks_id_seq; Type: SEQUENCE; Schema: task-tracker; Owner: adminz9bkxe1
--

CREATE SEQUENCE tasks_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE tasks_id_seq OWNER TO adminz9bkxe1;

--
-- TOC entry 2211 (class 0 OID 0)
-- Dependencies: 194
-- Name: tasks_id_seq; Type: SEQUENCE OWNED BY; Schema: task-tracker; Owner: adminz9bkxe1
--

ALTER SEQUENCE tasks_id_seq OWNED BY tasks.id;


--
-- TOC entry 200 (class 1259 OID 41228)
-- Name: user_signups; Type: TABLE; Schema: task-tracker; Owner: adminz9bkxe1
--

CREATE TABLE user_signups (
    id integer NOT NULL,
    email text,
    password text,
    creation_date timestamp with time zone,
    expiration_date timestamp with time zone,
    first_name text,
    last_name text
);


ALTER TABLE user_signups OWNER TO adminz9bkxe1;

--
-- TOC entry 199 (class 1259 OID 41226)
-- Name: user_signups_id_seq; Type: SEQUENCE; Schema: task-tracker; Owner: adminz9bkxe1
--

CREATE SEQUENCE user_signups_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE user_signups_id_seq OWNER TO adminz9bkxe1;

--
-- TOC entry 2212 (class 0 OID 0)
-- Dependencies: 199
-- Name: user_signups_id_seq; Type: SEQUENCE OWNED BY; Schema: task-tracker; Owner: adminz9bkxe1
--

ALTER SEQUENCE user_signups_id_seq OWNED BY user_signups.id;


--
-- TOC entry 195 (class 1259 OID 33048)
-- Name: users; Type: TABLE; Schema: task-tracker; Owner: adminz9bkxe1
--

CREATE TABLE users (
    id integer NOT NULL,
    username text NOT NULL,
    email text NOT NULL,
    password text,
    salt text
);


ALTER TABLE users OWNER TO adminz9bkxe1;

--
-- TOC entry 196 (class 1259 OID 33054)
-- Name: users_id_seq; Type: SEQUENCE; Schema: task-tracker; Owner: adminz9bkxe1
--

CREATE SEQUENCE users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE users_id_seq OWNER TO adminz9bkxe1;

--
-- TOC entry 2213 (class 0 OID 0)
-- Dependencies: 196
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: task-tracker; Owner: adminz9bkxe1
--

ALTER SEQUENCE users_id_seq OWNED BY users.id;


--
-- TOC entry 2049 (class 2604 OID 33056)
-- Name: categories id; Type: DEFAULT; Schema: task-tracker; Owner: adminz9bkxe1
--

ALTER TABLE ONLY categories ALTER COLUMN id SET DEFAULT nextval('categories_id_seq'::regclass);


--
-- TOC entry 2050 (class 2604 OID 33057)
-- Name: prerequisite_tasks task_id; Type: DEFAULT; Schema: task-tracker; Owner: adminz9bkxe1
--

ALTER TABLE ONLY prerequisite_tasks ALTER COLUMN task_id SET DEFAULT nextval('"prerequisite-tasks_task-id_seq"'::regclass);


--
-- TOC entry 2051 (class 2604 OID 33058)
-- Name: prerequisite_tasks prerequisite_task_id; Type: DEFAULT; Schema: task-tracker; Owner: adminz9bkxe1
--

ALTER TABLE ONLY prerequisite_tasks ALTER COLUMN prerequisite_task_id SET DEFAULT nextval('"prerequisite-tasks_prerequisite-task-id_seq"'::regclass);


--
-- TOC entry 2063 (class 2604 OID 41198)
-- Name: task_attempts id; Type: DEFAULT; Schema: task-tracker; Owner: adminz9bkxe1
--

ALTER TABLE ONLY task_attempts ALTER COLUMN id SET DEFAULT nextval('"task-attempts_id_seq"'::regclass);


--
-- TOC entry 2054 (class 2604 OID 33059)
-- Name: task_reminders id; Type: DEFAULT; Schema: task-tracker; Owner: adminz9bkxe1
--

ALTER TABLE ONLY task_reminders ALTER COLUMN id SET DEFAULT nextval('reminders_id_seq'::regclass);


--
-- TOC entry 2057 (class 2604 OID 33060)
-- Name: tasks id; Type: DEFAULT; Schema: task-tracker; Owner: adminz9bkxe1
--

ALTER TABLE ONLY tasks ALTER COLUMN id SET DEFAULT nextval('tasks_id_seq'::regclass);


--
-- TOC entry 2065 (class 2604 OID 41231)
-- Name: user_signups id; Type: DEFAULT; Schema: task-tracker; Owner: adminz9bkxe1
--

ALTER TABLE ONLY user_signups ALTER COLUMN id SET DEFAULT nextval('user_signups_id_seq'::regclass);


--
-- TOC entry 2060 (class 2604 OID 33061)
-- Name: users id; Type: DEFAULT; Schema: task-tracker; Owner: adminz9bkxe1
--

ALTER TABLE ONLY users ALTER COLUMN id SET DEFAULT nextval('users_id_seq'::regclass);


--
-- TOC entry 2067 (class 2606 OID 33063)
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: task-tracker; Owner: adminz9bkxe1
--

ALTER TABLE ONLY categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- TOC entry 2069 (class 2606 OID 33065)
-- Name: prerequisite_tasks prerequisite-tasks_pkey; Type: CONSTRAINT; Schema: task-tracker; Owner: adminz9bkxe1
--

ALTER TABLE ONLY prerequisite_tasks
    ADD CONSTRAINT "prerequisite-tasks_pkey" PRIMARY KEY (task_id, prerequisite_task_id);


--
-- TOC entry 2071 (class 2606 OID 33067)
-- Name: task_reminders reminders_pkey; Type: CONSTRAINT; Schema: task-tracker; Owner: adminz9bkxe1
--

ALTER TABLE ONLY task_reminders
    ADD CONSTRAINT reminders_pkey PRIMARY KEY (id);


--
-- TOC entry 2077 (class 2606 OID 41200)
-- Name: task_attempts task-attempts_pkey; Type: CONSTRAINT; Schema: task-tracker; Owner: adminz9bkxe1
--

ALTER TABLE ONLY task_attempts
    ADD CONSTRAINT "task-attempts_pkey" PRIMARY KEY (id);


--
-- TOC entry 2073 (class 2606 OID 33069)
-- Name: tasks tasks_pkey; Type: CONSTRAINT; Schema: task-tracker; Owner: adminz9bkxe1
--

ALTER TABLE ONLY tasks
    ADD CONSTRAINT tasks_pkey PRIMARY KEY (id);


--
-- TOC entry 2079 (class 2606 OID 41236)
-- Name: user_signups user_signups_pkey; Type: CONSTRAINT; Schema: task-tracker; Owner: adminz9bkxe1
--

ALTER TABLE ONLY user_signups
    ADD CONSTRAINT user_signups_pkey PRIMARY KEY (id);


--
-- TOC entry 2075 (class 2606 OID 33071)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: task-tracker; Owner: adminz9bkxe1
--

ALTER TABLE ONLY users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 2080 (class 2606 OID 33074)
-- Name: task_reminders reminders_task-id_fkey; Type: FK CONSTRAINT; Schema: task-tracker; Owner: adminz9bkxe1
--

ALTER TABLE ONLY task_reminders
    ADD CONSTRAINT "reminders_task-id_fkey" FOREIGN KEY (task_id) REFERENCES tasks(id);


--
-- TOC entry 2084 (class 2606 OID 41201)
-- Name: task_attempts task-attempts_task-id_fkey; Type: FK CONSTRAINT; Schema: task-tracker; Owner: adminz9bkxe1
--

ALTER TABLE ONLY task_attempts
    ADD CONSTRAINT "task-attempts_task-id_fkey" FOREIGN KEY (task_id) REFERENCES tasks(id);


--
-- TOC entry 2081 (class 2606 OID 33079)
-- Name: tasks tasks_category-id_fkey; Type: FK CONSTRAINT; Schema: task-tracker; Owner: adminz9bkxe1
--

ALTER TABLE ONLY tasks
    ADD CONSTRAINT "tasks_category-id_fkey" FOREIGN KEY (category_id) REFERENCES categories(id);


--
-- TOC entry 2082 (class 2606 OID 33084)
-- Name: tasks tasks_parent-task-id_fkey; Type: FK CONSTRAINT; Schema: task-tracker; Owner: adminz9bkxe1
--

ALTER TABLE ONLY tasks
    ADD CONSTRAINT "tasks_parent-task-id_fkey" FOREIGN KEY (parent_task_id) REFERENCES tasks(id);


--
-- TOC entry 2083 (class 2606 OID 33089)
-- Name: tasks tasks_user-id_fkey; Type: FK CONSTRAINT; Schema: task-tracker; Owner: adminz9bkxe1
--

ALTER TABLE ONLY tasks
    ADD CONSTRAINT "tasks_user-id_fkey" FOREIGN KEY (user_id) REFERENCES users(id);


-- Completed on 2016-09-08 14:55:55

--
-- PostgreSQL database dump complete
--

