--
-- PostgreSQL database dump
--

SET statement_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;

--
-- Name: task-tracker; Type: SCHEMA; Schema: -; Owner: adminz9bkxe1
--

CREATE SCHEMA "task-tracker";


ALTER SCHEMA "task-tracker" OWNER TO adminz9bkxe1;

SET search_path = "task-tracker", pg_catalog;

--
-- Name: update_modified_column(); Type: FUNCTION; Schema: task-tracker; Owner: adminz9bkxe1
--

CREATE FUNCTION update_modified_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW."modified-date" = (now() at time zone 'utc');
    RETURN NEW;	
END;
$$;


ALTER FUNCTION "task-tracker".update_modified_column() OWNER TO adminz9bkxe1;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: prerequisite_tasks; Type: TABLE; Schema: task-tracker; Owner: adminz9bkxe1; Tablespace: 
--

CREATE TABLE prerequisite_tasks (
    task_id integer NOT NULL,
    prerequisite_task_id integer NOT NULL
);


ALTER TABLE "task-tracker".prerequisite_tasks OWNER TO adminz9bkxe1;

--
-- Name: prerequisite-tasks_prerequisite-task-id_seq; Type: SEQUENCE; Schema: task-tracker; Owner: adminz9bkxe1
--

CREATE SEQUENCE "prerequisite-tasks_prerequisite-task-id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "task-tracker"."prerequisite-tasks_prerequisite-task-id_seq" OWNER TO adminz9bkxe1;

--
-- Name: prerequisite-tasks_prerequisite-task-id_seq; Type: SEQUENCE OWNED BY; Schema: task-tracker; Owner: adminz9bkxe1
--

ALTER SEQUENCE "prerequisite-tasks_prerequisite-task-id_seq" OWNED BY prerequisite_tasks.prerequisite_task_id;


--
-- Name: prerequisite-tasks_task-id_seq; Type: SEQUENCE; Schema: task-tracker; Owner: adminz9bkxe1
--

CREATE SEQUENCE "prerequisite-tasks_task-id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "task-tracker"."prerequisite-tasks_task-id_seq" OWNER TO adminz9bkxe1;

--
-- Name: prerequisite-tasks_task-id_seq; Type: SEQUENCE OWNED BY; Schema: task-tracker; Owner: adminz9bkxe1
--

ALTER SEQUENCE "prerequisite-tasks_task-id_seq" OWNED BY prerequisite_tasks.task_id;


--
-- Name: task_reminders; Type: TABLE; Schema: task-tracker; Owner: adminz9bkxe1; Tablespace: 
--

CREATE TABLE task_reminders (
    id integer NOT NULL,
    name text NOT NULL,
    datetime time with time zone,
    task_id integer NOT NULL,
    creation_date timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    modified_date timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


ALTER TABLE "task-tracker".task_reminders OWNER TO adminz9bkxe1;

--
-- Name: reminders_id_seq; Type: SEQUENCE; Schema: task-tracker; Owner: adminz9bkxe1
--

CREATE SEQUENCE reminders_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "task-tracker".reminders_id_seq OWNER TO adminz9bkxe1;

--
-- Name: reminders_id_seq; Type: SEQUENCE OWNED BY; Schema: task-tracker; Owner: adminz9bkxe1
--

ALTER SEQUENCE reminders_id_seq OWNED BY task_reminders.id;


--
-- Name: tags; Type: TABLE; Schema: task-tracker; Owner: adminz9bkxe1; Tablespace: 
--

CREATE TABLE tags (
    id integer NOT NULL,
    name text NOT NULL,
    color text,
    parent_tag_id integer
);


ALTER TABLE "task-tracker".tags OWNER TO adminz9bkxe1;

--
-- Name: tags_id_seq; Type: SEQUENCE; Schema: task-tracker; Owner: adminz9bkxe1
--

CREATE SEQUENCE tags_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "task-tracker".tags_id_seq OWNER TO adminz9bkxe1;

--
-- Name: tags_id_seq; Type: SEQUENCE OWNED BY; Schema: task-tracker; Owner: adminz9bkxe1
--

ALTER SEQUENCE tags_id_seq OWNED BY tags.id;


--
-- Name: task_attempts; Type: TABLE; Schema: task-tracker; Owner: adminz9bkxe1; Tablespace: 
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


ALTER TABLE "task-tracker".task_attempts OWNER TO adminz9bkxe1;

--
-- Name: task-attempts_id_seq; Type: SEQUENCE; Schema: task-tracker; Owner: adminz9bkxe1
--

CREATE SEQUENCE "task-attempts_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "task-tracker"."task-attempts_id_seq" OWNER TO adminz9bkxe1;

--
-- Name: task-attempts_id_seq; Type: SEQUENCE OWNED BY; Schema: task-tracker; Owner: adminz9bkxe1
--

ALTER SEQUENCE "task-attempts_id_seq" OWNED BY task_attempts.id;


--
-- Name: task_tags; Type: TABLE; Schema: task-tracker; Owner: adminz9bkxe1; Tablespace: 
--

CREATE TABLE task_tags (
    task_id integer NOT NULL,
    tag_id integer NOT NULL
);


ALTER TABLE "task-tracker".task_tags OWNER TO adminz9bkxe1;

--
-- Name: tasks; Type: TABLE; Schema: task-tracker; Owner: adminz9bkxe1; Tablespace: 
--

CREATE TABLE tasks (
    id integer NOT NULL,
    name text NOT NULL,
    details text,
    category_id integer,
    is_complete boolean DEFAULT false NOT NULL,
    creation_date timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    modified_date timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id integer NOT NULL,
    location text,
    assigned_date timestamp with time zone,
    due_date timestamp with time zone,
    is_skipped boolean DEFAULT false NOT NULL,
    completion_date timestamp with time zone
);


ALTER TABLE "task-tracker".tasks OWNER TO adminz9bkxe1;

--
-- Name: tasks_id_seq; Type: SEQUENCE; Schema: task-tracker; Owner: adminz9bkxe1
--

CREATE SEQUENCE tasks_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "task-tracker".tasks_id_seq OWNER TO adminz9bkxe1;

--
-- Name: tasks_id_seq; Type: SEQUENCE OWNED BY; Schema: task-tracker; Owner: adminz9bkxe1
--

ALTER SEQUENCE tasks_id_seq OWNED BY tasks.id;


--
-- Name: user_signups; Type: TABLE; Schema: task-tracker; Owner: adminz9bkxe1; Tablespace: 
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


ALTER TABLE "task-tracker".user_signups OWNER TO adminz9bkxe1;

--
-- Name: user_signups_id_seq; Type: SEQUENCE; Schema: task-tracker; Owner: adminz9bkxe1
--

CREATE SEQUENCE user_signups_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "task-tracker".user_signups_id_seq OWNER TO adminz9bkxe1;

--
-- Name: user_signups_id_seq; Type: SEQUENCE OWNED BY; Schema: task-tracker; Owner: adminz9bkxe1
--

ALTER SEQUENCE user_signups_id_seq OWNED BY user_signups.id;


--
-- Name: users; Type: TABLE; Schema: task-tracker; Owner: adminz9bkxe1; Tablespace: 
--

CREATE TABLE users (
    id integer NOT NULL,
    email text NOT NULL,
    password text,
    creation_date timestamp with time zone,
    first_name text,
    last_name text
);


ALTER TABLE "task-tracker".users OWNER TO adminz9bkxe1;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: task-tracker; Owner: adminz9bkxe1
--

CREATE SEQUENCE users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "task-tracker".users_id_seq OWNER TO adminz9bkxe1;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: task-tracker; Owner: adminz9bkxe1
--

ALTER SEQUENCE users_id_seq OWNED BY users.id;


--
-- Name: task_id; Type: DEFAULT; Schema: task-tracker; Owner: adminz9bkxe1
--

ALTER TABLE ONLY prerequisite_tasks ALTER COLUMN task_id SET DEFAULT nextval('"prerequisite-tasks_task-id_seq"'::regclass);


--
-- Name: prerequisite_task_id; Type: DEFAULT; Schema: task-tracker; Owner: adminz9bkxe1
--

ALTER TABLE ONLY prerequisite_tasks ALTER COLUMN prerequisite_task_id SET DEFAULT nextval('"prerequisite-tasks_prerequisite-task-id_seq"'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: task-tracker; Owner: adminz9bkxe1
--

ALTER TABLE ONLY tags ALTER COLUMN id SET DEFAULT nextval('tags_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: task-tracker; Owner: adminz9bkxe1
--

ALTER TABLE ONLY task_attempts ALTER COLUMN id SET DEFAULT nextval('"task-attempts_id_seq"'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: task-tracker; Owner: adminz9bkxe1
--

ALTER TABLE ONLY task_reminders ALTER COLUMN id SET DEFAULT nextval('reminders_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: task-tracker; Owner: adminz9bkxe1
--

ALTER TABLE ONLY tasks ALTER COLUMN id SET DEFAULT nextval('tasks_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: task-tracker; Owner: adminz9bkxe1
--

ALTER TABLE ONLY user_signups ALTER COLUMN id SET DEFAULT nextval('user_signups_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: task-tracker; Owner: adminz9bkxe1
--

ALTER TABLE ONLY users ALTER COLUMN id SET DEFAULT nextval('users_id_seq'::regclass);


--
-- Name: prerequisite-tasks_pkey; Type: CONSTRAINT; Schema: task-tracker; Owner: adminz9bkxe1; Tablespace: 
--

ALTER TABLE ONLY prerequisite_tasks
    ADD CONSTRAINT "prerequisite-tasks_pkey" PRIMARY KEY (task_id, prerequisite_task_id);


--
-- Name: reminders_pkey; Type: CONSTRAINT; Schema: task-tracker; Owner: adminz9bkxe1; Tablespace: 
--

ALTER TABLE ONLY task_reminders
    ADD CONSTRAINT reminders_pkey PRIMARY KEY (id);


--
-- Name: tags_pkey; Type: CONSTRAINT; Schema: task-tracker; Owner: adminz9bkxe1; Tablespace: 
--

ALTER TABLE ONLY tags
    ADD CONSTRAINT tags_pkey PRIMARY KEY (id);


--
-- Name: task-attempts_pkey; Type: CONSTRAINT; Schema: task-tracker; Owner: adminz9bkxe1; Tablespace: 
--

ALTER TABLE ONLY task_attempts
    ADD CONSTRAINT "task-attempts_pkey" PRIMARY KEY (id);


--
-- Name: task_tags_pkey; Type: CONSTRAINT; Schema: task-tracker; Owner: adminz9bkxe1; Tablespace: 
--

ALTER TABLE ONLY task_tags
    ADD CONSTRAINT task_tags_pkey PRIMARY KEY (tag_id, task_id);


--
-- Name: tasks_pkey; Type: CONSTRAINT; Schema: task-tracker; Owner: adminz9bkxe1; Tablespace: 
--

ALTER TABLE ONLY tasks
    ADD CONSTRAINT tasks_pkey PRIMARY KEY (id);


--
-- Name: user_signups_email_key; Type: CONSTRAINT; Schema: task-tracker; Owner: adminz9bkxe1; Tablespace: 
--

ALTER TABLE ONLY user_signups
    ADD CONSTRAINT user_signups_email_key UNIQUE (email);


--
-- Name: user_signups_pkey; Type: CONSTRAINT; Schema: task-tracker; Owner: adminz9bkxe1; Tablespace: 
--

ALTER TABLE ONLY user_signups
    ADD CONSTRAINT user_signups_pkey PRIMARY KEY (id);


--
-- Name: users_email_key; Type: CONSTRAINT; Schema: task-tracker; Owner: adminz9bkxe1; Tablespace: 
--

ALTER TABLE ONLY users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users_pkey; Type: CONSTRAINT; Schema: task-tracker; Owner: adminz9bkxe1; Tablespace: 
--

ALTER TABLE ONLY users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: reminders_task-id_fkey; Type: FK CONSTRAINT; Schema: task-tracker; Owner: adminz9bkxe1
--

ALTER TABLE ONLY task_reminders
    ADD CONSTRAINT "reminders_task-id_fkey" FOREIGN KEY (task_id) REFERENCES tasks(id);


--
-- Name: task-attempts_task-id_fkey; Type: FK CONSTRAINT; Schema: task-tracker; Owner: adminz9bkxe1
--

ALTER TABLE ONLY task_attempts
    ADD CONSTRAINT "task-attempts_task-id_fkey" FOREIGN KEY (task_id) REFERENCES tasks(id);


--
-- Name: tasks_user-id_fkey; Type: FK CONSTRAINT; Schema: task-tracker; Owner: adminz9bkxe1
--

ALTER TABLE ONLY tasks
    ADD CONSTRAINT "tasks_user-id_fkey" FOREIGN KEY (user_id) REFERENCES users(id);


--
-- PostgreSQL database dump complete
--

